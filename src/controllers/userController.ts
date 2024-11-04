import { IncomingMessage, ServerResponse } from 'http';
import users from '../database/inMemoryDatabase';
import { User, createUserModel } from '../models/user';
import { validate as isUuid } from 'uuid';

const getRequestBody = (req: IncomingMessage): Promise<User> => {
  return new Promise((resolve, reject) => {
    try {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve(parsedBody);
        } catch (error) {
          reject(new Error('Invalid JSON'));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const getUsers = (_req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(users));
};

export const getUser = (
  _req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!isUuid(userId)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Invalid user ID' }));
    return;
  }

  const user = users.find((u) => u.id === userId);

  if (!user) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'User not found' }));
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(user));
};

export const createUser = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const body = await getRequestBody(req);

    const { username, age, hobbies } = body;

    // Validate required fields
    if (
      typeof username !== 'string' ||
      typeof age !== 'number' ||
      !Array.isArray(hobbies)
    ) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          message: 'Invalid user data. Check required fields.',
        }),
      );
      return;
    }

    const newUser = createUserModel(username, age, hobbies);
    users.push(newUser);

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(newUser));
  } catch (error) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Invalid request body' }));
  }
};

export const updateUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!isUuid(userId)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Invalid user ID' }));
    return;
  }

  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'User not found' }));
    return;
  }

  try {
    const body = await getRequestBody(req);
    const { username, age, hobbies } = body;

    // Validate required fields
    if (
      typeof username !== 'string' ||
      typeof age !== 'number' ||
      !Array.isArray(hobbies)
    ) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          message: 'Invalid user data. Check required fields.',
        }),
      );
      return;
    }

    const updatedUser: User = {
      id: userId,
      username,
      age,
      hobbies,
    };

    users[userIndex] = updatedUser;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(updatedUser));
  } catch (error) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Invalid request body' }));
  }
};

export const deleteUser = (
  _req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!isUuid(userId)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Invalid user ID' }));
    return;
  }

  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'User not found' }));
    return;
  }

  users.splice(userIndex, 1);

  res.statusCode = 204;
  res.end();
};
