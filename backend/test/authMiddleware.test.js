// authService.verifyToken is mocked so this test drives the protect()
// middleware's branching logic directly, without a real JWT or database.
jest.mock("../services/authService");

const { verifyToken } = require("../services/authService");
const { protect } = require("../middleware/authMiddleware");

describe("authMiddleware.protect", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("attaches the decoded user on a valid token, and forwards a 401 when verifyToken (mocked) throws", () => {
    const next = jest.fn();

    verifyToken.mockReturnValueOnce({ _id: "user1", role: "customer" });
    const validReq = { headers: { authorization: "Bearer good.token" } };
    protect(validReq, {}, next);

    expect(validReq.user).toEqual({ _id: "user1", role: "customer" });
    expect(next).toHaveBeenCalledWith();

    next.mockClear();
    verifyToken.mockImplementationOnce(() => {
      throw new Error("jwt malformed");
    });
    const invalidReq = { headers: { authorization: "Bearer bad.token" } };
    protect(invalidReq, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: "Not authorized, invalid token",
      }),
    );
  });
});
