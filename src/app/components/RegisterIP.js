"use client"

import { useState, useEffect } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { StoryClient } from "@story-protocol/core-sdk"
import { custom, toHex } from "viem"
import AttachLicenseTerms from "./AttachLicenseTerms"
import LoadingSpinner from "./LoadingSpinner"

export default function RegisterIP({ tokenId }) {
  const { address, isConnected } = useAccount()
  const { data: wallet } = useWalletClient()
  const [status, setStatus] = useState("")
  const [ipId, setIpId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)

  // Use environment variable
  const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT || "0xB0C116b665a174f15a49A534028bc1F3f4609a18"

  const [form, setForm] = useState({
    nftContract: NFT_CONTRACT,
    tokenId: tokenId || "",
    name: "",
    description: "",
    creator: "",
    licenseTags: "",
    nftMetadataURI: "",
  })

  // Check if the token is already registered as an IP
  useEffect(() => {
    const checkIfRegistered = async () => {
      if (!wallet || !isConnected || !tokenId) {
        setLoading(false)
        return
      }

      try {
        const client = StoryClient.newClient({
          wallet,
          transport: custom(wallet.transport),
          chainId: "aeneid",
        })

        const result = await client.ipAsset.getIpAssetByNft({
          nftContract: NFT_CONTRACT,
          tokenId: BigInt(tokenId),
        })

        if (result?.ipId) {
          setAlreadyRegistered(true)
          setIpId(result.ipId)
          setStatus(`🔒 Already registered with IP ID: ${result.ipId}`)
        } else {
          setAlreadyRegistered(false)
        }
      } catch (err) {
        console.log("📭 Not registered yet.")
        setAlreadyRegistered(false)
      } finally {
        setLoading(false)
      }
    }

    checkIfRegistered()
  }, [wallet, isConnected, tokenId])

  const handleRegister = async () => {
    if (!isConnected || !wallet) {
      setStatus("🔌 Please connect your wallet")
      return
    }

    if (!form.nftMetadataURI || !form.name || !form.description) {
      setStatus("❌ Please fill in all required fields")
      return
    }

    setRegistering(true)
    setStatus("🚀 Registering on Story Protocol...")

    try {
      const client = await StoryClient.newClient({
        wallet,
        transport: custom(wallet.transport),
        chainId: "aeneid",
      })

      const result = await client.ipAsset.register({
        nftContract: NFT_CONTRACT,
        tokenId: BigInt(tokenId),
        ipMetadata: {
          ipMetadataURI: form.nftMetadataURI,
          ipMetadataHash: toHex("ip-metadata-hash", { size: 32 }),
          nftMetadataURI: form.nftMetadataURI,
          nftMetadataHash: toHex("nft-metadata-hash", { size: 32 }),
        },
      })

      setIpId(result.ipId)
      setAlreadyRegistered(true)
      setStatus(`✅ Successfully registered with IP ID: ${result.ipId}`)
      console.log("✨ Story Protocol Registration:", result)
    } catch (err) {
      console.error("🔥 Registration failed:", err)
      setStatus(`❌ Registration failed: ${err.message || "Unknown error"}`)
    } finally {
      setRegistering(false)
    }
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Checking registration status...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <h2 className="text-2xl font-bold text-white">Register IP Asset</h2>
          <p className="text-purple-100 mt-2">Token #{tokenId}</p>
        </div>

        <div className="p-6">
          {alreadyRegistered ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Already Registered</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>This design is registered as an IP asset.</p>
                      <p className="font-mono text-xs mt-1 break-all">IP ID: {ipId}</p>
                    </div>
                  </div>
                </div>
              </div>
              <AttachLicenseTerms ipId={ipId} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NFT Metadata URI *</label>
                  <input
                    type="text"
                    name="nftMetadataURI"
                    value={form.nftMetadataURI}
                    onChange={handleChange}
                    placeholder="https://ipfs.io/ipfs/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IP Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Fashion Design Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your fashion design..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Creator Name</label>
                  <input
                    type="text"
                    name="creator"
                    value={form.creator}
                    onChange={handleChange}
                    placeholder="Your name or brand"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Tags</label>
                  <input
                    type="text"
                    name="licenseTags"
                    value={form.licenseTags}
                    onChange={handleChange}
                    placeholder="commercial, remix, attribution (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={registering || !isConnected}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {registering ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Registering...</span>
                  </>
                ) : (
                  "Register IP Asset"
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
                    : "bg-blue-50 text-blue-700 border border-blue-200"
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
