# CRUD API

A simple RESTful API for managing user records, built with Node.js and TypeScript. This project implements basic CRUD (Create, Read, Update, Delete) operations with an in-memory database and includes horizontal scaling capabilities using Node.js Cluster API.

## Features

- RESTful API endpoints for user management
- In-memory database (no external dependencies)
- UUID-based user identification
- TypeScript implementation with strict type checking
- Horizontal scaling with load balancing
- Comprehensive error handling
- Full test coverage with Jest

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (version 24.10.0 or higher)
- npm (comes with Node.js)

## Installation

Follow these steps to set up the project on your local machine:

1. Clone the repository to your local machine:
```bash
   git clone <repository-url>
   cd crud-api
```

2. Install the project dependencies:
```bash
   npm install
```

3. Create your environment configuration file:
```bash
   cp .env.example .env
```

4. (Optional) Edit the `.env` file to change the default port if needed:
```
   PORT=4000
```

## Running the Application

The application can be run in three different modes depending on your needs.

### Development Mode

Development mode uses `ts-node-dev` for hot reloading, which means the server automatically restarts when you make code changes. This is ideal for active development:
```bash
npm run start:dev
```

The server will start on `http://localhost:4000` (or your configured PORT).

### Production Mode

Production mode first compiles the TypeScript code to optimized JavaScript using Webpack, then runs the bundled code. This creates a single optimized file that's ready for deployment:
```bash
npm run start:prod
```

This command performs two operations:
1. Builds the project (creates `dist/bundle.js`)
2. Starts the server using the bundled code

### Cluster Mode (Horizontal Scaling)

Cluster mode starts multiple worker processes (equal to CPU cores minus one) with a load balancer that distributes requests across workers using a round-robin algorithm:
```bash
npm run start:multi
```

When running in cluster mode:
- The load balancer listens on your configured PORT (default: 4000)
- Worker processes listen on PORT+1, PORT+2, etc.
- All workers share synchronized state for consistent data access
- The load balancer distributes incoming requests across all workers

For example, with 4 CPU cores and PORT=4000:
- Load balancer: `http://localhost:4000`
- Worker 1: `http://localhost:4001`
- Worker 2: `http://localhost:4002`
- Worker 3: `http://localhost:4003`

## API Endpoints

All endpoints are prefixed with `/api/users`.

### Get All Users

Retrieves a list of all users in the database.

**Endpoint:** `GET /api/users`

**Response:** 
- Status: 200 OK
- Body: Array of user objects

**Example:**
```bash
curl http://localhost:4000/api/users
```

**Response:**
```json
[
  {
    "id": "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    "username": "John Doe",
    "age": 30,
    "hobbies": ["reading", "gaming"]
  }
]
```

### Get User by ID

Retrieves a specific user by their UUID.

**Endpoint:** `GET /api/users/{userId}`

**Parameters:**
- `userId` (string, UUID): The unique identifier of the user

**Response:**
- Status: 200 OK - User found
- Status: 400 Bad Request - Invalid UUID format
- Status: 404 Not Found - User does not exist

**Example:**
```bash
curl http://localhost:4000/api/users/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed
```

### Create New User

Creates a new user with a generated UUID.

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "username": "John Doe",
  "age": 30,
  "hobbies": ["reading", "gaming"]
}
```

**Required Fields:**
- `username` (string): User's name
- `age` (number): User's age
- `hobbies` (array of strings): User's hobbies

**Response:**
- Status: 201 Created - User successfully created
- Status: 400 Bad Request - Invalid or missing required fields

**Example:**
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"John Doe","age":30,"hobbies":["reading","gaming"]}'
```

### Update User

Updates an existing user's information.

**Endpoint:** `PUT /api/users/{userId}`

**Parameters:**
- `userId` (string, UUID): The unique identifier of the user to update

**Request Body:**
```json
{
  "username": "Jane Doe",
  "age": 31,
  "hobbies": ["reading", "gaming", "traveling"]
}
```

**Response:**
- Status: 200 OK - User successfully updated
- Status: 400 Bad Request - Invalid UUID or request body
- Status: 404 Not Found - User does not exist

**Example:**
```bash
curl -X PUT http://localhost:4000/api/users/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed \
  -H "Content-Type: application/json" \
  -d '{"username":"Jane Doe","age":31,"hobbies":["reading","gaming","traveling"]}'
```

### Delete User

Deletes a user from the database.

**Endpoint:** `DELETE /api/users/{userId}`

**Parameters:**
- `userId` (string, UUID): The unique identifier of the user to delete

**Response:**
- Status: 204 No Content - User successfully deleted
- Status: 400 Bad Request - Invalid UUID format
- Status: 404 Not Found - User does not exist

**Example:**
```bash
curl -X DELETE http://localhost:4000/api/users/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed
```

## Running Tests

The project includes a comprehensive test suite that covers all CRUD operations. To run the tests:
```bash
npm test
```

The test suite includes scenarios for:
- Getting all users (initially empty)
- Creating a new user
- Retrieving a user by ID
- Updating user information
- Deleting a user
- Error handling for invalid IDs and non-existent users

## Project Structure
```
crud-api/
├── src/
│   ├── __tests__/          # Test files
│   │   └── api.test.ts     # API integration tests
│   ├── controllers/        # Request handlers
│   │   └── userController.ts
│   ├── database/           # Data storage
│   │   └── dbClient.ts
│   ├── models/             # Data models
│   │   └── user.ts
│   ├── routes/             # Route definitions
│   │   └── userRoutes.ts
│   ├── app.ts              # Main application router
│   ├── cluster.ts          # Cluster mode entry point
│   ├── errors.ts           # Custom error classes
│   ├── index.ts            # Single-process entry point
│   └── worker.ts           # Worker process logic
├── dist/                   # Compiled JavaScript (generated)
├── .env                    # Environment variables (not in repo)
├── .env.example            # Environment variables template
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── webpack.config.js       # Webpack bundler configuration
└── README.md               # This file
```
