import { createServer } from 'http';
import { router } from './app';

export function startWorker(PORT: number): void {
  const server = createServer(router);

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} is listening on port ${PORT}`);
  });
}
