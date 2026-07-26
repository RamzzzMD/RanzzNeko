/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Thumbnails come from arbitrary upstream CDNs whose hostnames we don't
    // control, so we skip the Next image optimizer entirely. This means no
    // remotePatterns allowlist is needed and any host will render.
    unoptimized: true,
  },
};

export default nextConfig;
