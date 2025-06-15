'use client';

import { useWalletClient } from 'wagmi';
import { StoryClient} from '@story-protocol/core-sdk';
import { toHex, zeroAddress, custom } from 'viem';
import FameDashboard from './test_rep.js';

export default function Home() {
  const { data: wallet } = useWalletClient();

  async function setupStoryClient() {
    if (!wallet) {
      console.error('Wallet not connected');
      return null;
    }

    const config = {
      wallet,
      transport: custom(wallet.transport),
      chainId: 'aeneid',
    };

    return StoryClient.newClient(config);
  }

  async function registerIp() {
    const client = await setupStoryClient();
    if (!client) return;

    const response = await client.ipAsset.register({
      nftContract: '0xC9fD9f911fA777ffE67ad6627cF2Ca3ca9CD3FEf', // Replace with actual NFT contract address
      tokenId: '0',
      ipMetadata: {
        ipMetadataURI: 'test-metadata-uri',
        ipMetadataHash: toHex('test-metadata-hash', { size: 32 }),
        nftMetadataURI: 'test-nft-metadata-uri',
        nftMetadataHash: toHex('test-nft-metadata-hash', { size: 32 }),
      },
    });

    console.log(
      `Root IPA created at tx hash ${response.txHash}, IPA ID: ${response.ipId}`
    );
  }

  async function attachLicenseTerms() {
    const client = await setupStoryClient();
    if (!client) return;

    const response = await client.license.attachLicenseTerms({
      licenseTermsId: '1603',
      ipId: '0x613845C460094cE8De7E30D884A1d6b3f76D6179',
    });

    if (response.success) {
      console.log(
        `Attached License Terms to IPA at transaction hash ${response.txHash}.`
      );
    } else {
      console.log(`License Terms already attached to this IPA.`);
    }
  }

  async function mintLicenseToken() {
    const client = await setupStoryClient();
    if (!client) return;

    const response = await client.license.mintLicenseTokens({
      licenseTermsId: '1603',
      licensorIpId: '0xFa9F432f984AF5E39D1c0B9B7b58f026Aa543EE9',
      receiver: '0x5dA1F33adb455ACf8F21E8CBaa012c6e6526E2E6',
      amount: 1,
      maxMintingFee: 0n,
      maxRevenueShare: 100,
    });

    console.log(
      `License Token minted at tx hash ${response.txHash}, License IDs: ${response.licenseTokenIds}`
    );
  }

 async function registerLicenseTerms() {
    const client = await setupStoryClient();
    if (!client) return;

    const licenseTerms = {
      transferable: false,
      royaltyPolicy: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E',
      defaultMintingFee: 0n,
      expiration: 0n,
      commercialUse: true,
      commercialAttribution: false,
      commercializerChecker: zeroAddress,
      commercializerCheckerData: '0x',
      commercialRevShare: 10,
      commercialRevCeiling: 0n,
      derivativesAllowed: true,
      derivativesAttribution: false,
      derivativesApproval: false,
      derivativesReciprocal: false,
      derivativeRevCeiling: 0n,
      currency: '0x1514000000000000000000000000000000000000',
      uri: '',
    };

    try {
      const response = await client.license.registerPILTerms(licenseTerms);
      console.log(
        `✅ PIL Terms registered | txHash: ${response.txHash || 'N/A'} | LicenseTermsID: ${response.licenseTermsId}`
      );
    } catch (error) {
      console.error('❌ Failed to register license terms:', error);
    }
  }
    async function fetchLicenseTerms() {
    const client = await setupStoryClient();
    if (!client) return;

    const licenseTermsId = '1603'; // Replace with the desired ID

    try {
      const { terms } = await client.license.getLicenseTerms(licenseTermsId);

      console.log('📜 License Terms fetched:', terms);
    } catch (error) {
      console.error('❌ Failed to fetch license terms:', error);
    }
  }



  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold mb-4">Story Protocol IP Registration</h1>
      <button
        onClick={registerIp}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Register IP
      </button>

      <button
        onClick={registerLicenseTerms}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Register License Terms
      </button>

      <button
        onClick={attachLicenseTerms}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        Attach License Terms
      </button>

      <button
        onClick={mintLicenseToken}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Mint License Token
      </button>
        <button
            onClick={fetchLicenseTerms}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
            Get License Terms
        </button>

        <FameDashboard/>

    </div>
  );
}
