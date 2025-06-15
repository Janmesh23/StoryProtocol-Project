"use client"

import { useState } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { StoryClient } from "@story-protocol/core-sdk"
import { custom } from "viem"
import { Coins, User, DollarSign, Loader2 } from "lucide-react"

export default function MintLicenseTokens({ ipId, licenseTermsId }) {
  const { address, isConnected } = useAccount()
  const { data: wallet } = useWalletClient()
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [minted, setMinted] = useState(false)
  const [licenseTokenIds, setLicenseTokenIds] = useState([])

  const [form, setForm] = useState({
    receiver: address || "",
    amount: 1,
    maxMintingFee: 0,
    maxRevenueShare: 100,
  })

  const handleMintLicense = async () => {
    if (!isConnected || !wallet) {
      setStatus("🔌 Please connect your wallet")
      return
    }

    if (!ipId || !licenseTermsId) {
      setStatus("❌ IP ID and License Terms ID are required")
      return
    }

    if (!form.receiver || form.amount < 1) {
      setStatus("❌ Please fill in all required fields")
      return
    }

    setLoading(true)
    setStatus("🚀 Minting license tokens...")

    try {
      const client = StoryClient.newClient({
        wallet,
        transport: custom(wallet.transport),
        chainId: "aeneid",
      })

      const response = await client.license.mintLicenseTokens({
        licenseTermsId: licenseTermsId,
        licensorIpId: ipId,
        receiver: form.receiver,
        amount: Number.parseInt(form.amount),
        maxMintingFee: BigInt(form.maxMintingFee),
        maxRevenueShare: Number.parseInt(form.maxRevenueShare),
      })

      setStatus(`✅ License tokens minted successfully! TX: ${response.txHash}`)
      setLicenseTokenIds(response.licenseTokenIds || [])
      setMinted(true)

      console.log("✨ License minting result:", response)
    } catch (err) {
      console.error("🔥 License minting failed:", err)
      setStatus(`❌ Failed to mint license: ${err.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
          <div className="flex items-center space-x-3">
            <Coins className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Mint License Tokens</h2>
              <p className="text-green-100 mt-1">Create transferable license tokens for your IP</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {minted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Coins className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">License Tokens Minted</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Successfully minted {form.amount} license token(s)</p>
                    {licenseTokenIds.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Token IDs:</p>
                        <div className="font-mono text-xs space-y-1">
                          {licenseTokenIds.map((tokenId, index) => (
                            <p key={index}>#{tokenId}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">License Token Details</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>
                    <strong>IP ID:</strong> <span className="font-mono text-xs">{ipId}</span>
                  </p>
                  <p>
                    <strong>License Terms ID:</strong> <span className="font-mono text-xs">{licenseTermsId}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Receiver Address *
                  </label>
                  <input
                    type="text"
                    name="receiver"
                    value={form.receiver}
                    onChange={handleChange}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Coins className="w-4 h-4 inline mr-1" />
                      Amount *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Max Minting Fee
                    </label>
                    <input
                      type="number"
                      name="maxMintingFee"
                      value={form.maxMintingFee}
                      onChange={handleChange}
                      min="0"
                      step="0.001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Revenue Share (%)</label>
                  <input
                    type="number"
                    name="maxRevenueShare"
                    value={form.maxRevenueShare}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleMintLicense}
                disabled={loading || !isConnected || !ipId || !licenseTermsId}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Minting Tokens...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5 mr-2" />
                    <span>Mint License Tokens</span>
                  </>
                )}
              </button>
            </div>
          )}

          {status && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                status.includes("✅")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : status.includes("❌")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
              }`}
            >
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
