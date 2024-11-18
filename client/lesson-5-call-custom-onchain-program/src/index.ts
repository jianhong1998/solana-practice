import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SolanaDevConnection } from "./connection/solana-dev-connection";
import { EnvironmentVariableUtil } from "./utils/env-var";
import { KeypairUtil } from "./utils/keypair/keypair.util";

const privateKeyEnv = EnvironmentVariableUtil.getEnvVar("senderSecretKey");

const keypair = KeypairUtil.getKeypair(privateKeyEnv);

const privateKey = keypair.secretKey.toString();
const publicKey = keypair.publicKey.toBase58();

console.log({ privateKey, publicKey: keypair.publicKey.toBase58() });

SolanaDevConnection.getConnection()
  .getBalance(new PublicKey(publicKey))
  .then((balanceInLamport) => {
    console.log({
      balance: {
        lamport: balanceInLamport,
        sol: balanceInLamport / LAMPORTS_PER_SOL,
      },
    });
  });
