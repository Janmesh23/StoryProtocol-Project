'use client';

import { useEffect, useState } from "react";
import { getPendingRoyalty, claimRoyalty } from "../services/royalty";
import { formatEther } from "viem";

export default function RoyaltyDashboard({ ipId, walletAddress }) {
  const [pending, setPending] = useState("0");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function fetchPending() {
      try {
        const amt = await getPendingRoyalty(ipId, walletAddress);
        setPending(formatEther(amt));
      } catch (e) {
        console.error("Error fetching royalty:", e);
      }
    }

    fetchPending();
  }, [ipId, walletAddress]);

  const handleClaim = async () => {
    try {
      setStatus("⏳ Claiming...");
      const claimed = await claimRoyalty(ipId);
      setStatus(`✅ Claimed: ${formatEther(claimed)} WIP`);
      setPending("0");
    } catch (err) {
      console.error("Claim failed:", err);
      setStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-2">
      <h4>💰 Pending Royalties: {pending} WIP</h4>
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded"
        onClick={handleClaim}
        disabled={pending === "0"}
      >
        Claim Royalties
      </button>
      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}
