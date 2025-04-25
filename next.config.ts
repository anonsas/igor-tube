import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "c6nf4zu2l6.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
