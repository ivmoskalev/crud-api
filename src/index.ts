import { createServer } from 'http';
import { router } from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = createServer(router);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
