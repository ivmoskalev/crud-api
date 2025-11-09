import { randomUUID } from 'node:crypto';
import { User } from '../models/user';

type PromiseCallbacks = {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
};

// This map holds the resolve/reject functions for pending requests from this worker.
const pendingRequests = new Map<string, PromiseCallbacks>();

// Listen for responses from the primary process.
process.on('message', (msg: { requestId: string; data?: any; error?: string }) => {
  const promiseCallbacks = pendingRequests.get(msg.requestId);
  if (!promiseCallbacks) {
    return;
  }

  if (msg.error) {
    promiseCallbacks.reject(new Error(msg.error));
  } else {
    promiseCallbacks.resolve(msg.data);
  }

  pendingRequests.delete(msg.requestId);
});

// Helper to send a command to the primary process and return a Promise.
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

// Public API for controllers to use.
export const dbClient = {
  getAll: () => sendCommand<User[]>('user:getAll'),
  getById: (id: string) => sendCommand<User | undefined>('user:getById', { id }),
  create: (userData: Omit<User, 'id'>) => sendCommand<User>('user:create', userData),
  update: (id: string, userData: Partial<Omit<User, 'id'>>) =>
    sendCommand<User>('user:update', { id, data: userData }),
  delete: (id: string) => sendCommand<{ success: true }>('user:delete', { id }),
};