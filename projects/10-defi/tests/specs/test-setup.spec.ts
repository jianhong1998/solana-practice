import {
  FEE_PAYER_ID_FILE_PATH,
  PROGRAM_OWNER_ID_FILE_PATH,
} from '../constants';
import { KeypairUtil } from '../utils/keypair.util';

describe('Test setup', () => {
  it('test constants', async () => {
    const expectedProgramOwnerPublicKey =
      'Po8d1QjUKezSQV9AR3g5AYDQRAZNCEksPRWZWYgy7j1';
    const expectedFeePayerPublicKey =
      'feewVkBiyoj1C8UD5ftEgx1WnEJgUMFs3jqLYM1hJCh';

    const programOwnerKeypair = await KeypairUtil.readKeypairFromFile(
      PROGRAM_OWNER_ID_FILE_PATH,
    );
    const payerKeypair = await KeypairUtil.readKeypairFromFile(
      FEE_PAYER_ID_FILE_PATH,
    );

    expect(programOwnerKeypair.publicKey.toBase58()).toBe(
      expectedProgramOwnerPublicKey,
    );
    expect(payerKeypair.publicKey.toBase58()).toBe(expectedFeePayerPublicKey);
  });
});
