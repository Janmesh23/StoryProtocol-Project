"use client"
import { Upload, Shield, Coins, Repeat } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Design",
      description: "Create and upload your original fashion design to IPFS",
      color: "purple",
    },
    {
      icon: Shield,
      title: "Register IP",
      description: "Register your design as an IP asset on Story Protocol",
      color: "pink",
    },
    {
      icon: Coins,
      title: "Set License",
      description: "Choose licensing terms and royalty percentages",
      color: "green",
    },
    {
      icon: Repeat,
      title: "Earn Royalties",
      description: "Get paid automatically when others remix your work",
      color: "blue",
    },
  ]

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
      <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
        Four simple steps to start earning from your fashion creativity
      </p>

      <div className="grid md:grid-cols-4 gap-8">
        {steps.map((step, index) => {
          const Icon = step.icon
          const colorClasses = {
            purple: "bg-purple-100 text-purple-600 border-purple-200",
            pink: "bg-pink-100 text-pink-600 border-pink-200",
            green: "bg-green-100 text-green-600 border-green-200",
            blue: "bg-blue-100 text-blue-600 border-blue-200",
          }

          return (
            <div key={index} className="relative">
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                {index + 1}
              </div>

              {/* Card */}
              <div className={`bg-white p-6 rounded-2xl border-2 ${colorClasses[step.color]} h-full`}>
                <div
                  className={`w-16 h-16 ${colorClasses[step.color]} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-300 to-pink-300 transform -translate-y-1/2 z-0"></div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
