// jsonwebtoken is mocked so this test checks authService's own logic (the
// payload it builds and which secret/options it signs with) rather than
// re-testing the jwt library itself or requiring real secret material.
jest.mock("jsonwebtoken");

const jwt = require("jsonwebtoken");
const { generateToken } = require("../services/authService");

describe("authService.generateToken", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: "test-secret" };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("signs a payload with the user's id and role via the mocked jwt library", () => {
    jwt.sign.mockReturnValue("signed-jwt");

    const token = generateToken({ _id: "user123", role: "admin" });

    expect(jwt.sign).toHaveBeenCalledWith(
      { _id: "user123", id: "user123", role: "admin" },
      "test-secret",
      { expiresIn: "7d" },
    );
    expect(token).toBe("signed-jwt");
  });
});
