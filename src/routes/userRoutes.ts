import { IncomingMessage, ServerResponse } from 'http';
import {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import { NotFoundError } from '../errors';

type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  ...args: string[]
) => Promise<void>;

interface Route {
  method: string;
  path: RegExp;
  handler: RouteHandler;
}

const routes: Route[] = [
  { method: 'GET', path: /^\/api\/users\/?$/, handler: getUsers },
  { method: 'GET', path: /^\/api\/users\/([^\/]+)\/?$/, handler: getUser },
  { method: 'POST', path: /^\/api\/users\/?$/, handler: createUser },
  { method: 'PUT', path: /^\/api\/users\/([^\/]+)\/?$/, handler: updateUser },
  { method: 'DELETE', path: /^\/api\/users\/([^\/]+)\/?$/, handler: deleteUser },
];

export const userRoutes = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;

  for (const route of routes) {
    if (method === route.method) {
      const match = url?.match(route.path);
      if (match) {
        const params = match.slice(1); 
        await route.handler(req, res, ...params);
        return;
      }
    }
  }

  throw new NotFoundError('Route Not Found');
};

