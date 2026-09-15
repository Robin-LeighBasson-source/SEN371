const httpError = require("../utils/httpError");

// Pure function, no mocks needed: confirms controllers get an object the
// global error handler (middleware/errorHandler.js) can read a statusCode off.
describe("httpError", () => {
  it("builds an Error with the given message and statusCode attached", () => {
    const error = httpError("Product not found", 404);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Product not found");
    expect(error.statusCode).toBe(404);
  });
});
