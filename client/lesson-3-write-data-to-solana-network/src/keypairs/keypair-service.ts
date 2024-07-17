import { getKeypairFromEnvironment } from '@solana-developers/helpers';
import { Keypair } from '@solana/web3.js';

export class KeypairService {
    private constructor() {}

    public static generateKeypair() {
        const keypair = Keypair.generate();
        return keypair;
    }

    public static getKeypairFromEnv(envVarName: string) {
        return getKeypairFromEnvironment(envVarName);
    }
}
