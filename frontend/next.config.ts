/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ATENÇÃO: Isso permite que o build termine mesmo com erros de tipo.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Isso ignora avisos do ESLint durante o build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;