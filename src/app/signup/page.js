"use client"

import { useState } from "react"
import { useAccount, useSignMessage } from "wagmi"
import { useRouter } from "next/navigation"
import { User, Mail, Palette, Shield, CheckCircle, ArrowRight } from "lucide-react"
import LoadingSpinner from "../components/LoadingSpinner"

export default function SignUpPage() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const router = useRouter()

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    website: "",
    twitter: "",
    instagram: "",
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    try {
      setLoading(true)
      setStep(1)

      // Step 1: Sign message to verify wallet ownership
      const message = `Welcome to Vogue Vision!\n\nSign this message to create your creator profile.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`

      const signature = await signMessageAsync({ message })
      setStep(2)

      // Step 2: Create profile (simulate API call)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const profileData = {
        ...formData,
        address,
        signature,
        createdAt: new Date().toISOString(),
      }

      // Store in localStorage (in real app, send to backend)
      localStorage.setItem(`profile_${address}`, JSON.stringify(profileData))

      setSuccess(true)
      setStep(3)

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (err) {
      console.error("❌ Error creating profile:", err)
      alert("Failed to create profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to create a creator profile on Vogue Vision.
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile Created Successfully! 🎉</h1>
          <p className="text-gray-600 mb-6">Welcome to Vogue Vision! Your creator profile has been set up.</p>
          <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Join Vogue Vision</h1>
          <p className="text-gray-600">Create your fashion creator profile and start earning royalties</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? "bg-purple-600" : "bg-gray-200"}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? "bg-purple-600" : "bg-gray-200"}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {loading && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <LoadingSpinner size="sm" />
                <div>
                  <p className="font-medium text-purple-800">
                    {step === 1 && "Verifying wallet signature..."}
                    {step === 2 && "Creating your profile..."}
                  </p>
                  <p className="text-sm text-purple-600">Step {step} of 2</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Connected Wallet */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Wallet Connected</p>
                  <p className="text-sm text-green-600">{address}</p>
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Username *
              </label>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 inline mr-2" />
                Bio
              </label>
              <textarea
                name="bio"
                placeholder="Tell us about your fashion journey and style..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                value={formData.bio}
                onChange={handleInputChange}
              />
            </div>

            {/* Social Links */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                <input
                  type="text"
                  name="twitter"
                  placeholder="@username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.twitter}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <input
                type="text"
                name="instagram"
                placeholder="@username"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={formData.instagram}
                onChange={handleInputChange}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.username || !formData.email}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                loading || !formData.username || !formData.email
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Creating Profile...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Create Profile</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
