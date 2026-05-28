import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { migrationRunner } from "../../src/db/migrationRunner.ts";
import { userRepository } from "../../src/repositories/UserRepository.ts";
import type { User, StoredUser } from "../../src/models/user.ts";

describe("UserRepository", () => {
  beforeAll(() => {
    // Run migrations to set up test database
    migrationRunner.runPendingMigrations();
  });

  afterAll(() => {
    // Clean up test data
    const users = userRepository.getAllUsers();
    users.forEach((user) => {
      userRepository.deleteUser(user.id);
    });
  });

  it("should create a new user", () => {
    const user: Omit<StoredUser, "id"> = {
      name: "John",
      surname: "Doe",
      patronymic: "Smith",
      email: "john@example.com",
      password: "hashedpassword123",
      position: "Engineer",
    };

    const created = userRepository.insertUser(user);

    expect(created.id).toBeDefined();
    expect(created.email).toBe("john@example.com");
    expect(created.name).toBe("John");
  });

  it("should retrieve user by email", () => {
    const user: Omit<StoredUser, "id"> = {
      name: "Jane",
      surname: "Smith",
      patronymic: "Doe",
      email: "jane@example.com",
      password: "hashedpassword456",
      position: "Manager",
    };

    userRepository.insertUser(user);
    const retrieved = userRepository.getUserByEmail("jane@example.com");

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe("Jane");
  });

  it("should get user by ID", () => {
    const user: Omit<StoredUser, "id"> = {
      name: "Bob",
      surname: "Johnson",
      patronymic: "Lee",
      email: "bob@example.com",
      password: "hashedpassword789",
      position: "Technician",
    };

    const created = userRepository.insertUser(user);
    const retrieved = userRepository.getUserById(created.id);

    expect(retrieved).toBeDefined();
    expect(retrieved?.email).toBe("bob@example.com");
  });

  it("should update user", () => {
    const user: Omit<StoredUser, "id"> = {
      name: "Alice",
      surname: "Williams",
      patronymic: "James",
      email: "alice@example.com",
      password: "hashedpassword999",
      position: "Operator",
    };

    const created = userRepository.insertUser(user);
    userRepository.updateUser(created.id, { position: "Senior Operator" });

    const updated = userRepository.getUserById(created.id);
    expect(updated?.position).toBe("Senior Operator");
  });

  it("should delete user", () => {
    const user: Omit<StoredUser, "id"> = {
      name: "Charlie",
      surname: "Brown",
      patronymic: "David",
      email: "charlie@example.com",
      password: "hashedpassword111",
      position: "Intern",
    };

    const created = userRepository.insertUser(user);
    userRepository.deleteUser(created.id);

    const deleted = userRepository.getUserById(created.id);
    expect(deleted).toBeNull();
  });
});
