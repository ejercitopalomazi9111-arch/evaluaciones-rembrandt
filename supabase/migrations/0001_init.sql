-- ============================================================================
--  EXAMEN DE ADMISIÓN A BACHILLERATO — Instituto Rembrandt — Esquema inicial
--  Pega TODO este archivo en: Supabase -> tu proyecto -> SQL Editor -> Run.
--  Es seguro re-ejecutarlo (usa IF NOT EXISTS / ON CONFLICT / guardas).
--
--  MODELO (enfocado):
--   · Aspirante  -> entra con un CÓDIGO de un solo uso, contesta UNA vez el
--                   examen completo (5 materias). NO ve su calificación, solo
--                   "examen enviado correctamente".
--   · Coordinación -> inicia sesión (Supabase Auth); revisa resultados, gestiona
--                   aspirantes/códigos, banco de preguntas y configuración.
--   La calificación se hace EN EL SERVIDOR; el aspirante nunca recibe la
--   respuesta correcta (las preguntas se entregan vía RPC sin el campo 'correct').
-- ============================================================================

-- ----------------------------------------------------------------------------
--  TABLAS
-- ----------------------------------------------------------------------------

-- Materias del examen (5)
create table if not exists subjects (
  id        text primary key,           -- 'matematicas', 'lectura', ...
  name      text not null,
  icon      text not null default '',
  position  int  not null default 0
);

-- Perfiles del personal (1 fila por usuario de Supabase Auth)
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  role       text not null default 'coordinator',  -- 'coordinator'
  created_at timestamptz not null default now()
);

-- Banco de preguntas (incluye la respuesta correcta -> NUNCA se expone al aspirante)
create table if not exists questions (
  id         uuid primary key default gen_random_uuid(),
  subject_id text not null references subjects(id) on delete cascade,
  position   int  not null default 0,
  text       text not null default '',
  options    jsonb not null default '["","","",""]'::jsonb,  -- 4 opciones
  correct    int  not null default 0,                        -- 0..3
  updated_at timestamptz not null default now()
);
create index if not exists idx_questions_subject on questions(subject_id, position);

-- Resultados de los aspirantes
create table if not exists results (
  id            uuid primary key default gen_random_uuid(),
  folio         text not null,
  student_name  text not null,
  origin        text default '',          -- escuela de procedencia
  contact_email text default '',
  hits          int not null,
  total         int not null,
  pct           int not null,
  grade         numeric not null,
  level         text not null,            -- nivel de desempeño
  per           jsonb not null default '{}'::jsonb,  -- {subject_id:{hits,total}}
  created_at    timestamptz not null default now()
);
create index if not exists idx_results_date on results(created_at desc);

-- Lista de aspirantes (roster) — pre-registrados por Coordinación, código de 1 uso
create table if not exists students (
  id            uuid primary key default gen_random_uuid(),
  code          text unique,             -- se autogenera si va vacío
  full_name     text not null,
  origin        text default '',
  contact_email text default '',
  status        text not null default 'pending', -- pending | completed
  result_id     uuid references results(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_students_status on students(status);

-- Configuración (una sola fila)
create table if not exists config (
  id             int primary key default 1,
  school         text not null default 'Instituto Rembrandt de Querétaro',
  subtitle       text not null default 'Examen de Admisión · Bachillerato · Ciclo 2026-2027',
  period         text not null default '2026-2027',
  director       text not null default 'Dra. Blanca Ortiz Morales',
  director_title text not null default 'Dirección Académica',
  pass           int  not null default 60,
  escala         int  not null default 10,
  logo_url       text default '',
  shuffle        boolean not null default true,  -- baraja el ORDEN de las preguntas
  time_limit     int not null default 40,        -- minutos; 0 = sin límite
  constraint singleton check (id = 1)
);
insert into config (id) values (1) on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
--  FUNCIÓN AUXILIAR DE PERMISOS (security definer evita recursión en RLS)
-- ----------------------------------------------------------------------------
create or replace function is_coordinator()
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'coordinator');
$$;

-- ----------------------------------------------------------------------------
--  TRIGGERS
-- ----------------------------------------------------------------------------

-- Crear perfil automáticamente al registrarse un usuario (queda como coordinador).
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'coordinator')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Autogenerar un código único de acceso al insertar un aspirante sin código.
create or replace function set_student_code()
returns trigger language plpgsql set search_path = public as $$
declare c text; chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if new.code is null or length(trim(new.code)) = 0 then
    loop
      c := '';
      for i in 1..6 loop c := c || substr(chars, 1 + floor(random()*length(chars))::int, 1); end loop;
      exit when not exists (select 1 from students where code = c);
    end loop;
    new.code := c;
  else
    new.code := upper(trim(new.code));
  end if;
  return new;
end; $$;

drop trigger if exists trg_student_code on students;
create trigger trg_student_code
  before insert on students
  for each row execute function set_student_code();

-- ----------------------------------------------------------------------------
--  RPC PÚBLICO 1: validar código y entregar el examen (SIN respuestas correctas)
-- ----------------------------------------------------------------------------
create or replace function start_exam(p_code text)
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare v_st students; v_questions jsonb; v_cfg config;
begin
  select * into v_st from students where code = upper(trim(p_code));
  if v_st.id is null then raise exception 'CODE_INVALID'; end if;
  if v_st.status = 'completed' then raise exception 'CODE_USED'; end if;

  select coalesce(jsonb_agg(
           jsonb_build_object('id', q.id, 'subject_id', q.subject_id,
                              'text', q.text, 'options', q.options)
           order by q.subject_id, q.position), '[]'::jsonb)
    into v_questions from questions q;

  select * into v_cfg from config where id = 1;

  return jsonb_build_object(
    'student_name', v_st.full_name,
    'school', v_cfg.school,
    'subtitle', v_cfg.subtitle,
    'shuffle', v_cfg.shuffle,
    'time_limit', v_cfg.time_limit,
    'questions', v_questions);
end; $$;

-- ----------------------------------------------------------------------------
--  RPC PÚBLICO 2: enviar respuestas, CALIFICAR EN EL SERVIDOR, guardar y
--  BLOQUEAR el código. El aspirante NO recibe calificación (solo confirmación).
--  p_answers = { "<id_pregunta>": <indice 0..3>, ... }
-- ----------------------------------------------------------------------------
create or replace function submit_exam(p_code text, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_st students; v_total int; v_hits int; v_pct int; v_grade numeric;
  v_level text; v_pass int; v_escala int; v_per jsonb; v_folio text; v_id uuid;
begin
  select * into v_st from students where code = upper(trim(p_code)) for update;
  if v_st.id is null then raise exception 'CODE_INVALID'; end if;
  if v_st.status = 'completed' then raise exception 'CODE_USED'; end if;

  with graded as (
    select q.subject_id,
           ( (p_answers ->> q.id::text) ~ '^[0-3]$'
             and (p_answers ->> q.id::text)::int = q.correct ) as ok
    from questions q
  )
  select count(*)::int, count(*) filter (where ok)::int
    into v_total, v_hits from graded;

  if v_total = 0 then raise exception 'NO_QUESTIONS'; end if;

  with graded as (
    select q.subject_id,
           ( (p_answers ->> q.id::text) ~ '^[0-3]$'
             and (p_answers ->> q.id::text)::int = q.correct ) as ok
    from questions q
  )
  select coalesce(jsonb_object_agg(subject_id,
            jsonb_build_object('hits', h, 'total', t)), '{}'::jsonb)
    into v_per
    from (select subject_id, count(*) filter (where ok) as h, count(*) as t
          from graded group by subject_id) z;

  select pass, escala into v_pass, v_escala from config where id = 1;
  v_pct   := round(v_hits::numeric / v_total * 100);
  v_grade := round(v_pct::numeric / 100 * coalesce(v_escala,10), 1);
  v_level := case
    when v_pct >= 90 then 'Sobresaliente'
    when v_pct >= 70 then 'Satisfactorio'
    when v_pct >= coalesce(v_pass,60) then 'Básico'
    else 'Insuficiente' end;

  v_folio := 'ADM-' || to_char(now(),'YYMMDD') || '-' || upper(substr(md5(random()::text),1,5));
  v_id := gen_random_uuid();

  insert into results(id, folio, student_name, origin, contact_email,
                      hits, total, pct, grade, level, per)
  values (v_id, v_folio, v_st.full_name, v_st.origin, v_st.contact_email,
          v_hits, v_total, v_pct, v_grade, v_level, v_per);

  update students set status = 'completed', result_id = v_id where id = v_st.id;

  -- El aspirante solo recibe confirmación; NADA de calificación.
  return jsonb_build_object('ok', true);
end; $$;

-- ----------------------------------------------------------------------------
--  RLS (Row Level Security)
-- ----------------------------------------------------------------------------
alter table subjects  enable row level security;
alter table profiles  enable row level security;
alter table questions enable row level security;
alter table results   enable row level security;
alter table students  enable row level security;
alter table config    enable row level security;

-- SUBJECTS: lectura pública; solo coordinación modifica
drop policy if exists subjects_read on subjects;
create policy subjects_read on subjects for select using (true);
drop policy if exists subjects_write on subjects;
create policy subjects_write on subjects for all
  using (is_coordinator()) with check (is_coordinator());

-- PROFILES: cada quien ve el suyo; coordinación ve/edita todos
drop policy if exists profiles_read on profiles;
create policy profiles_read on profiles for select
  using (id = auth.uid() or is_coordinator());
drop policy if exists profiles_write on profiles;
create policy profiles_write on profiles for all
  using (is_coordinator()) with check (is_coordinator());

-- QUESTIONS: SOLO coordinación (incluye la respuesta correcta).
-- El aspirante recibe las preguntas vía start_exam() (sin 'correct').
drop policy if exists q_all on questions;
create policy q_all on questions for all
  using (is_coordinator()) with check (is_coordinator());

-- RESULTS: solo coordinación lee/borra. Los inserta el RPC (security definer).
drop policy if exists r_read on results;
create policy r_read on results for select using (is_coordinator());
drop policy if exists r_delete on results;
create policy r_delete on results for delete using (is_coordinator());

-- STUDENTS (roster): solo coordinación. El aspirante nunca consulta esta tabla
-- directamente (usa los RPC).
drop policy if exists st_all on students;
create policy st_all on students for all
  using (is_coordinator()) with check (is_coordinator());

-- CONFIG: lectura pública (examen/constancia); solo coordinación edita
drop policy if exists cfg_read on config;
create policy cfg_read on config for select using (true);
drop policy if exists cfg_write on config;
create policy cfg_write on config for update
  using (is_coordinator()) with check (is_coordinator());

-- ----------------------------------------------------------------------------
--  PERMISOS de ejecución para los RPC públicos (aspirante = rol anon)
-- ----------------------------------------------------------------------------
grant execute on function start_exam(text)         to anon, authenticated;
grant execute on function submit_exam(text, jsonb) to anon, authenticated;

-- ----------------------------------------------------------------------------
--  SEMILLA: 5 materias + 50 preguntas reales (nivel ingreso a bachillerato).
--  Solo se siembran si la tabla de preguntas está vacía.
-- ----------------------------------------------------------------------------
insert into subjects(id, name, icon, position) values
  ('matematicas','Matemáticas',         '📐',1),
  ('lectura',    'Lectura y Redacción', '📖',2),
  ('fisica',     'Física',              '🔭',3),
  ('quimica',    'Química',             '⚗️',4),
  ('biologia',   'Biología',            '🧬',5)
on conflict (id) do nothing;

do $$
begin
if not exists (select 1 from questions) then

  insert into questions(subject_id, position, text, options, correct) values
  ('matematicas',1,'¿Cuánto es el 15% de 240?','["24","36","360","16"]',1),
  ('matematicas',2,'Resuelve la ecuación 3x − 7 = 14. ¿Cuánto vale x?','["7","3","21","−7"]',0),
  ('matematicas',3,'¿Cuál es el área de un triángulo con base de 8 cm y altura de 5 cm?','["40 cm²","13 cm²","20 cm²","26 cm²"]',2),
  ('matematicas',4,'¿Cuál es el resultado de 2³ + 3²?','["13","17","36","72"]',1),
  ('matematicas',5,'Si 4 lápices cuestan $12, ¿cuánto cuestan 7 lápices al mismo precio?','["$28","$21","$19","$24"]',1),
  ('matematicas',6,'Simplifica la fracción 18/24 a su mínima expresión.','["3/4","9/12","2/3","6/8"]',0),
  ('matematicas',7,'¿Cuál es el perímetro de un cuadrado cuyo lado mide 9 cm?','["18 cm","81 cm","36 cm","45 cm"]',2),
  ('matematicas',8,'¿Cuál es el resultado de (−5) + (−3) − (−2)?','["−10","−6","−4","0"]',1),
  ('matematicas',9,'¿Cuál de los siguientes números es primo?','["21","27","29","33"]',2),
  ('matematicas',10,'En la recta y = 2x + 1, ¿cuánto vale y cuando x = 3?','["5","6","7","9"]',2),

  ('lectura',1,'¿Cuál de las siguientes palabras está escrita correctamente?','["esepción","excepción","ecepción","exepción"]',1),
  ('lectura',2,'¿Cuál es el antónimo de «efímero»?','["breve","pasajero","duradero","frágil"]',2),
  ('lectura',3,'¿Cuál de las siguientes oraciones es correcta?','["Espero que halla buenas noticias.","Espero que haya buenas noticias.","Ojalá halla mucha paz.","No creo que halla nadie."]',1),
  ('lectura',4,'En la oración «Caminaba rápidamente», la palabra «rápidamente» es un:','["adjetivo","sustantivo","adverbio","verbo"]',2),
  ('lectura',5,'¿Cuál es un sinónimo de «abundante»?','["escaso","copioso","vacío","breve"]',1),
  ('lectura',6,'¿Cuál de estas palabras agudas lleva acento (tilde)?','["reloj","cantar","café","feliz"]',2),
  ('lectura',7,'Lee el texto: «La lectura constante mejora el vocabulario, la ortografía y la concentración. Quien lee con frecuencia comprende mejor lo que escucha y se expresa con más claridad.» Según el texto, ¿cuál de estos beneficios NO se menciona?','["Mejora el vocabulario","Mejora la ortografía","Aumenta la estatura","Mejora la concentración"]',2),
  ('lectura',8,'¿Para qué se usa principalmente la coma?','["Para terminar una idea completa","Para separar elementos de una enumeración","Para indicar una pregunta","Para unir dos textos largos"]',1),
  ('lectura',9,'En la oración «Los niños juegan en el parque», ¿cuál es el sujeto?','["juegan","en el parque","Los niños","parque"]',2),
  ('lectura',10,'¿Cuál de las siguientes palabras es un sustantivo?','["correr","azul","libertad","rápido"]',2),

  ('fisica',1,'¿Cuál es la unidad de fuerza en el Sistema Internacional?','["Joule","Newton","Watt","Pascal"]',1),
  ('fisica',2,'¿Cómo se calcula la rapidez (velocidad) media?','["fuerza × masa","distancia ÷ tiempo","masa ÷ volumen","tiempo × distancia"]',1),
  ('fisica',3,'¿Cuál de las siguientes es una magnitud escalar?','["fuerza","velocidad","temperatura","aceleración"]',2),
  ('fisica',4,'Si un automóvil recorre 100 m en 5 s, ¿cuál es su rapidez?','["5 m/s","20 m/s","500 m/s","0.05 m/s"]',1),
  ('fisica',5,'¿Cómo se llama la energía que tiene un cuerpo por estar en movimiento?','["potencial","cinética","térmica","química"]',1),
  ('fisica',6,'¿Cuál es la unidad de la corriente eléctrica?','["volt","ohm","ampere","watt"]',2),
  ('fisica',7,'El valor aproximado de la aceleración de la gravedad en la Tierra es:','["9.8 m/s²","1 m/s²","100 m/s²","980 m/s²"]',0),
  ('fisica',8,'¿Qué instrumento se usa para medir la temperatura?','["barómetro","termómetro","dinamómetro","amperímetro"]',1),
  ('fisica',9,'La primera ley de Newton también se conoce como la ley de la:','["gravedad","inercia","acción y reacción","energía"]',1),
  ('fisica',10,'La luz se propaga en el vacío a una velocidad aproximada de:','["300 km/s","3 000 km/s","300 000 km/s","30 km/s"]',2),

  ('quimica',1,'¿Cuál es el símbolo químico del oxígeno?','["Ox","O","Og","Os"]',1),
  ('quimica',2,'El agua (H₂O) está formada por hidrógeno y:','["carbono","oxígeno","nitrógeno","helio"]',1),
  ('quimica',3,'¿Cuáles son los tres estados de agregación de la materia más comunes?','["sólido, líquido y plasma","sólido, líquido y gaseoso","líquido, gaseoso y plasma","sólido, gaseoso y coloide"]',1),
  ('quimica',4,'¿Cómo se llama el cambio de estado de líquido a gas?','["fusión","evaporación","condensación","solidificación"]',1),
  ('quimica',5,'¿Cuál partícula del átomo tiene carga negativa?','["protón","neutrón","electrón","núcleo"]',2),
  ('quimica',6,'Una sustancia con un pH de 2 se considera:','["básica","neutra","ácida","salina"]',2),
  ('quimica',7,'La tabla periódica organiza los:','["compuestos","elementos químicos","minerales","mezclas"]',1),
  ('quimica',8,'El símbolo «Na» corresponde al elemento:','["nitrógeno","sodio","níquel","neón"]',1),
  ('quimica',9,'¿Cómo se llama una mezcla en la que no se distinguen sus componentes a simple vista?','["heterogénea","homogénea","compuesta","saturada"]',1),
  ('quimica',10,'¿Cómo se llama el cambio de estado de gas a líquido?','["sublimación","condensación","fusión","evaporación"]',1),

  ('biologia',1,'¿Cuál es la unidad básica de los seres vivos?','["el átomo","la célula","el tejido","el órgano"]',1),
  ('biologia',2,'¿Qué seres vivos realizan principalmente la fotosíntesis?','["los animales","las plantas","los hongos","los virus"]',1),
  ('biologia',3,'¿Qué órgano se encarga de bombear la sangre por el cuerpo?','["el pulmón","el hígado","el corazón","el riñón"]',2),
  ('biologia',4,'¿En qué parte de la célula se encuentra principalmente el ADN?','["la membrana","el citoplasma","el núcleo","la pared celular"]',2),
  ('biologia',5,'¿Cómo se llaman los seres vivos que fabrican su propio alimento?','["heterótrofos","autótrofos","carnívoros","parásitos"]',1),
  ('biologia',6,'¿Cuál es la función principal del sistema respiratorio?','["digerir los alimentos","el intercambio de gases","bombear la sangre","producir hormonas"]',1),
  ('biologia',7,'¿Cuál de los siguientes animales es un mamífero?','["el tiburón","la ballena","el cocodrilo","el salmón"]',1),
  ('biologia',8,'¿Qué estructura tiene la célula vegetal que la célula animal no posee?','["el núcleo","la pared celular","la membrana","el citoplasma"]',1),
  ('biologia',9,'¿Cómo se llama el conjunto formado por los seres vivos y el ambiente donde habitan?','["población","ecosistema","especie","individuo"]',1),
  ('biologia',10,'¿Cuál es la función principal de los glóbulos rojos?','["defender contra infecciones","transportar oxígeno","coagular la sangre","digerir nutrientes"]',1);

end if;
end $$;

-- ============================================================================
--  LISTO. Pasos finales:
--   1) Authentication -> Users -> "Add user": crea el usuario de Coordinación
--      (correo + contraseña). El trigger lo deja como 'coordinator'.
--   2) (Opcional) Verifica:  select * from profiles;
--   3) En tu app (Vercel/local) define las variables:
--        NEXT_PUBLIC_SUPABASE_URL,  NEXT_PUBLIC_SUPABASE_ANON_KEY
-- ============================================================================
