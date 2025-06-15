// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import { IIPAssetRegistry } from "protocol-core-v1/contracts/interfaces/registries/IIPAssetRegistry.sol";
import { ILicenseRegistry } from "protocol-core-v1/contracts/interfaces/registries/ILicenseRegistry.sol";
import { IPILicenseTemplate } from "../protocol-core-v1/contracts/interfaces/modules/licensing/IPILicenseTemplate.sol";
import { ILicensingModule } from "../protocol-core-v1/contracts/interfaces/modules/licensing/ILicensingModule.sol";
import { IRoyaltyModule } from "../protocol-core-v1/contracts/interfaces/modules/royalty/IRoyaltyModule.sol";
import { PILTerms } from "../protocol-core-v1/contracts/interfaces/modules/licensing/IPILicenseTemplate.sol";
import { PILFlavors } from "../protocol-core-v1/contracts/lib/PILFlavors.sol";
import {RoyaltyWorkflows} from "./mocks/MockRoyaltyWorkflows.sol";



contract FashionRemixNFT is ERC1155, Ownable(msg.sender), ERC2981 {
    uint256 public nextTokenId = 1;
    
    // Protocol addresses
    IIPAssetRegistry public immutable IP_ASSET_REGISTRY;
    IPILicenseTemplate public immutable PIL_TEMPLATE;
    ILicensingModule public immutable LICENSING_MODULE;
    ILicenseRegistry public immutable LICENSE_REGISTRY;
    IRoyaltyModule public immutable ROYALTY_MODULE;
    RoyaltyWorkflows public immutable ROYALTY_WORKFLOWS;
    address public immutable ROYALTY_POLICY_LAP;
    address public immutable MERC20;

    struct Design {
        uint256 parentId;
        address creator;
        uint96 royalty; // in basis points (e.g., 1000 = 10%)
        bool isOriginal;
        address ipId; // Story Protocol IP Asset ID
        uint256 licenseTermsId; // PIL License Terms ID
        uint256[] licenseTokenIds; // License tokens used for derivative registration
    }

    mapping(uint256 => Design) public designs;
    mapping(uint256 => address) public tokenToIpId; // tokenId => ipId
    mapping(address => uint256[]) public creatorDesigns; // creator => tokenIds

    event IPAssetRegistered(uint256 indexed tokenId, address indexed ipId);
    event LicenseTermsRegistered(uint256 indexed licenseTermsId);
    event LicenseTermsAttached(uint256 indexed tokenId, address indexed ipId, uint256 indexed licenseTermsId);
    event DerivativeRegistered(uint256 indexed childTokenId, uint256 indexed parentTokenId, address indexed childIpId);
    event LicenseTokensMinted(uint256 indexed tokenId, uint256 startLicenseTokenId, uint256 amount, address receiver);
    event RoyaltyPaid(address indexed ipId, address payer, uint256 amount);
    event RevenueClaimed(address indexed ipId, uint256 amount);

    constructor(
        address _ipAssetRegistry,
        address _pilTemplate,
        address _licensingModule,
        address _licenseRegistry,
        address _royaltyModule,
        address _royaltyWorkflows,
        address _royaltyPolicyLAP,
        address _merc20
    ) ERC1155("https://api.yourapp.com/metadata/{id}.json") {
        IP_ASSET_REGISTRY = IIPAssetRegistry(_ipAssetRegistry);
        PIL_TEMPLATE = IPILicenseTemplate(_pilTemplate);
        LICENSING_MODULE = ILicensingModule(_licensingModule);
        LICENSE_REGISTRY = ILicenseRegistry(_licenseRegistry);
        ROYALTY_MODULE = IRoyaltyModule(_royaltyModule);
        ROYALTY_WORKFLOWS = RoyaltyWorkflows(_royaltyWorkflows);
        ROYALTY_POLICY_LAP = _royaltyPolicyLAP;
        MERC20 = _merc20;
    }

    // ------------------------------
    //         REPUTATION
    // ------------------------------

    mapping(address => uint256) public creatorReputation;
    mapping(address => uint256) public creatorSales;
    mapping(address => uint256) public creatorLikes;
    
    event ReputationBoosted(address indexed creator, uint256 newReputation);
    event SaleRecorded(address indexed creator, uint256 amount);
    event LikeAdded(address indexed creator, uint256 newLikeCount);

    function recordSale(address creator, uint256 amount) external {
        creatorSales[creator] += amount;
        _updateReputation(creator);
        emit SaleRecorded(creator, amount);
    }

    function likeCreator(address creator) external {
        creatorLikes[creator] += 1;
        _updateReputation(creator);
        emit LikeAdded(creator, creatorLikes[creator]);
    }

    function _updateReputation(address creator) internal {
        // Simple weighted formula: 1 like = 10 pts, 1 token sold = 1 pt
        uint256 rep = (creatorLikes[creator] * 10) + (creatorSales[creator]);
        creatorReputation[creator] = rep;
        emit ReputationBoosted(creator, rep);
    }

    function getCreatorTier(address creator) external view returns (string memory) {
        uint256 rep = creatorReputation[creator];
        if (rep >= 1000) return "Legendary";
        if (rep >= 500) return "Epic";
        if (rep >= 100) return "Rare";
        return "Common";
    }

    function getReputation(address creator) external view returns (uint256) {
        return creatorReputation[creator];
    }

    // ------------------------------
    //         MINTING
    // ------------------------------

    function mintOriginal(uint256 amount, uint96 royaltyFee) external {
        uint256 tokenId = nextTokenId++;
        _mint(msg.sender, tokenId, amount, "");

        // Register as IP Asset
        address ipId = _registerIPAsset(tokenId);
        
        // Register PIL terms for original designs
        uint256 licenseTermsId = _registerPILTerms();
        
        // Attach license terms to the IP Asset
        _attachLicenseTerms(ipId, licenseTermsId);

        uint256[] memory emptyLicenseTokens = new uint256[](0);
        designs[tokenId] = Design({
            parentId: 0,
            creator: msg.sender,
            royalty: royaltyFee,
            isOriginal: true,
            ipId: ipId,
            licenseTermsId: licenseTermsId,
            licenseTokenIds: emptyLicenseTokens
        });

        tokenToIpId[tokenId] = ipId;
        creatorDesigns[msg.sender].push(tokenId);
        _setTokenRoyalty(tokenId, msg.sender, royaltyFee);
    }

    function remixDesign(uint256 parentId, uint256 amount, uint256[] memory licenseTokenIds) external payable {
        require(designs[parentId].isOriginal || designs[parentId].parentId != 0, "Parent design not found");
        require(licenseTokenIds.length > 0, "License tokens required for remix");
        require(msg.value >= 0.01 ether, "Remix fee required");

        uint256 childId = nextTokenId++;
        _mint(msg.sender, childId, amount, "");

        address parentCreator = designs[parentId].creator;
        uint96 royalty = designs[parentId].royalty;

        // Register remix as IP Asset
        address ipId = _registerIPAsset(childId);
        
        // Register as derivative using license tokens
        _registerDerivativeWithLicenseTokens(ipId, licenseTokenIds);
        
        // Use same license terms as parent for remixes
        uint256 licenseTermsId = designs[parentId].licenseTermsId;
        
        // Attach license terms to the remix IP Asset
        _attachLicenseTerms(ipId, licenseTermsId);

        designs[childId] = Design({
            parentId: parentId,
            creator: msg.sender,
            royalty: royalty,
            isOriginal: false,
            ipId: ipId,
            licenseTermsId: licenseTermsId,
            licenseTokenIds: licenseTokenIds
        });

        tokenToIpId[childId] = ipId;
        creatorDesigns[msg.sender].push(childId);
        payable(parentCreator).transfer(msg.value);
        _setTokenRoyalty(childId, parentCreator, royalty);

        emit DerivativeRegistered(childId, parentId, ipId);
    }

    // ------------------------------
    //         IP REGISTRATION
    // ------------------------------

    function _registerIPAsset(uint256 tokenId) internal returns (address) {
        address ipId = IP_ASSET_REGISTRY.register(block.chainid, address(this), tokenId);
        
        emit IPAssetRegistered(tokenId, ipId);
        return ipId;
    }

    function _registerPILTerms() internal returns (uint256) {
        PILTerms memory pilTerms = PILFlavors.commercialRemix({
            mintingFee: 0,
            commercialRevShare: 10 * 10 ** 6, // 10%
            royaltyPolicy: ROYALTY_POLICY_LAP,
            currencyToken: MERC20
        });

        uint256 licenseTermsId = PIL_TEMPLATE.registerLicenseTerms(pilTerms);
        emit LicenseTermsRegistered(licenseTermsId);
        return licenseTermsId;
    }

    function _attachLicenseTerms(address ipId, uint256 licenseTermsId) internal {
        LICENSING_MODULE.attachLicenseTerms(ipId, address(PIL_TEMPLATE), licenseTermsId);
        emit LicenseTermsAttached(0, ipId, licenseTermsId);
    }

    function _registerDerivativeWithLicenseTokens(address childIpId, uint256[] memory licenseTokenIds) internal {
        LICENSING_MODULE.registerDerivativeWithLicenseTokens({
            childIpId: childIpId,
            licenseTokenIds: licenseTokenIds,
            royaltyContext: "", // empty for PIL
            maxRts: 0
        });
    }

    // ------------------------------
    //         LICENSE TOKEN FUNCTIONS
    // ------------------------------

    /// @notice Mint license tokens for an IP Asset
    /// @param tokenId The token ID of the IP Asset
    /// @param amount Number of license tokens to mint
    /// @param receiver Address to receive the license tokens
    /// @return startLicenseTokenId The starting ID of minted license tokens
    function mintLicenseTokens(
        uint256 tokenId,
        uint256 amount,
        address receiver
    ) external returns (uint256) {
        require(designs[tokenId].creator != address(0), "Token does not exist");
        require(designs[tokenId].creator == msg.sender, "Only creator can mint license tokens");
        
        address ipId = designs[tokenId].ipId;
        uint256 licenseTermsId = designs[tokenId].licenseTermsId;
        
        uint256 startLicenseTokenId = LICENSING_MODULE.mintLicenseTokens({
            licensorIpId: ipId,
            licenseTemplate: address(PIL_TEMPLATE),
            licenseTermsId: licenseTermsId,
            amount: amount,
            receiver: receiver,
            royaltyContext: "", // for PIL, royaltyContext is empty string
            maxMintingFee: 0,
            maxRevenueShare: 0
        });
        
        emit LicenseTokensMinted(tokenId, startLicenseTokenId, amount, receiver);
        return startLicenseTokenId;
    }

    /// @notice Check if license terms are attached to an IP Asset
    /// @param tokenId The token ID to check
    /// @return bool Whether license terms are attached
    function hasAttachedLicenseTerms(uint256 tokenId) external view returns (bool) {
        address ipId = designs[tokenId].ipId;
        uint256 licenseTermsId = designs[tokenId].licenseTermsId;
        
        return LICENSE_REGISTRY.hasIpAttachedLicenseTerms(ipId, address(PIL_TEMPLATE), licenseTermsId);
    }

    /// @notice Get the number of attached license terms for an IP Asset
    /// @param tokenId The token ID to check
    /// @return count Number of attached license terms
    function getAttachedLicenseTermsCount(uint256 tokenId) external view returns (uint256) {
        address ipId = designs[tokenId].ipId;
        return LICENSE_REGISTRY.getAttachedLicenseTermsCount(ipId);
    }

    // ------------------------------
    //         ROYALTY & PAYMENT FUNCTIONS
    // ------------------------------

    /// @notice Pay royalty to an IP Asset
    /// @param tokenId The token ID to pay royalty to
    /// @param amount Amount of MERC20 tokens to pay
    function payRoyalty(uint256 tokenId, uint256 amount) external {
        require(designs[tokenId].creator != address(0), "Token does not exist");
        address ipId = designs[tokenId].ipId;
        
        // Transfer MERC20 from sender to this contract first
        IERC20(MERC20).transferFrom(msg.sender, address(this), amount);
        
        // Approve royalty module to spend tokens
        IERC20(MERC20).approve(address(ROYALTY_MODULE), amount);
        
        // Pay royalty on behalf
        ROYALTY_MODULE.payRoyaltyOnBehalf(ipId, address(0), MERC20, amount);
        
        emit RoyaltyPaid(ipId, msg.sender, amount);
    }

    /// @notice Claim revenue for an ancestor IP from its derivatives
    /// @param ancestorTokenId The ancestor IP token ID
    /// @param childTokenIds Array of derivative token IDs to claim from
    /// @return amountsClaimed Array of amounts claimed from each derivative
    function claimRevenue(
        uint256 ancestorTokenId,
        uint256[] memory childTokenIds
    ) external returns (uint256[] memory) {
        require(designs[ancestorTokenId].creator == msg.sender, "Only creator can claim revenue");
        
        address ancestorIpId = designs[ancestorTokenId].ipId;
        
        address[] memory childIpIds = new address[](childTokenIds.length);
        address[] memory royaltyPolicies = new address[](childTokenIds.length);
        address[] memory currencyTokens = new address[](childTokenIds.length);
        
        for (uint256 i = 0; i < childTokenIds.length; i++) {
            require(designs[childTokenIds[i]].creator != address(0), "Child token does not exist");
            childIpIds[i] = designs[childTokenIds[i]].ipId;
            royaltyPolicies[i] = ROYALTY_POLICY_LAP;
            currencyTokens[i] = MERC20;
        }
        
        uint256[] memory amountsClaimed = ROYALTY_WORKFLOWS.claimAllRevenue({
            ancestorIpId: ancestorIpId,
            claimer: ancestorIpId,
            childIpIds: childIpIds,
            royaltyPolicies: royaltyPolicies,
            currencyTokens: currencyTokens
        });
        
        uint256 totalClaimed = 0;
        for (uint256 i = 0; i < amountsClaimed.length; i++) {
            totalClaimed += amountsClaimed[i];
        }
        
        emit RevenueClaimed(ancestorIpId, totalClaimed);
        return amountsClaimed;
    }

    /// @notice Get the royalty vault balance for a token
    /// @param tokenId The token ID to check
    /// @return balance The MERC20 balance in the royalty vault
    function getRoyaltyVaultBalance(uint256 tokenId) external view returns (uint256) {
        address ipId = designs[tokenId].ipId;
        address royaltyVault = ROYALTY_MODULE.ipRoyaltyVaults(ipId);
        return IERC20(MERC20).balanceOf(royaltyVault);
    }

    // ------------------------------
    //         DERIVATIVE QUERY FUNCTIONS
    // ------------------------------

    /// @notice Check if a token is a derivative
    /// @param tokenId The token ID to check
    /// @return bool Whether the token is a derivative
    function isDerivative(uint256 tokenId) external view returns (bool) {
        address ipId = designs[tokenId].ipId;
        return LICENSE_REGISTRY.isDerivativeIp(ipId);
    }

    /// @notice Check if a token has derivatives
    /// @param tokenId The token ID to check
    /// @return bool Whether the token has derivatives
    function hasDerivatives(uint256 tokenId) external view returns (bool) {
        address ipId = designs[tokenId].ipId;
        return LICENSE_REGISTRY.hasDerivativeIps(ipId);
    }

    /// @notice Get the number of derivatives for a token
    /// @param tokenId The token ID to check
    /// @return count Number of derivatives
    function getDerivativeCount(uint256 tokenId) external view returns (uint256) {
        address ipId = designs[tokenId].ipId;
        return LICENSE_REGISTRY.getDerivativeIpCount(ipId);
    }

    /// @notice Get a derivative IP at a specific index
    /// @param parentTokenId The parent token ID
    /// @param index The index of the derivative
    /// @return derivativeIpId The derivative IP ID
    function getDerivativeAt(uint256 parentTokenId, uint256 index) external view returns (address) {
        address parentIpId = designs[parentTokenId].ipId;
        return LICENSE_REGISTRY.getDerivativeIp({parentIpId: parentIpId, index: index});
    }

    /// @notice Get the number of parent IPs for a derivative
    /// @param tokenId The derivative token ID
    /// @return count Number of parent IPs
    function getParentCount(uint256 tokenId) external view returns (uint256) {
        address ipId = designs[tokenId].ipId;
        return LICENSE_REGISTRY.getParentIpCount(ipId);
    }

    /// @notice Get a parent IP at a specific index
    /// @param childTokenId The child token ID
    /// @param index The index of the parent
    /// @return parentIpId The parent IP ID
    function getParentAt(uint256 childTokenId, uint256 index) external view returns (address) {
        address childIpId = designs[childTokenId].ipId;
        return LICENSE_REGISTRY.getParentIp({childIpId: childIpId, index: index});
    }

    // ------------------------------
    //         GETTER FUNCTIONS
    // ------------------------------

    /// Get the metadata URI for a token
    function getTokenURI(uint256 tokenId) external view returns (string memory) {
        return uri(tokenId);
    }

    /// Get all design metadata
    function getDesign(uint256 tokenId) external view returns (
        uint256 parentId,
        address creator,
        uint256 royalty,
        bool originalStatus,
        address ipId,
        uint256 licenseTermsId,
        uint256[] memory licenseTokenIds
    ) {
        Design memory d = designs[tokenId];
        return (d.parentId, d.creator, d.royalty, d.isOriginal, d.ipId, d.licenseTermsId, d.licenseTokenIds);
    }

    /// Get creator of a design
    function getCreator(uint256 tokenId) external view returns (address) {
        return designs[tokenId].creator;
    }

    /// Check if token is original design
    function isOriginal(uint256 tokenId) external view returns (bool) {
        return designs[tokenId].isOriginal;
    }

    /// Get parent of a remix
    function getParent(uint256 tokenId) external view returns (uint256) {
        require(!designs[tokenId].isOriginal, "Original has no parent");
        return designs[tokenId].parentId;
    }

    /// Get IP Asset ID for a token
    function getIpId(uint256 tokenId) external view returns (address) {
        return designs[tokenId].ipId;
    }

    /// Get License Terms ID for a token
    function getLicenseTermsId(uint256 tokenId) external view returns (uint256) {
        return designs[tokenId].licenseTermsId;
    }

    /// Get license token IDs used for derivative registration
    function getLicenseTokenIds(uint256 tokenId) external view returns (uint256[] memory) {
        return designs[tokenId].licenseTokenIds;
    }

    /// Get royalty info (from ERC2981)
    function getRoyaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (
        address receiver,
        uint256 royaltyAmount
    ) {
        return royaltyInfo(tokenId, salePrice);
    }

    /// Get balance of a token for a user
    function getBalance(address user, uint256 tokenId) external view returns (uint256) {
        return balanceOf(user, tokenId);
    }

    /// Get total tokens created so far
    function getTotalDesigns() external view returns (uint256) {
        return nextTokenId - 1;
    }

    /// Get all designs created by a specific creator
    function getCreatorDesigns(address creator) external view returns (uint256[] memory) {
        return creatorDesigns[creator];
    }

    // ------------------------------
    //         OWNER WITHDRAW
    // ------------------------------

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // ------------------------------
    //         INTERFACE SUPPORT
    // ------------------------------

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
