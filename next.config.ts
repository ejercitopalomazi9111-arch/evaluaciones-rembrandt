import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del proyecto (evita que Next infiera otra por lockfiles vecinos).
  turbopack: { root: __dirname },
};

export default nextConfig;
