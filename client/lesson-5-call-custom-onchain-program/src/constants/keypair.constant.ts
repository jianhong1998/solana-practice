import { EnvironmentVariableUtil } from '../utils/env-var';
import { KeypairUtil } from '../utils/keypair/keypair.util';

// Sender Key Pair
const senderSecretKey = EnvironmentVariableUtil.getEnvVar('senderSecretKey');
export const SENDER_KEYPAIR = KeypairUtil.getKeypair(senderSecretKey);
