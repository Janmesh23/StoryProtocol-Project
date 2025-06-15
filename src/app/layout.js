import { Inter } from "next/font/google"
import "./globals.css"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config } from "../utils/wagmi"
import Navbar from "./components/Navbar"

const inter = Inter({ subsets: ["latin"] })
const queryClient = new QueryClient()

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Vogue Vision - Fashion IP Platform</title>
        <meta name="description" content="Decentralized fashion innovation platform powered by Story Protocol" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <div className="min-h-screen">
                <Navbar />
                <main className="container mx-auto px-4 py-8">{children}</main>
              </div>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
