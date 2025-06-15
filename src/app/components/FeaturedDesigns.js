"use client"
import AllDesigns from "./AllDesigns"

export default function FeaturedDesigns() {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Featured Designs</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover amazing fashion creations from our community of talented designers
        </p>
      </div>

      <AllDesigns featured={true} />
    </div>
  )
}
