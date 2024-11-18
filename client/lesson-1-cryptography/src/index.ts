import { config } from "dotenv";
import { KeypairService } from "./get-key-pair/get-key-pair";
config();

const keypair = KeypairService.getKeypairFromEnv();

console.log({
  publicKey: keypair.publicKey.toBase58(),
  privateKey: Buffer.from(keypair.secretKey.buffer).toString("hex"),
});
