import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/app',
        destination: 'https://apps.apple.com/us/app/sticker-me-ai/id6760326016',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
