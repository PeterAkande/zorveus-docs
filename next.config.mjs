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
        source: '/startups/billing-integration',
        destination: '/startups/credit-grants#grant-credits-after-a-payment',
        permanent: true,
      },
      {
        source: '/oauth/authorization-request',
        destination: '/oauth/token-exchange#start-authorization',
        permanent: true,
      },
      {
        source: '/oauth/consent-and-caps',
        destination: '/oauth/register-an-app#spending-caps',
        permanent: true,
      },
      {
        source: '/oauth/reauthorization',
        destination: '/oauth/revocation#reauthorize-a-user',
        permanent: true,
      },
      {
        source: '/oauth/testing-draft-apps',
        destination: '/oauth/app-review#test-users',
        permanent: true,
      },
      {
        source: '/oauth/errors',
        destination: '/oauth/app-review#oauth-errors',
        permanent: true,
      },
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
