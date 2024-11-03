import { IncomingMessage, ServerResponse } from 'http';
import {
  getUser,
  getUsers,
  createUser,
  // updateUser,
  // deleteUser,
} from '../controllers/userController';

export const userRoutes = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;
  const urlPattern = /^\/api\/users(\/([0-9a-fA-F\-]+))?$/;
  const match = url?.match(urlPattern);
  const userId = match && match[2];

  if (method === 'GET' && url === '/api/users') {
    getUsers(req, res);
  } else if (method === 'GET' && userId) {
    getUser(req, res, userId);
  } else if (method === 'POST' && url === '/api/users') {
    createUser(req, res);
  // } else if (method === 'PUT' && userId) {
  //   updateUser(req, res, userId);
  // } else if (method === 'DELETE' && userId) {
  //   deleteUser(req, res, userid);
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Route Not Found' }));
  }
};
