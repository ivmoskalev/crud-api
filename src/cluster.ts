import cluster, { Worker } from 'cluster';
import os from 'os';
import { createServer, IncomingMessage, ServerResponse, request } from 'http';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { User } from './models/user';

dotenv.config();

const numCPUs: number = os.availableParallelism
  ? os.availableParallelism() - 1
  : os.cpus().length - 1;
const PORT: number = parseInt(process.env.PORT || '4000', 10);

const users: User[] = [];

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running on port ${PORT}`);

  const workerPorts: number[] = [];
  const workerIdToPort = new Map<number, number>();

  const createWorker = (port: number) => {
    const workerEnv = { WORKER_PORT: port.toString() };
    const worker = cluster.fork(workerEnv);
    workerIdToPort.set(worker.id, port);

    worker.on('message', (msg: { type: string, requestId: string, payload?: any }) => {
      let response: { data?: any; error?: string } = {};
      switch (msg.type) {
        case 'user:getAll':
          response.data = users;
          break;
        case 'user:getById':
          response.data = users.find((u) => u.id === msg.payload.id);
          break;
        case 'user:create':
          const newUser: User = { id: uuidv4(), ...msg.payload };
          users.push(newUser);
          response.data = newUser;
          break;
        case 'user:update':
          const userIndex = users.findIndex((u) => u.id === msg.payload.id);
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...msg.payload.data };
            response.data = users[userIndex];
          } else {
            response.error = 'User not found';
          }
          break;
        case 'user:delete':
          const userIdxToDelete = users.findIndex((u) => u.id === msg.payload.id);
          if (userIdxToDelete !== -1) {
            users.splice(userIdxToDelete, 1);
            response.data = { success: true };
          } else {
            response.error = 'User not found';
          }
          break;
        default:
          response.error = 'Unknown command';
      }
      worker.send({ requestId: msg.requestId, ...response });
    });
  };

  for (let i = 1; i <= numCPUs; i++) {
    const workerPort = PORT + i;
    workerPorts.push(workerPort);
    createWorker(workerPort);
  }

  cluster.on('exit', (worker: Worker, code: number, signal: string) => {
    console.error(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    console.log('Starting a new worker...');
    const workerPort = workerIdToPort.get(worker.id);
    if (workerPort) {
      workerIdToPort.delete(worker.id);
      createWorker(workerPort);
    }
  });

  let currentWorkerIndex = 0;

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const targetPort = workerPorts[currentWorkerIndex];
    currentWorkerIndex = (currentWorkerIndex + 1) % workerPorts.length;

    const options = {
      hostname: 'localhost',
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxy = request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode!, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxy.on('error', (err) => {
      console.error(`Proxy error to worker on port ${targetPort}:`, err);
      res.writeHead(500);
      res.end('Internal Server Error');
    });

    req.pipe(proxy, { end: true });
  });

  server.listen(PORT, () => {
    console.log(`Load balancer is listening on port ${PORT}`);
  });

} else {
  const WORKER_PORT: number = parseInt(process.env.WORKER_PORT || '0', 10);
  import('./worker').then(({ startWorker }) => {
    startWorker(WORKER_PORT);
  });
}