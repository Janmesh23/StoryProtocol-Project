'use client';

import { useWalletClient } from 'wagmi';
import { useEffect, useState } from 'react';
import { createPublicClient, createWalletClient, http, custom, parseEther } from 'viem';
import { polygon } from 'viem/chains';
import { abi as repAbi } from './CreatorReputationABI';

const CONTRACT_ADDRESS = '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e';

export default function FameDashboard() {
  const { data: wallet } = useWalletClient();
  const [rep, setRep] = useState(null);
  const [tier, setTier] = useState(null);

  async function getReputation() {
    if (!wallet) return;

    const client = createPublicClient({ chain: polygon, transport: http() });

    const reputation = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: repAbi,
      functionName: 'getReputation',
      args: [wallet.account.address],
    });

    const creatorTier = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: repAbi,
      functionName: 'getCreatorTier',
      args: [wallet.account.address],
    });

    setRep(reputation);
    setTier(creatorTier);
  }

  async function likeCreator() {
    if (!wallet) return;

    const client = createWalletClient({ chain: polygon, transport: custom(wallet.transport) });

    await client.writeContract({
      address: CONTRACT_ADDRESS,
      abi: repAbi,
      functionName: 'likeCreator',
      args: [wallet.account.address],
      account: wallet.account,
    });

    getReputation();
  }

  useEffect(() => {
    if (wallet) getReputation();
  }, [wallet]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">🎨 Your Reputation Dashboard</h2>
      <p>Reputation Score: {rep?.toString() ?? '...'}</p>
      <p>Tier: {tier ?? '...'}</p>

      <button
        onClick={likeCreator}
        className="mt-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
      >
        ❤️ Like Yourself (Test Boost)
      </button>
    </div>
  );
}
