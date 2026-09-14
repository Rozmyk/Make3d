import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@make3d/geometry", "@make3d/types", "@make3d/validation"],
  experimental: {
    useTypeScriptCli: false,
  },
  webpack(config, { webpack }) {
    // manifold-3d conditionally imports this Node-only module. The browser worker never enters that branch.
    config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^node:module$/ }));
    return config;
  },
};

export default nextConfig;
