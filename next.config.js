/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/api/(.*)",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET,HEAD,POST,OPTIONS,DELETE",
        },
        { key: "Access-Control-Max-Age", value: "86400" },
      ],
    },
  ],
  experimental: {
    appDir: true,
    typedRoutes: true,
  },
};

module.exports = nextConfig;
