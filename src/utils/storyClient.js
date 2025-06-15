import { StoryClient, WIP_TOKEN_ADDRESS } from "@story-protocol/core-sdk";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(`0x${process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY}`);

export const client = StoryClient.newClient({
  account,
  transport: http(process.env.NEXT_PUBLIC_RPC_PROVIDER_URL),
  chainId: "aeneid",
});

export { WIP_TOKEN_ADDRESS };
