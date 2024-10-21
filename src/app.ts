import { IncomingMessage, ServerResponse } from 'http';
import { userRoutes } from './routes/userRoutes';

export const router = (req: IncomingMessage, res: ServerResponse) => {
  if (req.url?.startsWith('/api/users')) {
    userRoutes(req, res);
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
};
