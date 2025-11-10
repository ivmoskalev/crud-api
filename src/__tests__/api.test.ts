import { Server } from 'http';
import { AddressInfo } from 'net';
import { createServer } from 'http';
import { router } from '../app';
import { User } from '../models/user';
import axios from 'axios';

let server: Server;
let baseURL: string;
let createdUser: User;

describe('CRUD API', () => {
  beforeAll((done) => {
    server = createServer(router).listen(0, () => {
      const { port } = server.address() as AddressInfo;
      baseURL = `http://localhost:${port}/api/users`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('GET /api/users should return an empty array initially', async () => {
    const response = await axios.get<User[]>(baseURL);
    expect(response.status).toBe(200);
    expect(response.data).toEqual([]);
  });

  test('POST /api/users should create a new user', async () => {
    const newUser = {
      username: 'John Doe',
      age: 30,
      hobbies: ['music', 'reading'],
    };
    const response = await axios.post<User>(baseURL, newUser);
    expect(response.status).toBe(201);
    expect(response.data).toMatchObject(newUser);

    createdUser = response.data;
  });

  test('GET /api/users:userId should return the created user', async () => {
    const response = await axios.get<User>(`${baseURL}/${createdUser.id}`);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(createdUser);
  });

  test('PUT /api/users:userId should update the created user', async () => {
    const updatedUserData = {
      username: 'Jane Doe',
      age: 31,
      hobbies: ['music', 'reading', 'traveling'],
    };
    const response = await axios.put<User>(
      `${baseURL}/${createdUser.id}`,
      updatedUserData,
    );
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(updatedUserData);
    expect(response.data.id).toBe(createdUser.id);

    createdUser = response.data;
  });

  test('DELETE /api/users:userId should delete the created user', async () => {
    const response = await axios.delete(`${baseURL}/${createdUser.id}`);
    expect(response.status).toBe(204);
  });

  test('GET /api/users/:userId for deleted user should return 404', async () => {
    try {
      await axios.get(`${baseURL}/${createdUser.id}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toEqual({ message: 'User not found' });
      } else {
        throw error;
      }
    }
  });

  test('GET /api/users/invalid_id should return 404', async () => {
    try {
      await axios.get(`${baseURL}/1234abdc`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toEqual({ message: 'Invalid user ID' });
      } else {
        throw error;
      }
    }
  });

  test('PUT /api/users/non-existing-id should return 404', async () => {
    const updatedUserData = {
      username: 'Jane Doe',
      age: 31,
      hobbies: ['music', 'reading', 'traveling'],
    };
    try {
      await axios.put(
        `${baseURL}/c56e6e0a-7f6c-4d7e-8e1b-7c6e1b7c6e1b`,
        updatedUserData,
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toEqual({ message: 'User not found' });
      } else {
        throw error;
      }
    }
  });
});
