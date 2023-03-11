/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/api/(.*)",
      headers: [
        // Ensure other website (web games) can query the API
        { key: "Access-Control-Allow-Origin", value: "*" },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET,HEAD,POST,OPTIONS,DELETE",
        },
        { key: "Access-Control-Max-Age", value: "86400" },
        // Ensure Cloudflare & Vercel do not cache API responses
        { key: "Cache-Control", value: "no-store" },
      ],
    },
  ],
  experimental: {
    appDir: true,
    typedRoutes: true,
  },
};

module.exports = nextConfig;
