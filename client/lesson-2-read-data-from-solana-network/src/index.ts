// import { KeypairUtil } from './keypair/keypair-service';
import { SolanaDevConnection } from "./solana/solana-dev-connection";
import { SolanaMainConnection } from "./solana/solana-main-connection";

const readFromDevNet = async () => {
  // Generate Address (public key)
  // console.log(KeypairUtil.generateKeypair().publicKey.toBase58());

  const addresses = {
    tutorial: "CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN",
    generated: "J4xdUpsM1VMiJCeTYmZD7jUUZMRQcxMJFqA6coVwg9Rz",
    toly: "GgJJRwLg9NzFQ97o1CJLGLp1KLSUMBwFc6eQNVEr4fbW",
  };

  const {
    balance: { lamports, sol },
  } = await SolanaDevConnection.readFromNetwork(addresses.generated);

  console.log({
    lamports,
    sol,
  });
};

const readFromMainNet = async () => {
  const addresses = {
    toly: "GgJJRwLg9NzFQ97o1CJLGLp1KLSUMBwFc6eQNVEr4fbW",
    jh: "6BBd9rnKzmyQsjuEQuwFr1ixSFywjiTJ9H5uaPpCLfgx",
  };

  const {
    balance: { lamports, sol },
  } = await SolanaMainConnection.readFromNetwork(addresses.jh);

  console.log({
    lamports,
    sol,
  });
};

// readFromDevNet();
readFromMainNet();
