import { IncomingMessage, ServerResponse } from 'http';
import { userRoutes } from './routes/userRoutes';
import { AppError, ValidationError } from './errors';

export const router = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    await userRoutes(req, res);
  } catch (error) {
    console.error(error);

    if (error instanceof ValidationError) {
      res.writeHead(error.statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: error.message, details: error.details }));
    } else if (error instanceof AppError) {
      res.writeHead(error.statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: error.message }));
    } else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
  }
};