"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { DollarSign, TrendingUp, Clock, Eye, Download } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"

export default function RoyaltyTracker() {
  const { address } = useAccount()
  const [royaltyData, setRoyaltyData] = useState({
    totalEarned: 0,
    pendingClaims: 0,
    monthlyEarnings: [],
    recentTransactions: [],
    topEarningDesigns: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("30d") // 7d, 30d, 90d, 1y

  const fetchRoyaltyData = async () => {
    try {
      setLoading(true)

      // Mock data - in real app, fetch from blockchain and backend
      const mockData = {
        totalEarned: 2847.32,
        pendingClaims: 156.78,
        monthlyEarnings: [
          { month: "Jan", earnings: 234.56 },
          { month: "Feb", earnings: 456.78 },
          { month: "Mar", earnings: 678.9 },
          { month: "Apr", earnings: 543.21 },
          { month: "May", earnings: 789.12 },
          { month: "Jun", earnings: 1144.75 },
        ],
        recentTransactions: [
          {
            id: 1,
            type: "Remix Royalty",
            amount: 23.45,
            from: "0x1234...5678",
            design: "Summer Vibes Collection",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            type: "License Fee",
            amount: 67.89,
            from: "0x9876...5432",
            design: "Urban Street Style",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            type: "Remix Royalty",
            amount: 12.34,
            from: "0x5555...7777",
            design: "Minimalist Chic",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        topEarningDesigns: [
          { name: "Summer Vibes Collection", earnings: 456.78, remixes: 12 },
          { name: "Urban Street Style", earnings: 234.56, remixes: 8 },
          { name: "Minimalist Chic", earnings: 123.45, remixes: 5 },
        ],
      }

      setRoyaltyData(mockData)
    } catch (err) {
      console.error("Error fetching royalty data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimRoyalties = async () => {
    try {
      // In real app, call smart contract function
      alert("Royalties claimed successfully!")
      setRoyaltyData((prev) => ({ ...prev, pendingClaims: 0 }))
    } catch (err) {
      console.error("Error claiming royalties:", err)
      alert("Failed to claim royalties")
    }
  }

  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Date,Type,Amount,From,Design\n" +
      royaltyData.recentTransactions
        .map((tx) => `${new Date(tx.timestamp).toLocaleDateString()},${tx.type},${tx.amount},${tx.from},${tx.design}`)
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "royalty_report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    if (address) {
      fetchRoyaltyData()
    }
  }, [address, timeframe])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Royalty Analytics</h2>
          <p className="text-gray-600">Track your earnings and royalty performance</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Earned</p>
              <p className="text-3xl font-bold">${royaltyData.totalEarned.toFixed(2)}</p>
              <p className="text-green-100 text-sm mt-1">+12.5% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-400/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Pending Claims</p>
              <p className="text-3xl font-bold">${royaltyData.pendingClaims.toFixed(2)}</p>
              <button
                onClick={handleClaimRoyalties}
                className="bg-white/20 text-white px-3 py-1 rounded-lg text-sm mt-2 hover:bg-white/30 transition-colors"
              >
                Claim Now
              </button>
            </div>
            <div className="w-12 h-12 bg-purple-400/30 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Monthly Growth</p>
              <p className="text-3xl font-bold">+24.8%</p>
              <p className="text-blue-100 text-sm mt-1">Compared to last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-400/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Earnings</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {royaltyData.monthlyEarnings.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-300 hover:from-purple-600 hover:to-purple-500"
                style={{
                  height: `${(data.earnings / Math.max(...royaltyData.monthlyEarnings.map((d) => d.earnings))) * 200}px`,
                }}
              ></div>
              <p className="text-sm text-gray-600 mt-2">{data.month}</p>
              <p className="text-xs text-gray-500">${data.earnings.toFixed(0)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {royaltyData.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{tx.type}</p>
                    <p className="text-sm text-gray-600">{tx.design}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+${tx.amount}</p>
                  <p className="text-xs text-gray-500">
                    {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Earning Designs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Earning Designs</h3>
          <div className="space-y-4">
            {royaltyData.topEarningDesigns.map((design, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-purple-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{design.name}</p>
                    <p className="text-sm text-gray-600">{design.remixes} remixes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">${design.earnings}</p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Eye className="w-3 h-3" />
                    <span>{design.remixes * 45} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
