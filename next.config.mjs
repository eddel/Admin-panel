/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "reeplay.s3.us-east-1.amazonaws.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
