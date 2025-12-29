import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, } from "@solana/web3.js";
import { generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"),);

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey("69c19iwsnJvfyozHzZ7n4fYaZjwqF9SWYASMhRDv7Ry2");

console.log("creating NFT...");

const mint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint: mint,
    name: "My NFT",
    uri: "https://...",
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
        key: collectionAddress,
        verified: false,
    }
})

await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log(`Created NFT! Address is ${getExplorerLink("address", createdNft.mint.publicKey, "devnet")}`);