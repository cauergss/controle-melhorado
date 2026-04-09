import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Permitir acesso via rede
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Permissões de CORS para acesso ao dev server de outros hosts na rede
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '10.0.0.55', // IP específico do cliente
    // Adicione mais IPs conforme necessário
  ],
};

export default nextConfig;
