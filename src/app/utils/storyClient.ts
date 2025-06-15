// import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
// import { http } from "viem";
// import { privateKeyToAccount, Address, Account } from "viem/accounts";

// const privateKey = `0x${process.env.WALLET_PRIVATE_KEY}`;
// const config = { account, transport: http(process.env.RPC_PROVIDER_URL), chainId: "aeneid" };

// Read the private key and RPC URL from .env
// const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`;
// export const account: Account = privateKeyToAccount(privateKey);

// const config: StoryConfig = {
//   account: account,
//   transport: http(process.env.RPC_PROVIDER_URL),
//   chainId: "aeneid",
// };
// export const client = StoryClient.newClient(config);

import { StoryClient, type StoryConfig } from "@story-protocol/core-sdk"
import { http } from "viem"
import { privateKeyToAccount, type Address, type Account } from "viem/accounts"

// Only use private key on server side - for client side, use wallet connection
const getStoryConfig = (): StoryConfig => {
  if (typeof window === "undefined") {
    // Server side
    const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`
    const account: Account = privateKeyToAccount(privateKey)

    return {
      account: account,
      transport: http(process.env.RPC_PROVIDER_URL || "https://testnet.storyrpc.io"),
      chainId: "aeneid",
    }
  }

  // Client side - will be configured with wallet
  return {
    transport: http("https://testnet.storyrpc.io"),
    chainId: "aeneid",
  }
}

export const getStoryClient = () => StoryClient.newClient(getStoryConfig())
