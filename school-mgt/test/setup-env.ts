import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ quiet: true, path: resolve(__dirname, '..', '.env.test') });
