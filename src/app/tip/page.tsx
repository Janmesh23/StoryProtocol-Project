// src/app/tip/page.tsx
"use client";

import React, { useState } from "react";
import { getStoryClient } from "../utils/storyClient";

// import { WIP_TOKEN_ADDRESS } from "../utils/storyClient"; // Uncomment if WIP_TOKEN_ADDRESS is exported
const WIP_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with your actual WIP token address
import { parseEther, zeroAddress } from "viem";

export default function PayRoyaltyPage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayRoyalty = async () => {
    if (!amount || isNaN(Number(amount))) {
      alert("Enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const client = getStoryClient();
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: "0xcd3B766CCDd6AE721141F452C550Ca635964ce71", // Replace this with your NFT's IP ID (must be a valid 0x... address)
        payerIpId: zeroAddress,
        token: WIP_TOKEN_ADDRESS ,
        amount: parseEther(amount),
      });

      alert("Royalty sent! Transaction Hash: " + response.txHash);
    } catch (err) {
      console.error("Royalty payment error:", err);
      alert("Failed to send royalty.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Send Royalty</h1>
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter royalty amount in WIP"
        className="border rounded p-2 w-full mb-4"
      />
      <button
        onClick={handlePayRoyalty}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        disabled={loading}
      >
        {loading ? "Paying..." : "Pay Royalty"}
      </button>
    </div>
  );
}
