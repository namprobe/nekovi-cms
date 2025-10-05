/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "localhost",
        port: "7252",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
