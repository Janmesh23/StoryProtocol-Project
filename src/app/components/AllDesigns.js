"use client"

import { useEffect, useState } from "react"
import { readContract } from "@wagmi/core"
import { useAccount, useChainId } from "wagmi"
import { abi as FASHION_ABI } from "../../contract_data/CreatorReputationABI"
import { Heart, Eye, Crown, Sparkles, Palette } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"

export default function AllDesigns({ featured = false }) {
  const { address } = useAccount()
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const chainId = useChainId()

  // Use environment variable
  const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT || "0xB0C116b665a174f15a49A534028bc1F3f4609a18"

  const fetchDesigns = async () => {
    try {
      setLoading(true)
      setError(null)

      const total = await readContract({
        address: NFT_CONTRACT,
        abi: FASHION_ABI,
        functionName: "getTotalDesigns",
        chainId: "aeneid",
      })

      const designPromises = []
      const maxDesigns = featured ? Math.min(6, Number(total)) : Number(total)

      for (let i = 1; i <= maxDesigns; i++) {
        designPromises.push(fetchSingleDesign(i))
      }

      const allDesigns = await Promise.all(designPromises)
      setDesigns(allDesigns.filter(Boolean))
    } catch (err) {
      console.error("❌ Error loading designs:", err)
      setError("Failed to load designs. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchSingleDesign = async (tokenId) => {
    try {
      const [design, uri] = await Promise.all([
        readContract({
          address: NFT_CONTRACT,
          abi: FASHION_ABI,
          functionName: "getDesign",
          args: [tokenId],
          chainId: "aeneid",
        }),
        readContract({
          address: NFT_CONTRACT,
          abi: FASHION_ABI,
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
        likes: Math.floor(Math.random() * 100), // Mock data
        views: Math.floor(Math.random() * 1000), // Mock data
      }
    } catch (err) {
      console.warn(`⚠️ Failed to fetch design ${tokenId}:`, err)
      return null
    }
  }

  useEffect(() => {
    fetchDesigns()
  }, [chainId, featured])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDesigns}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (designs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No designs found yet</p>
          <p className="text-sm text-gray-500">Be the first to create something amazing!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${featured ? "max-w-6xl mx-auto" : ""}`}>
      {designs.map((design) => (
        <DesignCard key={design.tokenId} design={design} />
      ))}
    </div>
  )
}

function DesignCard({ design }) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={design.metadata.image || "/placeholder.svg?height=256&width=384"}
          alt={design.metadata.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full backdrop-blur-sm transition-colors ${
                    liked ? "bg-red-500/80 text-white" : "bg-white/20 hover:bg-white/30"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  <span className="text-sm">{design.likes + (liked ? 1 : 0)}</span>
                </button>

                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{design.views}</span>
                </div>
              </div>

              <button className="px-3 py-1 bg-purple-500/80 text-white rounded-full text-sm hover:bg-purple-600/80 transition-colors">
                <Palette className="w-4 h-4 inline mr-1" />
                Remix
              </button>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <div
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
              design.isOriginal ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-blue-500 text-white"
            }`}
          >
            {design.isOriginal ? <Crown className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
            <span>{design.isOriginal ? "Original" : "Remix"}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-800 mb-2 text-lg">{design.metadata.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{design.metadata.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{design.creator.slice(2, 4).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Creator</p>
              <p className="text-sm font-medium text-gray-700">
                {design.creator.slice(0, 6)}...{design.creator.slice(-4)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Token ID</p>
            <p className="text-sm font-medium text-gray-700">#{design.tokenId}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
