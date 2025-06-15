"use client"

import { useState } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { StoryClient } from "@story-protocol/core-sdk"
import { custom, zeroAddress } from "viem"
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function AttachLicenseTerms({ ipId }) {
  const { address, isConnected } = useAccount()
  const { data: wallet } = useWalletClient()
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [attached, setAttached] = useState(false)

  // Use environment variable for royalty policy
  const ROYALTY_POLICY_LAP = process.env.NEXT_PUBLIC_ROYALTY_POLICY_LAP || "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E"

  const handleAttachLicense = async () => {
    if (!isConnected || !wallet) {
      setStatus("🔌 Please connect your wallet")
      return
    }

    if (!ipId) {
      setStatus("❌ IP ID is required")
      return
    }

    setLoading(true)
    setStatus("🚀 Attaching license terms...")

    try {
      const client = StoryClient.newClient({
        wallet,
        transport: custom(wallet.transport),
        chainId: "aeneid",
      })

      // First, register PIL terms if needed
      const licenseTerms = {
        transferable: false,
        royaltyPolicy: ROYALTY_POLICY_LAP,
        defaultMintingFee: 0n,
        expiration: 0n,
        commercialUse: true,
        commercialAttribution: false,
        commercializerChecker: zeroAddress,
        commercializerCheckerData: "0x",
        commercialRevShare: 10,
        commercialRevCeiling: 0n,
        derivativesAllowed: true,
        derivativesAttribution: false,
        derivativesApproval: false,
        derivativesReciprocal: false,
        derivativeRevCeiling: 0n,
        currency: "0x1514000000000000000000000000000000000000",
        uri: "",
      }

      setStatus("📝 Registering license terms...")

      const licenseResponse = await client.license.registerPILTerms(licenseTerms)
      const licenseTermsId = licenseResponse.licenseTermsId

      setStatus("🔗 Attaching license to IP...")

      // Attach the license terms to the IP
      const attachResponse = await client.license.attachLicenseTerms({
        licenseTermsId: licenseTermsId,
        ipId: ipId,
      })

      if (attachResponse.success) {
        setStatus(`✅ License terms attached successfully! TX: ${attachResponse.txHash}`)
        setAttached(true)
      } else {
        setStatus("ℹ️ License terms already attached to this IP")
        setAttached(true)
      }

      console.log("✨ License attachment result:", attachResponse)
    } catch (err) {
      console.error("🔥 License attachment failed:", err)
      setStatus(`❌ Failed to attach license: ${err.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Attach License Terms</h2>
              <p className="text-blue-100 mt-1">Configure licensing for your IP asset</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {attached ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">License Terms Attached</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your IP asset now has licensing terms configured.</p>
                    <div className="mt-3 space-y-1 text-xs">
                      <p>• Commercial use: ✅ Allowed</p>
                      <p>• Derivatives: ✅ Allowed</p>
                      <p>• Revenue share: 10%</p>
                      <p>• Transferable: ❌ Non-transferable</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">License Configuration</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>This will attach the following license terms to your IP:</p>
                      <div className="mt-3 space-y-1 text-xs">
                        <p>• ✅ Commercial use allowed</p>
                        <p>• ✅ Derivatives allowed</p>
                        <p>• 💰 10% revenue share for remixes</p>
                        <p>• 🔒 Non-transferable license</p>
                        <p>• 🚫 No attribution required</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">IP Asset Details</h4>
                <p className="text-sm text-gray-600 font-mono break-all">
                  <strong>IP ID:</strong> {ipId}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Royalty Policy:</strong> {ROYALTY_POLICY_LAP}
                </p>
              </div>

              <button
                onClick={handleAttachLicense}
                disabled={loading || !isConnected || !ipId}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Attaching License...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    <span>Attach License Terms</span>
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
                    : status.includes("ℹ️")
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
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
