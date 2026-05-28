import { userRepository } from "../repositories/UserRepository.ts";
import type { StoredUser, User } from "../models/user.ts";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function validateUserCredentials(email: string, password: string): Promise<User | null> {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const stored = userRepository.getUserByEmail(normalizedEmail);
  if (!stored) {
    return null;
  }

  const hashed = await hashPassword(password);
  if (hashed !== stored.password) {
    return null;
  }

  return {
    id: stored.id,
    name: stored.name,
    surname: stored.surname,
    patronymic: stored.patronymic,
    email: stored.email,
    position: stored.position,
  };
}

export async function createUser(user: Omit<StoredUser, "id">): Promise<User> {
  const normalizedEmail = String(user.email ?? "").trim().toLowerCase();
  const passwordHash = await hashPassword(user.password);

  return userRepository.insertUser({
    name: user.name,
    surname: user.surname,
    patronymic: user.patronymic,
    email: normalizedEmail,
    password: passwordHash,
    position: user.position,
  });
}

export async function getAllUsers(): Promise<User[]> {
  return userRepository.getAllUsers();
}

export async function getUserById(id: number): Promise<User | null> {
  return userRepository.getUserById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const stored = userRepository.getUserByEmail(normalizedEmail);
  if (!stored) {
    return null;
  }

  return {
    id: stored.id,
    name: stored.name,
    surname: stored.surname,
    patronymic: stored.patronymic,
    email: stored.email,
    position: stored.position,
  };
}
