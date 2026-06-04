-- ============================================================================
--  SISTEMA DE EVALUACIONES DIAGNÓSTICAS — Esquema inicial
--  Pega TODO este archivo en: Supabase → tu proyecto → SQL Editor → Run.
--  Es seguro re-ejecutarlo (usa IF NOT EXISTS / ON CONFLICT / guardas).
--
--  MODELO:
--   · Alumno  -> entra con un CÓDIGO ÚNICO de un solo uso, contesta UNA vez,
--               NO ve su calificación ni constancia (solo "enviado correctamente").
--   · Profesor-> login; ve/edita SOLO su materia y sus resultados.
--   · Coordinadora -> login; acceso TOTAL.
--  La calificación se hace EN EL SERVIDOR; el alumno nunca ve la respuesta correcta.
-- ============================================================================

-- ----------------------------------------------------------------------------
--  TIPOS
-- ----------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('coordinator','teacher');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
--  TABLAS
-- ----------------------------------------------------------------------------

-- Materias (5)
create table if not exists subjects (
  id        text primary key,           -- 'matematicas', 'quimica', ...
  name      text not null,
  icon      text not null default '',
  position  int  not null default 0
);

-- Perfiles del personal (1 fila por usuario de auth)
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null default '',
  role       user_role not null default 'teacher',
  created_at timestamptz not null default now()
);

-- Qué materias administra cada profesor (la coordinadora ve todas)
create table if not exists teacher_subjects (
  profile_id uuid references profiles(id) on delete cascade,
  subject_id text references subjects(id) on delete cascade,
  primary key (profile_id, subject_id)
);

-- Banco de preguntas (incluye la respuesta correcta -> NUNCA se expone al alumno)
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

-- Resultados de los alumnos
create table if not exists results (
  id            uuid primary key default gen_random_uuid(),
  folio         text not null,
  student_name  text not null,
  student_group text default '',
  tutor_email   text default '',
  student_email text default '',
  mode          text not null,            -- id de materia, o 'all'
  subject_label text not null,
  hits          int not null,
  total         int not null,
  pct           int not null,
  grade         numeric not null,
  level         text not null,
  per           jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists idx_results_mode on results(mode);
create index if not exists idx_results_date on results(created_at desc);

-- LISTA DE ALUMNOS (roster) — pre-registrados por el staff, con código de 1 uso
create table if not exists students (
  id            uuid primary key default gen_random_uuid(),
  code          text unique,             -- se autogenera si va vacío
  full_name     text not null,
  student_group text default '',
  tutor_email   text default '',
  student_email text default '',
  mode          text not null default 'all',     -- materia asignada o 'all'
  status        text not null default 'pending', -- pending | completed
  result_id     uuid references results(id) on delete set null,
  created_by    uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_students_status on students(status);

-- Configuración (una sola fila)
create table if not exists config (
  id             int primary key default 1,
  school         text not null default 'Nombre de la Escuela',
  subtitle       text not null default 'Evaluación Diagnóstica · Ciclo 2025-2026',
  director       text not null default 'Nombre del Director(a)',
  director_title text not null default 'Dirección Escolar',
  pass           int  not null default 60,
  logo_url       text default '',
  shuffle        boolean not null default true,
  time_limit     int not null default 0,    -- minutos por examen; 0 = sin límite
  constraint singleton check (id = 1)
);
insert into config (id) values (1) on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
--  FUNCIONES AUXILIARES DE PERMISOS (security definer evita recursión en RLS)
-- ----------------------------------------------------------------------------
create or replace function is_coordinator()
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'coordinator');
$$;

create or replace function is_staff()
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid());
$$;

create or replace function teaches_subject(s text)
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from teacher_subjects where profile_id = auth.uid() and subject_id = s);
$$;

-- ----------------------------------------------------------------------------
--  TRIGGERS
-- ----------------------------------------------------------------------------

-- Crear perfil automáticamente al registrarse un usuario del staff
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'teacher')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Autogenerar un código único de acceso al insertar un alumno sin código
create or replace function set_student_code()
returns trigger language plpgsql set search_path = public as $$
declare c text;
begin
  if new.code is null or length(trim(new.code)) = 0 then
    loop
      c := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
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
drop function if exists get_exam(text);
create or replace function start_exam(p_code text)
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare v_st students; v_questions jsonb;
begin
  select * into v_st from students where code = upper(trim(p_code));
  if v_st.id is null then
    raise exception 'CODE_INVALID';     -- código no existe
  end if;
  if v_st.status = 'completed' then
    raise exception 'CODE_USED';        -- ya contestó
  end if;

  select coalesce(jsonb_agg(
           jsonb_build_object('id', q.id, 'subject_id', q.subject_id,
                              'text', q.text, 'options', q.options)
           order by q.subject_id, q.position), '[]'::jsonb)
    into v_questions
    from questions q
   where v_st.mode = 'all' or q.subject_id = v_st.mode;

  return jsonb_build_object(
    'student_name', v_st.full_name,
    'group', v_st.student_group,
    'mode', v_st.mode,
    'questions', v_questions);
end; $$;

-- ----------------------------------------------------------------------------
--  RPC PÚBLICO 2: enviar respuestas, CALIFICAR EN EL SERVIDOR, guardar y
--  BLOQUEAR el código. El alumno NO recibe calificación (solo confirmación).
--  p_answers = { "<id_pregunta>": <indice 0..3>, ... }
-- ----------------------------------------------------------------------------
drop function if exists submit_exam(text, text, text, jsonb);
create or replace function submit_exam(p_code text, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_st students; v_total int; v_hits int; v_pct int; v_grade numeric;
  v_level text; v_pass int; v_per jsonb; v_folio text; v_label text; v_id uuid;
begin
  select * into v_st from students where code = upper(trim(p_code)) for update;
  if v_st.id is null then raise exception 'CODE_INVALID'; end if;
  if v_st.status = 'completed' then raise exception 'CODE_USED'; end if;

  with graded as (
    select q.subject_id,
           ( (p_answers ->> q.id::text) ~ '^[0-3]$'
             and (p_answers ->> q.id::text)::int = q.correct ) as ok
    from questions q
    where v_st.mode = 'all' or q.subject_id = v_st.mode
  )
  select count(*)::int, count(*) filter (where ok)::int
    into v_total, v_hits from graded;

  if v_total = 0 then raise exception 'NO_QUESTIONS'; end if;

  with graded as (
    select q.subject_id,
           ( (p_answers ->> q.id::text) ~ '^[0-3]$'
             and (p_answers ->> q.id::text)::int = q.correct ) as ok
    from questions q
    where v_st.mode = 'all' or q.subject_id = v_st.mode
  )
  select coalesce(jsonb_object_agg(subject_id,
            jsonb_build_object('hits', h, 'total', t)), '{}'::jsonb)
    into v_per
    from (select subject_id, count(*) filter (where ok) as h, count(*) as t
          from graded group by subject_id) z;

  v_pct   := round(v_hits::numeric / v_total * 100);
  v_grade := v_pct;
  select pass into v_pass from config where id = 1;
  v_level := case
    when v_pct >= 90 then 'Sobresaliente'
    when v_pct >= 70 then 'Satisfactorio'
    when v_pct >= coalesce(v_pass,60) then 'Básico'
    else 'Insuficiente' end;

  v_label := case when v_st.mode = 'all' then 'Examen completo'
    else coalesce((select name from subjects where id = v_st.mode), v_st.mode) end;
  v_folio := 'F' || to_char(now(),'YYMMDD') || '-' || upper(substr(md5(random()::text),1,5));
  v_id := gen_random_uuid();

  insert into results(id, folio, student_name, student_group, tutor_email, student_email,
                      mode, subject_label, hits, total, pct, grade, level, per)
  values (v_id, v_folio, v_st.full_name, v_st.student_group, v_st.tutor_email, v_st.student_email,
          v_st.mode, v_label, v_hits, v_total, v_pct, v_grade, v_level, v_per);

  update students set status = 'completed', result_id = v_id where id = v_st.id;

  -- El alumno solo recibe confirmación; NADA de calificación.
  return jsonb_build_object('ok', true);
end; $$;

-- ----------------------------------------------------------------------------
--  RLS (Row Level Security)
-- ----------------------------------------------------------------------------
alter table subjects         enable row level security;
alter table profiles         enable row level security;
alter table teacher_subjects enable row level security;
alter table questions        enable row level security;
alter table results          enable row level security;
alter table students         enable row level security;
alter table config           enable row level security;

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

-- TEACHER_SUBJECTS: el profe ve sus asignaciones; coordinación administra
drop policy if exists ts_read on teacher_subjects;
create policy ts_read on teacher_subjects for select
  using (profile_id = auth.uid() or is_coordinator());
drop policy if exists ts_write on teacher_subjects;
create policy ts_write on teacher_subjects for all
  using (is_coordinator()) with check (is_coordinator());

-- QUESTIONS: SOLO personal (con respuesta correcta). El alumno usa start_exam().
drop policy if exists q_read on questions;
create policy q_read on questions for select
  using (is_coordinator() or teaches_subject(subject_id));
drop policy if exists q_write on questions;
create policy q_write on questions for all
  using (is_coordinator() or teaches_subject(subject_id))
  with check (is_coordinator() or teaches_subject(subject_id));

-- RESULTS: coordinación todo; profesor los de su materia. Inserta el RPC.
drop policy if exists r_read on results;
create policy r_read on results for select
  using (is_coordinator() or teaches_subject(mode));
drop policy if exists r_delete on results;
create policy r_delete on results for delete using (is_coordinator());

-- STUDENTS (roster): cualquier miembro del staff lo ve y puede registrar alumnos;
--   editar/borrar solo coordinación o quien lo creó.
drop policy if exists st_read on students;
create policy st_read on students for select using (is_staff());
drop policy if exists st_insert on students;
create policy st_insert on students for insert
  with check (is_staff() and (created_by = auth.uid() or created_by is null));
drop policy if exists st_update on students;
create policy st_update on students for update
  using (is_coordinator() or created_by = auth.uid())
  with check (is_coordinator() or created_by = auth.uid());
drop policy if exists st_delete on students;
create policy st_delete on students for delete
  using (is_coordinator() or created_by = auth.uid());

-- CONFIG: lectura pública (examen/constancia); solo coordinación edita
drop policy if exists cfg_read on config;
create policy cfg_read on config for select using (true);
drop policy if exists cfg_write on config;
create policy cfg_write on config for update
  using (is_coordinator()) with check (is_coordinator());

-- ----------------------------------------------------------------------------
--  PERMISOS de ejecución para los RPC públicos (alumno = rol anon)
-- ----------------------------------------------------------------------------
grant execute on function start_exam(text)         to anon, authenticated;
grant execute on function submit_exam(text, jsonb) to anon, authenticated;

-- ----------------------------------------------------------------------------
--  SEMILLA: 5 materias + 20 preguntas placeholder c/u (solo si está vacío)
-- ----------------------------------------------------------------------------
insert into subjects(id, name, icon, position) values
  ('matematicas','Matemáticas',        '📐',1),
  ('quimica',    'Química',             '⚗️',2),
  ('biologia',   'Biología',            '🧬',3),
  ('lectura',    'Lectura y Redacción', '📖',4),
  ('fisica',     'Física',              '🔭',5)
on conflict (id) do nothing;

do $$
declare s record; i int;
begin
  if not exists (select 1 from questions) then
    for s in select id, name from subjects order by position loop
      for i in 1..20 loop
        insert into questions(subject_id, position, text, options, correct)
        values (s.id, i,
          s.name || ' — Pregunta ' || i || ' (placeholder, edítala en el panel)',
          '["Opción A","Opción B","Opción C","Opción D"]'::jsonb,
          (i-1) % 4);
      end loop;
    end loop;
  end if;
end $$;

-- ============================================================================
--  LISTO. Después de crear tu PRIMER usuario (Authentication → Users → Add user),
--  conviértelo en coordinadora (cambia el correo):
--
--    update profiles set role = 'coordinator'
--    where id = (select id from auth.users where email = 'coordinadora@escuela.com');
-- ============================================================================
