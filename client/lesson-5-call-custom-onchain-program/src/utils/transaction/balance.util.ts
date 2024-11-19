import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export class BalanceUtil {
  constructor(private readonly connection: Connection) {}

  public async getBalance(accountPublicKey: PublicKey) {
    const balanceInLamport = await this.connection.getBalance(accountPublicKey);

    const balanceInSol = balanceInLamport / LAMPORTS_PER_SOL;

    return {
      sol: balanceInSol,
      lamport: balanceInLamport,
    };
  }
}
