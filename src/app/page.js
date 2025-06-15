"use client"

import { useWalletClient, useAccount } from "wagmi"
import { StoryClient } from "@story-protocol/core-sdk"
import { custom } from "viem"
import FameDashboard from "./reputation.js"
import DesignUploadForm from "./components/DesignUploadForm.js"
import MyDesigns from "./components/MyDesigns.js"
import RoyaltyManager from "./components/RoyaltyManager.js"
import AllDesigns from "./components/AllDesigns.js"
import Hero from "./components/Hero"
import FeaturedDesigns from "./components/FeaturedDesigns"
import Stats from "./components/Stats"
import HowItWorks from "./components/HowItWorks"

export default function Home() {
  const { data: wallet } = useWalletClient()
  const { isConnected } = useAccount()

  async function setupStoryClient() {
    if (!wallet) {
      console.error("Wallet not connected")
      return null
    }

    const config = {
      wallet,
      transport: custom(wallet.transport),
      chainId: "aeneid",
    }

    return StoryClient.newClient(config)
  }

  async function registerIp() {
    console.log("Register IP called")
  }

  async function registerLicenseTerms() {
    console.log("Register License Terms called")
  }

  async function attachLicenseTerms() {
    console.log("Attach License Terms called")
  }

  async function mintLicenseToken() {
    console.log("Mint License Token called")
  }

  async function fetchLicenseTerms() {
    const client = StoryClient.newClient({
      wallet,
      transport: custom(wallet.transport),
      chainId: "aeneid",
    })
  }

  return (
    <div className="space-y-16">
      <Hero />
      <Stats />
      <HowItWorks />
      <FeaturedDesigns />

      <div className="p-4 space-y-8">
        <h1 className="text-3xl font-bold mb-6">🎨 Vogue - Story Protocol NFT Platform</h1>

        {/* Upload Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Create New Design</h2>
          <DesignUploadForm />
        </section>

        {/* My Designs Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">My Designs</h2>
          <MyDesigns />
        </section>

        {/* Royalty Management Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Royalty Management</h2>
          <RoyaltyManager />
        </section>

        {/* Reputation Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Reputation Dashboard</h2>
          <FameDashboard />
        </section>

        <AllDesigns />

        {/* Developer Tools */}
        <section className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Developer Tools</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={registerIp} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Register IP
            </button>

            <button
              onClick={registerLicenseTerms}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Register License Terms
            </button>

            <button
              onClick={attachLicenseTerms}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Attach License Terms
            </button>

            <button
              onClick={mintLicenseToken}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Mint License Token
            </button>

            <button onClick={fetchLicenseTerms} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
              Get License Terms
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
