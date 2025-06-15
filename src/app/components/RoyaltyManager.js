"use client"

import { useState, useEffect } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { StoryClient } from "@story-protocol/core-sdk"
import { custom, formatEther } from "viem"

export default function RoyaltyManager() {
  const { address } = useAccount()
  const { data: wallet } = useWalletClient()
  const [royaltyData, setRoyaltyData] = useState({
    earned: "0",
    paid: "0",
    pending: "0",
  })
  const [ipAssets, setIpAssets] = useState([])
  const [loading, setLoading] = useState(false)

  const setupStoryClient = async () => {
    if (!wallet) return null
    return StoryClient.newClient({
      wallet,
      transport: custom(wallet.transport),
      chainId: "aeneid",
    })
  }

  const loadRoyaltyData = async () => {
    if (!address || !wallet) return

    setLoading(true)
    try {
      const client = await setupStoryClient()

      // Get user's IP assets
      const ipResponse = await client.ipAsset.getIpAssetsByOwner({
        owner: address,
      })
      setIpAssets(ipResponse.items || [])

      // Get royalty earnings for each IP
      let totalEarned = 0n
      let totalPending = 0n

      for (const ip of ipResponse.items || []) {
        try {
          const royaltyInfo = await client.royalty.getRoyaltyInfo({
            ipId: ip.id,
          })

          if (royaltyInfo) {
            totalEarned += BigInt(royaltyInfo.totalEarned || 0)
            totalPending += BigInt(royaltyInfo.pendingAmount || 0)
          }
        } catch (err) {
          console.log(`No royalty info for IP ${ip.id}`)
        }
      }

      setRoyaltyData({
        earned: formatEther(totalEarned),
        paid: "0", // This would need to be tracked separately
        pending: formatEther(totalPending),
      })
    } catch (error) {
      console.error("Error loading royalty data:", error)
    } finally {
      setLoading(false)
    }
  }

  const claimRoyalties = async (ipId) => {
    if (!wallet) return

    try {
      const client = await setupStoryClient()
      const response = await client.royalty.claimRoyalty({
        ipId: ipId,
        claimer: address,
      })

      alert(`Royalties claimed! Tx: ${response.txHash}`)
      await loadRoyaltyData() // Refresh data
    } catch (error) {
      console.error("Error claiming royalties:", error)
      alert("Failed to claim royalties")
    }
  }

  useEffect(() => {
    if (address && wallet) {
      loadRoyaltyData()
    }
  }, [address, wallet])

  if (!address) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <p className="text-center">Connect your wallet to view royalty information</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-black rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">💰 Royalty Dashboard</h2>

      {/* Royalty Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800">Total Earned</h3>
          <p className="text-2xl font-bold text-green-600">
            {loading ? "..." : `${Number.parseFloat(royaltyData.earned).toFixed(4)} WIP`}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800">Pending Claims</h3>
          <p className="text-2xl font-bold text-blue-600">
            {loading ? "..." : `${Number.parseFloat(royaltyData.pending).toFixed(4)} WIP`}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-800">Total Paid Out</h3>
          <p className="text-2xl font-bold text-purple-600">
            {loading ? "..." : `${Number.parseFloat(royaltyData.paid).toFixed(4)} WIP`}
          </p>
        </div>
      </div>

      {/* IP Assets with Royalty Info */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your IP Assets</h3>
        {loading ? (
          <p>Loading IP assets...</p>
        ) : ipAssets.length === 0 ? (
          <p className="text-gray-500">No IP assets found. Register some NFTs as IP first!</p>
        ) : (
          <div className="space-y-3">
            {ipAssets.map((ip) => (
              <div key={ip.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">IP ID: {ip.id.slice(0, 10)}...</p>
                  <p className="text-sm text-gray-600">Name: {ip.ipName || "Unnamed IP"}</p>
                </div>
                <button
                  onClick={() => claimRoyalties(ip.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Claim Royalties
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={loadRoyaltyData}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Refreshing..." : "Refresh Data"}
      </button>
    </div>
  )
}




// 'use client';

// import { useEffect, useState } from 'react';
// import { useWalletClient, useAccount } from 'wagmi';
// import { StoryClient } from '@story-protocol/core-sdk';
// import { toHex, custom } from 'viem';
// import axios from 'axios';
// import { PINATA_JWT, NFT_CONTRACT } from '@/contract_data/constants.js';
// import { parseEther, zeroAddress } from 'viem';
// import { storyAeneid } from 'viem/chains';

// export default function RegisterIP({ tokenId}) {
//   const { address } = useAccount();
//   const { data: wallet } = useWalletClient();

//   const [form, setForm] = useState({
//     nftContract: NFT_CONTRACT || '',
//     tokenId: tokenId || '',
//     name: '',
//     description: '',
//     creator: '',
//     licenseTags: '',
//     nftMetadataURI: '',
//   });

//   const [status, setStatus] = useState('');
//   const [ipList, setIpList] = useState([]);
//   const [selectedIp, setSelectedIp] = useState('');
//   const [tipAmount, setTipAmount] = useState('');
//   const [royaltyHistory, setRoyaltyHistory] = useState([]);

//   const setupStoryClient = async () => {
//     if (!wallet) return null;
//     return StoryClient.newClient({
//       wallet,
//       transport: custom(wallet.transport),
//       chainId: 'aeneid',
//     });
//   };

//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus('⏳ Uploading IP Metadata...');

//     try {
//       const ipMetadataJSON = {
//         name: form.name,
//         description: form.description,
//         creator: form.creator,
//         creationDate: new Date().toISOString(),
//         licenseTags: form.licenseTags.split(',').map((tag) => tag.trim()),
//         version: '1.0',
//       };

//       const metadataBlob = new Blob([JSON.stringify(ipMetadataJSON)], {
//         type: 'application/json',
//       });

//       const formData = new FormData();
//       formData.append('file', metadataBlob);

//       const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
//         headers: {
//           Authorization: `Bearer ${PINATA_JWT}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       const ipMetadataURI = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;

//       setStatus('📡 Registering with Story Protocol...');

//       const client = await setupStoryClient();
//       const response = await client.ipAsset.register({
//         nftContract: NFT_CONTRACT,
//         tokenId: BigInt(tokenId),
//         ipMetadata: {
//           ipMetadataURI,
//           ipMetadataHash: toHex('ip-metadata-hash', { size: 32 }),
//           nftMetadataURI: form.nftMetadataURI,
//           nftMetadataHash: toHex('nft-metadata-hash', { size: 32 }),
//         },
//       });

//       setStatus(`✅ IP Registered! Tx: ${response.txHash}, ID: ${response.ipId}`);
//     //   await loadMyIps(); // refresh IP list
//     } catch (err) {
//       console.error(err);
//       setStatus('❌ Error registering IP');
//     }
//   };

//   const handleTip = async () => {
//     if (!selectedIp || !tipAmount || isNaN(Number(tipAmount))) {
//       alert('Select IP and valid tip amount');
//       return;
//     }

//     setStatus('💸 Sending royalty tip...');
//     try {
//       const client = await setupStoryClient();
//       const response = await client.royalty.payRoyaltyOnBehalf({
//         receiverIpId: selectedIp,
//         payerIpId: zeroAddress,
//         token: '0x0000000000000000000000000000000000000000', // WIP Token (native)
//         amount: parseEther(tipAmount),
//       });

//       setStatus(`✅ Royalty sent! Tx: ${response.txHash}`);
//       await loadRoyaltyHistory(); // Refresh royalty history
//     } catch (err) {
//       console.error(err);
//       setStatus('❌ Failed to send royalty');
//     }
//   };

// //   const loadMyIps = async () => {
// //     try {
// //       const client = await setupStoryClient();
// //       const res = await client.ipAsset.getIpAssetsByOwner({ owner: address });
// //       setIpList(res.items.map((ip) => ({ id: ip.id, name: ip.ipName || ip.id })));
// //     } catch (err) {
// //       console.error('Error loading IPs:', err);
// //     }
// //   };

//   const loadRoyaltyHistory = async () => {
//     try {
//       const client = await setupStoryClient();
//       const history = await client.royalty.getRoyaltyHistory({ walletAddress: address });
//       setRoyaltyHistory(history.items);
//     } catch (err) {
//       console.error('Error loading royalty history:', err);
//     }
//   };

//   useEffect(() => {
//     if (address && wallet) {
//     //   loadMyIps();
//       loadRoyaltyHistory();
//     }
//   }, [address, wallet]);

//   return (
//     <div className="p-4 max-w-xl mx-auto bg-black text-white rounded shadow">
//       <h2 className="text-lg font-bold mb-4">Register Design as IP</h2>

//       <form onSubmit={handleSubmit} className="space-y-3 bg-gray-400">
//         <input type="text" name="nftContract" onChange={handleChange} value={form.nftContract} placeholder="NFT Contract Address" className="w-full p-2 border rounded text-black" required />
//         <input type="text" name="tokenId" onChange={handleChange} value={form.tokenId} placeholder="Token ID" className="w-full p-2 border rounded text-black" disabled="true" required />
//         <input type="text" name="nftMetadataURI" onChange={handleChange} placeholder="NFT Metadata URI" className="w-full p-2 border rounded text-black" required />
//         <input type="text" name="name" onChange={handleChange} placeholder="IP Name" className="w-full p-2 border rounded text-black" required />
//         <textarea name="description" onChange={handleChange} placeholder="IP Description" className="w-full p-2 border rounded text-black" required />
//         <input type="text" name="creator" onChange={handleChange} placeholder="Creator Name" className="w-full p-2 border rounded text-black" required />
//         <input type="text" name="licenseTags" onChange={handleChange} placeholder="License Tags (comma-separated)" className="w-full p-2 border rounded text-black" required />

//         <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//           Register IP
//         </button>
//       </form>

//       {/* Tipping section */}
//       <div className="mt-6">
//         <h3 className="font-semibold text-lg mb-2">💸 Tip Your Registered IPs</h3>

//         <select
//           value={selectedIp}
//           onChange={(e) => setSelectedIp(e.target.value)}
//           className="w-full p-2 text-black rounded mb-2 bg-gray-400"
//         >
//           <option value="">Select IP to tip</option>
//           {ipList.map((ip) => (
//             <option key={ip.id} value={ip.id}>
//               {ip.name}
//             </option>
//           ))}
//         </select>

//         <input
//           type="number"
//           step="0.01"
//           placeholder="Amount in WIP"
//           value={tipAmount}
//           onChange={(e) => setTipAmount(e.target.value)}
//           className="w-full p-2 mb-2 rounded text-black bg-gray-400"
//         />
//         <button onClick={handleTip} className="w-full p-2 bg-green-600 rounded hover:bg-green-700">
//           Send Royalty
//         </button>
//       </div>

//       {/* Royalty History */}
//       <div className="mt-6">
//         <h3 className="font-semibold text-lg mb-2">📜 Royalty History</h3>
//         {royaltyHistory.length === 0 ? (
//           <p className="text-gray-400">No royalty records found.</p>
//         ) : (
//           <ul className="space-y-2 text-sm">
//             {royaltyHistory.map((r, i) => (
//               <li key={i} className="border-b py-1">
//                 <strong>Tx:</strong> {r.transactionHash.slice(0, 10)}...
//                 <br />
//                 <strong>Amount:</strong> {Number(r.amount) / 1e18} WIP
//                 <br />
//                 <strong>From:</strong> {r.payerIpId || '—'} <br />
//                 <strong>To:</strong> {r.receiverIpId}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       <div className="mt-4 text-sm text-yellow-400">{status}</div>
//     </div>
//   );
// }
