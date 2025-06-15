"use client"
import { useEffect, useState } from "react"
import { Users, Palette, DollarSign, Zap } from "lucide-react"

export default function Stats() {
  const [stats, setStats] = useState({
    creators: 0,
    designs: 0,
    royalties: 0,
    transactions: 0,
  })

  useEffect(() => {
    // Animate numbers on load
    const animateValue = (key, end, duration = 2000) => {
      const start = 0
      const increment = end / (duration / 16)
      let current = start

      const timer = setInterval(() => {
        current += increment
        if (current >= end) {
          current = end
          clearInterval(timer)
        }
        setStats((prev) => ({ ...prev, [key]: Math.floor(current) }))
      }, 16)
    }

    animateValue("creators", 1247)
    animateValue("designs", 3891)
    animateValue("royalties", 89234)
    animateValue("transactions", 15672)
  }, [])

  const statItems = [
    {
      icon: Users,
      label: "Active Creators",
      value: stats.creators.toLocaleString(),
      color: "purple",
    },
    {
      icon: Palette,
      label: "Designs Created",
      value: stats.designs.toLocaleString(),
      color: "pink",
    },
    {
      icon: DollarSign,
      label: "Royalties Paid",
      value: `$${stats.royalties.toLocaleString()}`,
      color: "green",
    },
    {
      icon: Zap,
      label: "Transactions",
      value: stats.transactions.toLocaleString(),
      color: "blue",
    },
  ]

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Platform Statistics</h2>
        <p className="text-gray-600">Real-time metrics from our growing community</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statItems.map((item, index) => {
          const Icon = item.icon
          const colorClasses = {
            purple: "bg-purple-100 text-purple-600",
            pink: "bg-pink-100 text-pink-600",
            green: "bg-green-100 text-green-600",
            blue: "bg-blue-100 text-blue-600",
          }

          return (
            <div key={index} className="text-center">
              <div
                className={`w-16 h-16 ${colorClasses[item.color]} rounded-2xl flex items-center justify-center mx-auto mb-4`}
              >
                <Icon className="w-8 h-8" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{item.value}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
