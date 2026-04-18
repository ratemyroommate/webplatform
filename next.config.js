/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
        protocol: "https",
      },
      {
        hostname: "static.vecteezy.com",
        protocol: "https",
      },
      {
        hostname: "utfs.io",
        protocol: "https",
      },
      {
        hostname: "platform-lookaside.fbsbx.com",
      },
    ],
  },
};

export default withNextIntl(config);
