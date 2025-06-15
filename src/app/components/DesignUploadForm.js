"use client"

import { useState } from "react"
import axios from "axios"
import { useWriteContract, useAccount } from "wagmi"
import { abi } from "../../contract_data/CreatorReputationABI.js"
import { Upload, ImageIcon, Loader2, CheckCircle } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"

export default function DesignMintForm() {
  const { address } = useAccount()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)

  const { writeContractAsync } = useWriteContract()

  // Use environment variables
  const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT_CONTRACT || "0xB0C116b665a174f15a49A534028bc1F3f4609a18"
  const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "34087860990aa96af2a0"
  const PINATA_API_SECRET =
    process.env.NEXT_PUBLIC_PINATA_API_SECRET || "0c6ec70f12bad6d7866e017857af49ce7885bc38f32dc5e8196e628ec29ba5c9"

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)

    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleMint = async (e) => {
    e.preventDefault()
    if (!file || !name || !description) {
      alert("Please provide all required fields")
      return
    }

    try {
      setLoading(true)
      setStep(1)

      // Step 1: Upload image to IPFS via Pinata
      const imgData = new FormData()
      imgData.append("file", file)

      const imgRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", imgData, {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      })

      const imageHash = imgRes.data.IpfsHash
      const imageUrl = `https://crimson-immediate-cricket-188.mypinata.cloud/ipfs/${imageHash}`

      setStep(2)

      // Step 2: Upload metadata
      const metadata = {
        name,
        description,
        image: imageUrl,
        creator: address,
        created_at: new Date().toISOString(),
        attributes: [
          {
            trait_type: "Creator",
            value: address,
          },
          {
            trait_type: "Type",
            value: "Original Design",
          },
        ],
      }

      const metaRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      })
      const metadataURI = `https://crimson-immediate-cricket-188.mypinata.cloud/ipfs/${metaRes.data.IpfsHash}`

      setStep(3)

      // Step 3: Mint NFT
      await writeContractAsync({
        address: NFT_CONTRACT,
        abi: abi,
        functionName: "mintOriginal",
        args: [metadataURI],
      })

      setSuccess(true)
      setStep(4)

      // Reset form
      setTimeout(() => {
        setName("")
        setDescription("")
        setFile(null)
        setPreview(null)
        setSuccess(false)
        setStep(1)
      }, 3000)
    } catch (err) {
      console.error("❌ Error uploading or minting:", err)
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Design Minted Successfully! 🎉</h2>
        <p className="text-gray-600 mb-6">Your fashion design has been uploaded to IPFS and minted as an NFT.</p>
        <p className="text-sm text-gray-500">Redirecting to your designs...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleMint} className="space-y-6">
        {/* Progress Indicator */}
        {loading && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <div>
                <p className="font-medium text-purple-800">
                  {step === 1 && "Uploading image to IPFS..."}
                  {step === 2 && "Creating metadata..."}
                  {step === 3 && "Minting NFT..."}
                </p>
                <p className="text-sm text-purple-600">Step {step} of 3</p>
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Design Image *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                  }}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="relative">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Design Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Design Name *</label>
          <input
            type="text"
            placeholder="Enter your design name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            placeholder="Describe your design, inspiration, and any special features..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !file || !name || !description}
          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
            loading || !file || !name || !description
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Mint Design NFT</span>
            </div>
          )}
        </button>
      </form>
    </div>
  )
}
