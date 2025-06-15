# 👗 Vogue Vision: Creative Fashion IP + Royalty Platform

Welcome to **Vogue Vision** — a decentralized fashion innovation canvas where creators can register their original designs, remix from others, and earn royalties automatically using **Story Protocol**.

---

## 🧠 Project Idea

Fashion is collaborative, but attribution is hard. This platform enables:
- **Fashion creators** to mint their designs as **IP assets**
- **Remixers** to use existing IP to create new pieces
- **Automatic royalty tracking and payouts** to original creators

All of this is powered on-chain with the **Story Protocol SDK** and a custom royalty token (**WIP**).

---

## ✨ Features

### 📄 IP Asset Registry
- Register original fashion pieces as IP
- Powered by Story Protocol’s IP Registry

### 🎨 Remix Canvas (WIP)
- UI to remix or compose fashion from existing IPs
- Track lineage of creative assets

### 💰 Royalty Dashboard
- View total earnings, pending claims, and payouts
- One-click royalty claiming for each IP

### 🔁 Pay Royalty On Behalf
- Allows remixers or fans to send royalties directly to IP owners
- Supports Story Protocol’s `payRoyaltyOnBehalf` function

### 🔐 Web3 Integration
- Wallet connection via MetaMask
- All blockchain interactions signed securely using the connected wallet or server-side private key

---

## 🔌 Story Protocol Features Used

Your project integrates deeply with the **Story Protocol SDK** to enable on-chain IP + royalty mechanics. Here are the specific features used:

### ✅ IP Asset Management
- `getIpAssetsByOwner({ owner })`: Fetches all IP assets created by a user.
- `getIpAsset({ ipId })`: Retrieve detailed info about a specific IP asset.

### 💸 Royalty Module
- `claimableRevenue({ ipId })`: Shows the pending royalties for an IP.
- `claimRoyalty({ ipId, claimer })`: Allows users to claim accumulated royalties.
- `payRoyaltyOnBehalf({ payerIpId, receiverIpId, token, amount })`: Lets third parties (like remixers or fans) pay royalties to the original IP holder using the WIP token.

### ⚙️ SDK Initialization
- `StoryClient.newClient(config)`: Initializes the SDK with wallet or private key (on server).
- Utilizes both **client-side wallet connection** (via MetaMask) and **server-side private key** (via `.env` file) depending on execution environment.

---

## ⚙️ Tech Stack

| Layer        | Tech                          |
|--------------|-------------------------------|
| Blockchain   | Story Protocol Aeneid Testnet |
| SDK          | @story-protocol/core-sdk      |
| Wallet       | wagmi + viem + MetaMask       |
| UI Framework | Next.js + Tailwind CSS        |
| Token        | WIP Token (ERC20)             |

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# Vogue

