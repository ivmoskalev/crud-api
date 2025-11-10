import cluster from 'cluster';
import { randomUUID } from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user';

let dbClient: {
  getAll: () => Promise<User[]>;
  getById: (id: string) => Promise<User | undefined>;
  create: (userData: Omit<User, 'id'>) => Promise<User>;
  update: (id: string, userData: Partial<Omit<User, 'id'>>) => Promise<User>;
  delete: (id: string) => Promise<void>;
};

if (cluster.isWorker) {
  // ==================================================================
  // MULTI-PROCESS (CLUSTER) MODE IMPLEMENTATION
  // Communicates with the primary process via IPC.
  // ==================================================================
  type PromiseCallbacks = {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  };

  const pendingRequests = new Map<string, PromiseCallbacks>();

  process.on(
    'message',
    (msg: { requestId: string; data?: any; error?: string }) => {
      const promiseCallbacks = pendingRequests.get(msg.requestId);
      if (!promiseCallbacks) return;

      msg.error
        ? promiseCallbacks.reject(new Error(msg.error))
        : promiseCallbacks.resolve(msg.data);
      pendingRequests.delete(msg.requestId);
    },
  );

  function sendCommand<T>(type: string, payload?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!process.send) {
        return reject(new Error('Not in a worker process.'));
      }
      const requestId = randomUUID();
      pendingRequests.set(requestId, { resolve, reject });
      process.send({ type, payload, requestId });
    });
  }

  dbClient = {
    getAll: () => sendCommand<User[]>('user:getAll'),
    getById: (id: string) =>
      sendCommand<User | undefined>('user:getById', { id }),
    create: (userData: Omit<User, 'id'>) =>
      sendCommand<User>('user:create', userData),
    update: (id: string, userData: Partial<Omit<User, 'id'>>) =>
      sendCommand<User>('user:update', { id, data: userData }),
    delete: (id: string) => sendCommand<void>('user:delete', { id }),
  };
} else {
  // ==================================================================
  // SINGLE-PROCESS MODE IMPLEMENTATION
  // Uses a local in-memory array.
  // ==================================================================
  const users: User[] = [];

  dbClient = {
    getAll: async () => Promise.resolve(users),
    getById: async (id) => Promise.resolve(users.find((u) => u.id === id)),
    create: async (data) => {
      const newUser: User = { id: uuidv4(), ...data };
      users.push(newUser);
      return Promise.resolve(newUser);
    },
    update: async (id, data) => {
      const userIndex = users.findIndex((u) => u.id === id);
      if (userIndex === -1) throw new Error('User not found');
      users[userIndex] = { ...users[userIndex], ...data };
      return Promise.resolve(users[userIndex]);
    },
    delete: async (id) => {
      const userIndex = users.findIndex((u) => u.id === id);
      if (userIndex === -1) throw new Error('User not found');
      users.splice(userIndex, 1);
      return Promise.resolve();
    },
  };
}

export { dbClient };