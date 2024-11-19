import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionConfirmationStrategy,
} from '@solana/web3.js';
import { airdropIfRequired } from '@solana-developers/helpers';
import { BalanceUtil } from './balance.util';

type IRequestAirdropParams = {
  recipientPublicKey: PublicKey;
  amountInSol: number;
};

export class AirdropUtil {
  constructor(private readonly connection: Connection) {}

  public async requestAirdrop(params: IRequestAirdropParams) {
    const { recipientPublicKey, amountInSol } = params;
    const balanceUtil = new BalanceUtil(this.connection);

    const amountInLamport = amountInSol * LAMPORTS_PER_SOL;

    const currentBalance = await balanceUtil.getBalance(recipientPublicKey);

    const transactionSignature = await this.connection.requestAirdrop(
      recipientPublicKey,
      amountInLamport,
    );
    const latestBlockchainHash = await this.connection.getLatestBlockhash();
    await this.connection.confirmTransaction({
      signature: transactionSignature,
      blockhash: latestBlockchainHash.blockhash,
      lastValidBlockHeight: latestBlockchainHash.lastValidBlockHeight,
    });

    const latestBalance = await balanceUtil.getBalance(recipientPublicKey);

    console.log({
      currentBalance,
      latestBalance,
    });

    if (currentBalance.lamport <= latestBalance.lamport) {
      throw new Error(
        `Something went wrong. Balance after request (${latestBalance.sol} SOL) is not more than balance before request (${currentBalance.sol} SOL)`,
      );
    }
  }
}
