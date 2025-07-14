import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude fsevents and nunjucks from server-side bundle
      config.externals = config.externals || [];
      config.externals.push('fsevents');
      config.externals.push('nunjucks');
    }
    
    // Ignore nunjucks and fsevents in client-side builds
    config.resolve.alias = {
      ...config.resolve.alias,
      nunjucks: false,
      fsevents: false,
    };
    
    return config;
  },
  devIndicators: false,
  // Exclude Perplexica directory entirely from build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
