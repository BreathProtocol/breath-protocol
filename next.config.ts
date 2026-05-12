import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Web3Auth (and any OAuth popup flow) needs the opener window to
        // be able to `window.closed`-poll the popup. The browser's default
        // Cross-Origin-Opener-Policy blocks that, which produces the
        // "Cross-Origin-Opener-Policy policy would block the window.closed
        // call" warning, and Web3Auth's `connect()` resolves with no public
        // key. `same-origin-allow-popups` is the standard relaxation.
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
        ],
      },
    ];
  },
};

export default nextConfig;
