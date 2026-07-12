import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // O vision board aceita imagens de qualquer origem HTTPS informada pelo usuário.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
