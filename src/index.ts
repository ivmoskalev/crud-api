import { startWorker } from './worker';
import dotenv from 'dotenv';

dotenv.config();

const PORT: number = parseInt(process.env.PORT || '4000', 10);

startWorker(PORT);
