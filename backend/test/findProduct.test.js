// Mongoose's Product.findById is mocked so this test never touches a real
// database - it only checks that findProductOr404 turns model results into
// the right httpError for each failure path.
jest.mock("../models/Product");

const mongoose = require("mongoose");
const Product = require("../models/Product");
const findProductOr404 = require("../utils/findProduct");

describe("findProductOr404", () => {
  it("rejects invalid ids without querying the model, and 404s when the mocked model finds nothing", async () => {
    await expect(findProductOr404("not-a-valid-id")).rejects.toMatchObject({
      message: "Invalid product id",
      statusCode: 400,
    });
    expect(Product.findById).not.toHaveBeenCalled();

    const validId = new mongoose.Types.ObjectId().toString();
    Product.findById.mockResolvedValue(null);

    await expect(findProductOr404(validId)).rejects.toMatchObject({
      message: "Product not found",
      statusCode: 404,
    });
    expect(Product.findById).toHaveBeenCalledWith(validId);
  });
});
