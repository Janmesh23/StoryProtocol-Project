"use client"
import { useAccount } from "wagmi"
import DesignUploadForm from "../components/DesignUploadForm"
import { Palette, Upload, Shield } from "lucide-react"

export default function CreatePage() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Palette className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to start creating and minting fashion designs.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Create New Design</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your original fashion design and mint it as an IP asset. Set licensing terms and start earning
          royalties from remixes.
        </p>
      </div>

      {/* Process Steps */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">1. Upload Design</h3>
          <p className="text-sm text-gray-600">Upload your fashion design image and add details</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-pink-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">2. Mint NFT</h3>
          <p className="text-sm text-gray-600">Create your NFT on the blockchain</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Palette className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">3. Register IP</h3>
          <p className="text-sm text-gray-600">Register as IP asset and set licensing terms</p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <DesignUploadForm />
      </div>
    </div>
  )
}
