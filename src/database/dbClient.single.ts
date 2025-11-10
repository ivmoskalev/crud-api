import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user';

const users: User[] = [];

const getAll = async (): Promise<User[]> => {
  return Promise.resolve(users);
};

const getById = async (id: string): Promise<User | undefined> => {
  return Promise.resolve(users.find((u) => u.id === id));
};

const create = async (data: Omit<User, 'id'>): Promise<User> => {
  const newUser: User = { id: uuidv4(), ...data };
  users.push(newUser);
  return Promise.resolve(newUser);
};

const update = async (
  id: string,
  data: Partial<Omit<User, 'id'>>,
): Promise<User> => {
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  users[userIndex] = { ...users[userIndex], ...data };
  return Promise.resolve(users[userIndex]);
};

const deleteUser = async (id: string): Promise<void> => {
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  users.splice(userIndex, 1);
  return Promise.resolve();
};

export const dbClient = { getAll, getById, create, update, delete: deleteUser };