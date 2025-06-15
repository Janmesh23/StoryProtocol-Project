"use client"

import { useState, useEffect } from "react"
import { useAccount, useWriteContract } from "wagmi"
import { readContract } from "@wagmi/core"
import { NFT_CONTRACT } from "../../contract_data/constants"
import { abi } from "../../contract_data/CreatorReputationABI"
import { Palette, Layers, Sparkles, ArrowRight } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"

export default function RemixPage() {
  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const [selectedDesign, setSelectedDesign] = useState(null)
  const [remixData, setRemixData] = useState({
    name: "",
    description: "",
    modifications: "",
  })
  const [step, setStep] = useState(1) // 1: Select, 2: Customize, 3: Mint
  const [loading, setLoading] = useState(false)
  const [designs, setDesigns] = useState([])

  const fetchDesigns = async () => {
    try {
      const total = await readContract({
        address: NFT_CONTRACT,
        abi: abi,
        functionName: "getTotalDesigns",
        chainId: "aeneid",
      })

      const designPromises = []
      for (let i = 1; i <= Number(total); i++) {
        designPromises.push(fetchSingleDesign(i))
      }

      const allDesigns = await Promise.all(designPromises)
      setDesigns(allDesigns.filter(Boolean))
    } catch (err) {
      console.error("Error fetching designs:", err)
    }
  }

  const fetchSingleDesign = async (tokenId) => {
    try {
      const [design, uri] = await Promise.all([
        readContract({
          address: NFT_CONTRACT,
          abi: abi,
          functionName: "getDesign",
          args: [tokenId],
          chainId: "aeneid",
        }),
        readContract({
          address: NFT_CONTRACT,
          abi: abi,
          functionName: "tokenURI",
          args: [tokenId],
          chainId: "aeneid",
        }),
      ])

      const res = await fetch(uri)
      const metadata = await res.json()

      return {
        tokenId,
        metadata,
        creator: design[1],
        isOriginal: design[3],
      }
    } catch (err) {
      return null
    }
  }

  const handleSelectDesign = (design) => {
    setSelectedDesign(design)
    setStep(2)
  }

  const handleRemixSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDesign || !remixData.name || !remixData.description) {
      alert("Please fill all required fields")
      return
    }

    try {
      setLoading(true)

      // Create remix metadata
      const remixMetadata = {
        name: remixData.name,
        description: remixData.description,
        image: selectedDesign.metadata.image, // In real app, this would be the modified image
        original_design: selectedDesign.tokenId,
        creator: address,
        modifications: remixData.modifications,
        created_at: new Date().toISOString(),
        attributes: [
          {
            trait_type: "Creator",
            value: address,
          },
          {
            trait_type: "Type",
            value: "Remix",
          },
          {
            trait_type: "Original Design",
            value: selectedDesign.tokenId.toString(),
          },
        ],
      }

      // Upload metadata to IPFS (simplified - using mock URL)
      const metadataURI = `https://mock-ipfs.com/${Date.now()}`

      // Mint remix NFT
      await writeContractAsync({
        address: NFT_CONTRACT,
        abi: abi,
        functionName: "mintRemix",
        args: [selectedDesign.tokenId, metadataURI],
      })

      alert("🎉 Remix created successfully!")

      // Reset form
      setSelectedDesign(null)
      setRemixData({ name: "", description: "", modifications: "" })
      setStep(1)
    } catch (err) {
      console.error("Error creating remix:", err)
      alert("Failed to create remix. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDesigns()
  }, [])

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Palette className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            Connect your wallet to start remixing fashion designs and earn royalties.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Remix Studio</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select an existing design and create your own unique remix. Original creators automatically earn royalties
          from your remix.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step >= 1 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="font-medium">Select Design</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step >= 2 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span className="font-medium">Customize</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              step >= 3 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Mint Remix</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Design */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Design to Remix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <div
                key={design.tokenId}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleSelectDesign(design)}
              >
                <div className="relative">
                  <img
                    src={design.metadata.image || "/placeholder.svg?height=256&width=384"}
                    alt={design.metadata.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                        Select for Remix
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{design.metadata.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{design.metadata.description}</p>
                  <p className="text-xs text-gray-500">
                    By {design.creator.slice(0, 6)}...{design.creator.slice(-4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Customize Remix */}
      {step === 2 && selectedDesign && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Customize Your Remix</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Original Design Preview */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Original Design</h3>
                <div className="border rounded-xl overflow-hidden">
                  <img
                    src={selectedDesign.metadata.image || "/placeholder.svg?height=300&width=400"}
                    alt={selectedDesign.metadata.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-medium text-gray-800">{selectedDesign.metadata.name}</h4>
                    <p className="text-sm text-gray-600">{selectedDesign.metadata.description}</p>
                  </div>
                </div>
              </div>

              {/* Remix Form */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Your Remix Details</h3>
                <form onSubmit={handleRemixSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remix Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your remix name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={remixData.name}
                      onChange={(e) => setRemixData({ ...remixData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      placeholder="Describe your remix and what makes it unique..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      value={remixData.description}
                      onChange={(e) => setRemixData({ ...remixData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modifications Made</label>
                    <textarea
                      placeholder="Describe the changes you made to the original design..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      value={remixData.modifications}
                      onChange={(e) => setRemixData({ ...remixData, modifications: e.target.value })}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !remixData.name || !remixData.description}
                      className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                        loading || !remixData.name || !remixData.description
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg"
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <LoadingSpinner size="sm" />
                          <span>Creating Remix...</span>
                        </div>
                      ) : (
                        "Create Remix"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
