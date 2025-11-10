import { IncomingMessage, ServerResponse } from 'http';
import { dbClient } from '../database/dbClient';
import { validate as isUuid } from 'uuid';
import { NotFoundError, BadRequestError, ValidationError } from '../errors';

const getRequestBody = async (req: IncomingMessage): Promise<any> => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  try {
    const body = Buffer.concat(chunks).toString();
    return body ? JSON.parse(body) : {};
  } catch {
    throw new BadRequestError('Invalid JSON in request body');
  }
};

type SchemaDefinition = {
  [key: string]:
    | { type: 'string'; required: boolean }
    | { type: 'number'; required: boolean }
    | { type: 'array'; required: boolean; elements: 'string' };
};

const userSchema: SchemaDefinition = {
  username: { type: 'string', required: true },
  age: { type: 'number', required: true },
  hobbies: { type: 'array', required: true, elements: 'string' },
};

function validateBody(body: any, schema: SchemaDefinition): string[] {
  const errors: string[] = [];
  for (const key in schema) {
    const field = schema[key];
    if (field.required && !(key in body)) {
      errors.push(`${key} is a required field`);
      continue;
    }
    if (key in body) {
      if (field.type === 'array') {
        if (!Array.isArray(body[key])) {
          errors.push(`${key} must be an array`);
        } else if (
          body[key].some((el: any) => typeof el !== field.elements)
        ) {
          errors.push(`all elements in ${key} must be of type ${field.elements}`);
        }
      } else {
        if (typeof body[key] !== field.type) {
          errors.push(`${key} must be of type ${field.type}`);
        }
      }
    }
  }
  return errors;
}

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
    throw new BadRequestError('Invalid user ID');
  }

  const user = await dbClient.getById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(user));
};

export const createUser = async (req: IncomingMessage, res: ServerResponse) => {
  const body = await getRequestBody(req);

  const validationErrors = validateBody(body, userSchema);
  if (validationErrors.length > 0) {
    throw new ValidationError('Request body is invalid', validationErrors);
  }

  const { username, age, hobbies } = body;
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
    throw new BadRequestError('Invalid user ID');
  }

  const body = await getRequestBody(req);
  const validationErrors = validateBody(body, userSchema);
  if (validationErrors.length > 0) {
    throw new ValidationError('Request body is invalid', validationErrors);
  }

  try {
    const updatedUser = await dbClient.update(userId, body);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(updatedUser));
  } catch (error) {
    throw new NotFoundError('User not found');
  }
};

export const deleteUser = async (
  _req: IncomingMessage,
  res: ServerResponse,
  userId: string,
) => {
  if (!isUuid(userId)) {
    throw new BadRequestError('Invalid user ID');
  }

  try {
    await dbClient.delete(userId);
    res.writeHead(204);
    res.end();
  } catch (error) {
    throw new NotFoundError('User not found');
  }
};
