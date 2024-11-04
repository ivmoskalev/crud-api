// src/worker.ts

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { router } from './app';
import users from './database/inMemoryDatabase';
import { User } from './models/user';

export function startWorker(PORT: number): void {
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    router(req, res);
  });

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} is listening on port ${PORT}`);
  });

  // Handle messages from the master process
  process.on('message', (message: any) => {
    if (message.type === 'UPDATE_USERS') {
      users.length = 0;
      users.push(...(message.data as User[]));
    }
  });
}
