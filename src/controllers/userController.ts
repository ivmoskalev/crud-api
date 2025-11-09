import { IncomingMessage, ServerResponse } from 'http';
import { dbClient } from '../database/dbClient';
import { User } from '../models/user';
import { validate as isUuid } from 'uuid';

const getRequestBody = async (req: IncomingMessage): Promise<any> => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return null;
  }
};

export const getUsers = async (_req: IncomingMessage, res: ServerResponse) => {
  const users = await dbClient.getAll();
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(users));
};

export const getUser = async (
  _req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!isUuid(userId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid user ID' }));
    return;
  }

  const user = await dbClient.getById(userId);

  if (!user) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(user));
};

export const createUser = async (req: IncomingMessage, res: ServerResponse) => {
  const body = await getRequestBody(req);

  if (!body) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid JSON in request body' }));
    return;
  }

  const { username, age, hobbies } = body;

  if (
    typeof username !== 'string' ||
    typeof age !== 'number' ||
    !Array.isArray(hobbies)
  ) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Missing or invalid required fields' }));
    return;
  }

  const newUser = await dbClient.create({ username, age, hobbies });
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(newUser));
};

export const updateUser = async (
  req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!isUuid(userId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid user ID' }));
    return;
  }

  const body = await getRequestBody(req);
  if (!body) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid JSON in request body' }));
    return;
  }

  const { username, age, hobbies } = body;
  
  try {
    const updatedUser = await dbClient.update(userId, { username, age, hobbies });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(updatedUser));
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
  }
};

export const deleteUser = async (
  _req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!isUuid(userId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Invalid user ID' }));
    return;
  }

  try {
    await dbClient.delete(userId);
    res.writeHead(204);
    res.end();
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User not found' }));
  }
};
