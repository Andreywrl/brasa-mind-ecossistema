/** @type {import('@vercel/config/v1').VercelConfig} */
export const config = {
  framework: "nextjs",
  installCommand: "pnpm install",
  regions: ["gru1"],
  headers: [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=0, must-revalidate",
        },
      ],
    },
  ],
};
