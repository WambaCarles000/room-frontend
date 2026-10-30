/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "192.168.1.107",
    "http://192.168.1.107:3001",
    "127.0.0.1",
    "localhost",
  ],
  devIndicators: false,
};

export default nextConfig;
