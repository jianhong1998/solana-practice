import { join } from 'path';

/**
 * @note `APP_NAME` must be same with the IDL JSON file name in folder `./anchor/target/idl`
 */
export const APP_NAME = 'defi';

export const IS_TESTING_ON_CHAIN = process.env.IS_TESTING_ON_CHAIN
  ? process.env.IS_TESTING_ON_CHAIN === 'true'
  : false;

export const PROGRAM_OWNER_ID_FILE_PATH = join(
  __dirname,
  '../fixtures/keypairs/program-owner-id.json',
);

export const FEE_PAYER_ID_FILE_PATH = join(
  __dirname,
  '../fixtures/keypairs/fee-payer-id.json',
);

export const SOL_PRICE_FEED_ID =
  '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d';
export const USDC_PRICE_FEED_ID =
  '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a';
