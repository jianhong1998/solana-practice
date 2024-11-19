import { SolanaDevConnection } from './connection/solana-dev-connection';
import { AirdropUtil, BalanceUtil, PingUtil } from './utils/transaction';
import { SENDER_KEYPAIR } from './constants';

const main = async () => {
  const connection = SolanaDevConnection.getConnection();

  const currentBalance = await new BalanceUtil(connection).getBalance(
    SENDER_KEYPAIR.publicKey,
  );

  console.log({
    sender: {
      privateKey: Buffer.from(SENDER_KEYPAIR.secretKey).toString('hex'),
      publicKey: SENDER_KEYPAIR.publicKey.toBase58(),
    },
    currentBalance,
  });

  // Request Airdrop if current balance is less than 1
  if (currentBalance.sol < 1) {
    console.log(
      `Current balance is less than 1 SOL (${currentBalance.sol} SOL). Requesting for Airdrop...`,
    );

    const airdropUtil = new AirdropUtil(connection);
    airdropUtil.requestAirdrop({
      amountInSol: 1,
      recipientPublicKey: SENDER_KEYPAIR.publicKey,
    });
  }

  await new PingUtil(connection).test(SENDER_KEYPAIR);
};

main();
