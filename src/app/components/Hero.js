"use client"
import { useAccount } from "wagmi"
import Link from "next/link"
import { Sparkles, Palette, Crown, ArrowRight } from "lucide-react"

export default function Hero() {
  const { isConnected } = useAccount()

  return (
    <div className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-200 rounded-full opacity-30 animate-pulse delay-1000"></div>

      <div className="relative px-8 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by Story Protocol
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent">
              Fashion IP
            </span>
            <br />
            <span className="text-gray-800">Revolution</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create, remix, and monetize fashion designs with automatic royalty distribution. The future of collaborative
            fashion is here.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {isConnected ? (
              <>
                <Link
                  href="/create"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Palette className="w-5 h-5 mr-2" />
                  Start Creating
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  My Dashboard
                </Link>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 mb-4">Connect your wallet to get started</p>
                <Link
                  href="/gallery"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Palette className="w-5 h-5 mr-2" />
                  Explore Gallery
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Create & Mint</h3>
              <p className="text-gray-600 text-sm">Upload your fashion designs and mint them as IP assets</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-pink-100">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Remix & Collaborate</h3>
              <p className="text-gray-600 text-sm">Build upon existing designs with automatic attribution</p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Earn Royalties</h3>
              <p className="text-gray-600 text-sm">Get paid automatically when others use your designs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
