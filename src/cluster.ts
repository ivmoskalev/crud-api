import cluster, { Worker } from 'cluster';
import os from 'os';
import { createServer, IncomingMessage, ServerResponse, request } from 'http';
import dotenv from 'dotenv';

dotenv.config();

const numCPUs: number = os.availableParallelism
  ? os.availableParallelism() - 1
  : os.cpus().length - 1;
const PORT: number = parseInt(process.env.PORT || '4000', 10);

if (cluster.isMaster) {
  // Master process
  let currentWorkerIndex: number = 0;
  const workerPorts: number[] = [];
  const workers: Worker[] = [];

  console.log(`Master process is running on port ${PORT}`);

  // Fork workers
  for (let i = 1; i <= numCPUs; i++) {
    const workerEnv: NodeJS.ProcessEnv = { WORKER_PORT: (PORT + i).toString() };
    const worker: Worker = cluster.fork(workerEnv);
    workerPorts.push(PORT + i);
    workers.push(worker);
  }

  // Load balancer
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const options = {
      hostname: 'localhost',
      port: workerPorts[currentWorkerIndex],
      path: req.url,
      method: req.method,
      headers: req.headers as { [key: string]: string },
    };

    const proxy = request(options, (response) => {
      if (response.statusCode) {
        res.writeHead(response.statusCode, response.headers);
      } else {
        res.writeHead(500);
      }
      response.pipe(res, { end: true });
    });

    proxy.on('error', (err: Error) => {
      res.writeHead(500);
      res.end('Internal Server Error');
      console.error('Proxy error:', err);
    });

    req.pipe(proxy, { end: true });

    // Round-robin
    currentWorkerIndex = (currentWorkerIndex + 1) % workerPorts.length;
  });

  server.listen(PORT, () => {
    console.log(`Load balancer is listening on port ${PORT}`);
  });

  // Shared users data
  let usersData: any[] = [];

  // Handle worker messages for synchronization
  for (const worker of workers) {
    worker.on('message', (message: any) => {
      if (message.type === 'SYNC_USERS') {
        usersData = message.data;

        // Broadcast the updated users data to all workers
        for (const w of workers) {
          w.send({ type: 'UPDATE_USERS', data: usersData });
        }
      }
    });
  }
} else {
  // Worker processes
  const WORKER_PORT: number = parseInt(process.env.WORKER_PORT || '0', 10);

  // Import the application
  import('./worker').then(({ startWorker }) => {
    startWorker(WORKER_PORT);
  });
}
