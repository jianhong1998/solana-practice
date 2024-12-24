import { Cluster, clusterApiUrl, Connection } from '@solana/web3.js';

export type ConnectionInstanceType = Cluster | 'localnet';

export class ConnectionUtil {
  devNetConnection: Connection;
  mainNetConnection: Connection;
  localNetConnection: Connection;

  private static instance: ConnectionUtil;

  private constructor() {
    this.devNetConnection = new Connection(clusterApiUrl('devnet'));
    this.mainNetConnection = new Connection(clusterApiUrl('mainnet-beta'));
    this.localNetConnection = new Connection('http://localhost:8899');
  }

  private static getInstance(): ConnectionUtil {
    if (!this.instance) {
      this.instance = new ConnectionUtil();
    }

    return this.instance;
  }

  public static getConnection(
    instanceType: ConnectionInstanceType
  ): Connection {
    const instance = this.getInstance();

    switch (instanceType) {
      case 'devnet':
        return instance.devNetConnection;
      case 'localnet':
        return instance.localNetConnection;
      case 'mainnet-beta':
        return instance.mainNetConnection;
      default:
        throw new Error(
          `Failed to get connection: Invalid instanceType (${instanceType})`
        );
    }
  }
}
