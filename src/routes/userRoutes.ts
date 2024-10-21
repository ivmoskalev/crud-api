import { IncomingMessage, ServerResponse } from 'http';
import { getUser, getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';

export const userRoutes = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;
  const urlParts = url?.split('/');

  if (method === 'GET' && url === '/api/users') {
    getUsers(req, res);
  } else if (method === 'GET' && urlParts?.length === 4) {
    getUser(req, res, urlParts[3]);
  } else if (method === 'POST' && url === '/api/users') {
    createUser(req, res);
  } else if (method === 'PUT' && urlParts?.length === 4) {
    updateUser(req, res, urlParts[3]);
  } else if (method === 'DELETE' && urlParts?.length === 4) {
    deleteUser(req, res, urlParts[3]);
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Route Not Found' }));
  }
};
