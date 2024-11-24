import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

type ITransferSolParams = {
  amountInSol: number;
  publicKeys: {
    recipient: PublicKey;
    sender: PublicKey;
  };
  sendTransactionFn: WalletContextState['sendTransaction'];
};

export class TransactionUtil {
  constructor(private readonly connection: Connection) {}

  public async transferSol(params: ITransferSolParams) {
    const { amountInSol, publicKeys, sendTransactionFn } = params;

    const amounInLamports = amountInSol * LAMPORTS_PER_SOL;
    const transaction = new Transaction();

    const sendSolInstruction = SystemProgram.transfer({
      fromPubkey: publicKeys.sender,
      toPubkey: publicKeys.recipient,
      lamports: amounInLamports,
    });

    transaction.add(sendSolInstruction);

    const signature = await sendTransactionFn(transaction, this.connection);

    return signature;
  }
}
