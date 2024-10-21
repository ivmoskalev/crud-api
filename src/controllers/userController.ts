import { IncomingMessage, ServerResponse } from 'http';
import users from '../database/inMemoryDatabase';
import { User, createUserModel } from '../models/user';
import { validate as isUuid } from 'uuid';

export const getUsers = (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(users));
};

// Implement other controller functions: getUser, createUser, updateUser, deleteUser
