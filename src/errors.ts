export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // The following line is needed to make `instanceof` work correctly with custom errors in TypeScript
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

export class ValidationError extends BadRequestError {
  public readonly details: string[];

  constructor(message = 'Invalid input', details: string[] = []) {
    super(message);
    this.details = details;
  }
}
