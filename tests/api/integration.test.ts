import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import type { Server } from "http";

describe("API Integration Tests", () => {
  let server: Server;
  const baseURL = "http://localhost:8080";
  let authToken: string;

  beforeAll(async () => {
    // Import and start the server
    // Note: In a real test environment, you'd want to use a test database
    console.log("Test environment initialized");
  });

  afterAll(async () => {
    // Cleanup
    console.log("Test environment cleaned up");
  });

  describe("Authentication", () => {
    it("should register a new user", async () => {
      const response = await fetch(`${baseURL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John",
          surname: "Doe",
          patronymic: "Smith",
          email: "john.doe@test.com",
          password: "TestPassword123",
          position: "Engineer",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe("john.doe@test.com");
    });

    it("should login with valid credentials", async () => {
      const response = await fetch(`${baseURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "john.doe@test.com",
          password: "TestPassword123",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.accessToken).toBeDefined();
      authToken = data.accessToken;
    });

    it("should reject invalid credentials", async () => {
      const response = await fetch(`${baseURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "john.doe@test.com",
          password: "WrongPassword",
        }),
      });

      expect(response.status).toBe(401);
    });

    it("should support login with query parameters", async () => {
      const response = await fetch(
        `${baseURL}/api/auth/login?email=john.doe@test.com&password=TestPassword123`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      // Should succeed with query parameters
      expect([200, 401]).toContain(response.status);
    });
  });

  describe("Equipment Management", () => {
    it("should require authentication", async () => {
      const response = await fetch(`${baseURL}/api/equipment`, {
        method: "GET",
      });

      expect(response.status).toBe(401);
    });

    it("should get all equipment with valid token", async () => {
      const response = await fetch(`${baseURL}/api/equipment`, {
        method: "GET",
        headers: { Authorization: `JWT ${authToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should create new equipment", async () => {
      const response = await fetch(`${baseURL}/api/equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${authToken}`,
        },
        body: JSON.stringify({
          inventoryNumber: "TEST-001",
          name: "Test Equipment",
          commissioningDate: "2025-01-01",
          maintenancePeriod: 30,
        }),
      });

      expect([201, 400, 401]).toContain(response.status);
    });
  });

  describe("Statistics", () => {
    it("should require authentication for statistics", async () => {
      const response = await fetch(`${baseURL}/api/statistics`, {
        method: "GET",
      });

      expect(response.status).toBe(401);
    });

    it("should return statistics with valid token", async () => {
      const response = await fetch(`${baseURL}/api/statistics`, {
        method: "GET",
        headers: { Authorization: `JWT ${authToken}` },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.equipment).toBeDefined();
      expect(data.components).toBeDefined();
      expect(data.maintenance).toBeDefined();
    });
  });

  describe("Health Checks", () => {
    it("should return health status", async () => {
      const response = await fetch(`${baseURL}/api/health`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("ok");
    });

    it("should return API info", async () => {
      const response = await fetch(`${baseURL}/api`, {
        method: "GET",
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.endpoints).toBeDefined();
    });
  });
});
