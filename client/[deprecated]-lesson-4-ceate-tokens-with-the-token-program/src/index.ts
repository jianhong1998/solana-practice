import { Keypair, PublicKey } from "@solana/web3.js";
import { config } from "dotenv";
import { KeypairService } from "./keypairs/keypair-service";
import { TransactionService } from "./transaction/transaction";
import { TokenMintService } from "./token-service/token-mint.service";
import { TokenAccountService } from "./token-service/token-account.service";
import { Account } from "@solana/spl-token";
import { MintTokenService } from "./token-service/mint-token.service";
import { TokenTransferService } from "./token-service/token-transfer.service";

config();

class MintTokenProgram {
  private constructor() {}

  public static generateNewKeyPair() {
    const keypair = KeypairService.generateKeypair();

    console.log({
      public: keypair.publicKey.toBase58(),
      private: keypair.secretKey,
      envPrivate: keypair.secretKey.toString(),
    });

    return keypair;
  }

  public static async main() {
    const recipientPublicKeyString = process.env.RECIPIENT_PUBLIC_KEY;
    const recipientPublicKey = new PublicKey(recipientPublicKeyString ?? "");

    const tokenMintPublicKeyString = process.env.TOKEN_MINT_PUBLIC_KEY;
    let tokenMintPublicKey = new PublicKey(tokenMintPublicKeyString ?? "");

    const tokenMintKeypair = KeypairService.getKeypairFromEnv(
      "TOKEN_MINT_SECRET_KEY",
    );

    try {
      if (!tokenMintPublicKeyString) {
        /**
         * Create a new token mint
         */
        console.log("Creating Token Mint...");

        await TransactionService.requestAirDrop(tokenMintKeypair, 1, 0.5);
        const { tokenMint } = await TokenMintService.createTokenMint(
          tokenMintKeypair,
          2,
        );

        tokenMintPublicKey = tokenMint;
      }

      console.log(
        "Creating / getting associated token account with Token Mint...",
      );

      const {
        accountUrl: tokenMintAssociatiedTokenAccountUrl,
        tokenAccount: tokenMintAssociatiedTokenAccount,
      } = await TokenAccountService.getOrCreateTokenAccount({
        accountAddress: tokenMintPublicKey,
        mintAccount: tokenMintPublicKey,
        payerKeypair: tokenMintKeypair,
      });

      const tokenMintUrl = TokenMintService.getTokenMintUrl(tokenMintPublicKey);

      console.log("Getting recipient token account...");
      const {
        accountUrl: recipientTokenAccountUrl,
        tokenAccount: recipientTokenAccount,
      } = await TokenAccountService.getOrCreateTokenAccount({
        accountAddress: recipientPublicKey,
        mintAccount: tokenMintPublicKey,
        payerKeypair: tokenMintKeypair,
      });

      console.log({
        recipientTokenAccountAddress: recipientTokenAccount.address,
        recipientTokenAccountUrl,
      });

      console.log("Start Minting Token...");

      const {
        transactionSignature: mintTokenTransactionSignature,
        transactionUrl: mintTokenTransactionUrl,
      } = await MintTokenService.mintToken({
        userKeypair: tokenMintKeypair,
        recipientTokenAccountAddress: tokenMintAssociatiedTokenAccount.address,
        tokenMintAccount: tokenMintPublicKey,
        amount: 1,
      });

      console.log("Mint token successfully.");
      console.log({
        tokenMintUrl,
        tokenMintAssociatiedTokenAccountUrl,
        mintTokenTransactionSignature,
        mintTokenTransactionUrl,
      });

      console.log("Start transfering to recipient...");

      const {
        transactionSignature: transferTransactionSignature,
        transactionUrl: transferTransactionUrl,
      } = await TokenTransferService.transferToken({
        senderKeypair: tokenMintKeypair,
        recipientTokenAccountAddress: recipientTokenAccount.address,
        senderTokenAccountAddress: tokenMintAssociatiedTokenAccount.address,
        tokenAmount: 1,
        tokenMintAccount: tokenMintKeypair,
      });

      console.log("Transfering success.");
      console.log({
        transferTransactionSignature,
        transferTransactionUrl,
      });
    } catch (error) {
      console.log("Transaction Error!");
      console.log(error);
    }
  }
}

// Use to generate a new key pair
// MintTokenProgram.generateNewKeyPair();

MintTokenProgram.main();
