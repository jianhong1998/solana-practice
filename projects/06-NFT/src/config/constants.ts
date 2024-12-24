import { join } from 'path';
import { ConnectionInstanceType } from '../utils/connection.util';

export const INSTANCE_TYPE: ConnectionInstanceType = 'devnet';
export const KEYPAIR_FILE_PATH = join(__dirname, '../../temp/keypairs/id.json');
