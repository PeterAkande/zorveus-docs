import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/resources/examples',
        destination: '/code-labs/overview',
        permanent: true,
      },
      {
        source: '/getting-started/byok-quickstart',
        destination: '/startups/provider-credentials',
        permanent: true,
      },
    ];
  },
};

export default withMDX(config);
