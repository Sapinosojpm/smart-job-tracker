import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["gsap", "@gsap/react"],
  serverExternalPackages: ["playwright", "playwright-core"],
};

export default nextConfig;
