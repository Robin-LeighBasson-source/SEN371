// Uses mongoose's own schema validation (validateSync) instead of a real
// database. validateSync runs the schema's required/default rules
// synchronously in memory, so this check never opens a connection.
const User = require("../models/User");

describe("User model", () => {
  it("defaults role to 'customer' and fails validation when email is missing", () => {
    const user = new User({
      password_hash: "already-hashed-value",
      first_name: "Ada",
      last_name: "Lovelace",
    });

    expect(user.role).toBe("customer");

    const error = user.validateSync();
    expect(error.errors.email).toBeDefined();
  });
});
