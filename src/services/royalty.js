import { parseEther, zeroAddress } from "viem";
import { client, WIP_TOKEN_ADDRESS } from "../utils/storyClient";

// Tip 10% of sale
export async function tipRoyalty(childIpId, salePrice) {
  const amount = parseEther((Number(salePrice) * 0.1).toString());
  const { txHash } = await client.royalty.payRoyaltyOnBehalf({
    receiverIpId: childIpId,
    payerIpId: zeroAddress,
    token: WIP_TOKEN_ADDRESS,
    amount,
  });
  return txHash;
}

// View pending royalty
export async function getPendingRoyalty(ipId, claimer) {
  const { amount } = await client.royalty.claimableRevenue({
    ipId,
    claimer,
    token: WIP_TOKEN_ADDRESS,
  });
  return amount;
}

// Claim royalty
export async function claimRoyalty(ipId) {
  const { claimedTokens } = await client.royalty.claimAllRevenue({
    ancestorIpId: ipId,
    claimer: ipId,
    childIpIds: [ipId],
    royaltyPolicies: [],
    currencyTokens: [WIP_TOKEN_ADDRESS],
  });
  return claimedTokens;
}
