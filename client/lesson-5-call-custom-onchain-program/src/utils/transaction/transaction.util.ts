import { Connection } from '@solana/web3.js';

export class TransactionUtil {
  constructor(private readonly connection: Connection) {}

  public async getTransaction(signature: string) {
    return await this.connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 1,
    });
  }
}
