import { BN } from '@coral-xyz/anchor';
import { randomBytes } from 'node:crypto';

export const getRandomBigNumber = (size: number = 8) => {
  return new BN(randomBytes(size));
};
