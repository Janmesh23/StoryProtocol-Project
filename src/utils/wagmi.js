"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains"

// Define custom chain for Story Protocol testnet
const storyTestnet = {
  id: 1513,
  name: "Story Protocol Testnet",
  network: "story-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "IP",
    symbol: "IP",
  },
  rpcUrls: {
    public: { http: ["https://testnet.storyrpc.io"] },
    default: { http: ["https://testnet.storyrpc.io"] },
  },
  blockExplorers: {
    default: { name: "Story Explorer", url: "https://testnet.storyscan.xyz" },
  },
}

export const config = getDefaultConfig({
  appName: "Vogue Vision",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id",
  chains: [storyTestnet, mainnet, polygon, optimism, arbitrum, base],
  ssr: false,
})
