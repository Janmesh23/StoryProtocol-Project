"use client"

import { useState } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { StoryClient } from "@story-protocol/core-sdk"
import { custom } from "viem"
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"

export default function IPRegistration({ tokenId, onSuccess }) {
  const { address } = useAccount()
  const { data: wallet } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [ipAssetId, setIpAssetId] = useState(null)
  const [licenseTermsId, setLicenseTermsId] = useState(null)
  const [error, setError] = useState(null)

  const registerIP = async () => {
    if (!wallet || !tokenId) {
      setError("Wallet not connected or invalid token ID")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setStep(1)

      // Initialize Story Client
      const client = StoryClient.newClient({
        wallet,
        transport: custom(wallet.transport),
        chainId: "aeneid",
      })

      // Step 1: Register IP Asset
      console.log("Registering IP Asset...")
      const ipAssetResponse = await client.ipAsset.register({
        nftContract: "0xAc3bC6B228470935B69d2A3a0E86FEbDF4275745", // Your NFT contract
        tokenId: tokenId.toString(),
        metadata: {
          metadataURI: "", // Optional
          metadataHash: "", // Optional
          nftMetadataHash: "", // Optional
        },
        txOptions: { waitForTransaction: true },
      })

      console.log("IP Asset registered:", ipAssetResponse)
      setIpAssetId(ipAssetResponse.ipId)
      setStep(2)

      // Step 2: Register License Terms
      console.log("Registering License Terms...")
      const licenseResponse = await client.license.registerNonComSocialRemixingPIL({
        txOptions: { waitForTransaction: true },
      })

      console.log("License Terms registered:", licenseResponse)
      setLicenseTermsId(licenseResponse.licenseTermsId)
      setStep(3)

      // Step 3: Attach License Terms to IP
      console.log("Attaching License Terms...")
      const attachResponse = await client.license.attachLicenseTerms({
        ipId: ipAssetResponse.ipId,
        licenseTermsId: licenseResponse.licenseTermsId,
        txOptions: { waitForTransaction: true },
      })

      console.log("License Terms attached:", attachResponse)
      setStep(4)

      // Success callback
      if (onSuccess) {
        onSuccess({
          ipAssetId: ipAssetResponse.ipId,
          licenseTermsId: licenseResponse.licenseTermsId,
        })
      }
    } catch (err) {
      console.error("❌ Error registering IP:", err)
      setError(err.message || "Failed to register IP asset")
    } finally {
      setLoading(false)
    }
  }

  const getStepStatus = (stepNumber) => {
    if (step > stepNumber) return "completed"
    if (step === stepNumber && loading) return "loading"
    if (step === stepNumber) return "current"
    return "pending"
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">IP Registration</h3>
          <p className="text-sm text-gray-600">Register your NFT as an IP asset with Story Protocol</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">Registration Failed</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="space-y-4 mb-6">
        <div
          className={`flex items-center space-x-3 p-3 rounded-lg ${
            getStepStatus(1) === "completed"
              ? "bg-green-50"
              : getStepStatus(1) === "current"
                ? "bg-blue-50"
                : "bg-gray-50"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
              getStepStatus(1) === "completed"
                ? "bg-green-600 text-white"
                : getStepStatus(1) === "loading"
                  ? "bg-blue-600 text-white"
                  : getStepStatus(1) === "current"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
            }`}
          >
            {getStepStatus(1) === "completed" ? (
              "✓"
            ) : getStepStatus(1) === "loading" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "1"
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">Register IP Asset</p>
            <p className="text-sm text-gray-600">Create IP asset from your NFT</p>
          </div>
        </div>

        <div
          className={`flex items-center space-x-3 p-3 rounded-lg ${
            getStepStatus(2) === "completed"
              ? "bg-green-50"
              : getStepStatus(2) === "current"
                ? "bg-blue-50"
                : "bg-gray-50"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
              getStepStatus(2) === "completed"
                ? "bg-green-600 text-white"
                : getStepStatus(2) === "loading"
                  ? "bg-blue-600 text-white"
                  : getStepStatus(2) === "current"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
            }`}
          >
            {getStepStatus(2) === "completed" ? (
              "✓"
            ) : getStepStatus(2) === "loading" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "2"
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">Register License Terms</p>
            <p className="text-sm text-gray-600">Set up licensing for remixes</p>
          </div>
        </div>

        <div
          className={`flex items-center space-x-3 p-3 rounded-lg ${
            getStepStatus(3) === "completed"
              ? "bg-green-50"
              : getStepStatus(3) === "current"
                ? "bg-blue-50"
                : "bg-gray-50"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
              getStepStatus(3) === "completed"
                ? "bg-green-600 text-white"
                : getStepStatus(3) === "loading"
                  ? "bg-blue-600 text-white"
                  : getStepStatus(3) === "current"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
            }`}
          >
            {getStepStatus(3) === "completed" ? (
              "✓"
            ) : getStepStatus(3) === "loading" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "3"
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">Attach License Terms</p>
            <p className="text-sm text-gray-600">Link license to IP asset</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {ipAssetId && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="font-medium text-green-800">IP Asset Registered Successfully!</p>
          </div>
          <p className="text-sm text-green-700">IP Asset ID: {ipAssetId}</p>
          {licenseTermsId && <p className="text-sm text-green-700">License Terms ID: {licenseTermsId}</p>}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={registerIP}
        disabled={loading || !tokenId}
        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
          loading || !tokenId
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="sm" />
            <span>Registering IP Asset...</span>
          </div>
        ) : (
          "Register as IP Asset"
        )}
      </button>
    </div>
  )
}
