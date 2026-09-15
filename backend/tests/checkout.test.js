const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Category = require("../models/Category");
const Product = require("../models/Product");

describe("Checkout API integration", () => {
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const email = `checkout_test_${suffix}@example.com`;
  const password = "password123";
  let token;
  let productId;

  beforeAll(async () => {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set — load backend/.env before running tests");
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set — load backend/.env before running tests");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const category = await Category.create({
      name: `Test Cat ${suffix}`,
      slug: `test-cat-${suffix}`,
      description: "Supertest checkout category",
    });

    const product = await Product.create({
      sku: `TEST-SKU-${suffix}`,
      name: `Test Product ${suffix}`,
      description: "Product used by checkout integration tests",
      price_cents: 2599,
      stock_quantity: 10,
      category_id: category._id,
      images: [{ image_url: "https://placehold.co/200", is_primary: true }],
    });

    productId = product._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it("GET / returns API health message", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/API is running/i);
  });

  it("GET /api/orders without a token returns 401", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("register → cart → order → pay → history (frontend checkout path)", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      email,
      password,
      first_name: "Checkout",
      last_name: "Tester",
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token || registerRes.body.success).toBeTruthy();

    // Prefer token from register; fall back to login if register omits it
    if (registerRes.body.token) {
      token = registerRes.body.token;
    } else {
      const loginRes = await request(app).post("/api/auth/login").send({ email, password });
      expect(loginRes.status).toBe(200);
      token = loginRes.body.token;
    }
    expect(token).toBeTruthy();

    const auth = { Authorization: `Bearer ${token}` };

    const addCartRes = await request(app)
      .post("/api/cart")
      .set(auth)
      .send({ product_id: productId, quantity: 1 });

    expect([200, 201]).toContain(addCartRes.status);
    expect(addCartRes.body.success).toBe(true);
    expect(addCartRes.body.cart.items.length).toBeGreaterThanOrEqual(1);

    const orderRes = await request(app)
      .post("/api/orders")
      .set(auth)
      .send({
        shipping: {
          full_name: "Checkout Tester",
          email,
          street_address: "1 Test Road",
          city: "Cape Town",
          postal_code: "8001",
        },
      });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.success).toBe(true);
    expect(orderRes.body.order.order_status).toBe("Pending");
    expect(orderRes.body.order.shipping_snapshot.city).toBe("Cape Town");
    expect(orderRes.body.order.items[0].price_at_purchase_cents).toBe(2599);

    const orderId = orderRes.body.order._id;

    const cartAfter = await request(app).get("/api/cart").set(auth);
    expect(cartAfter.status).toBe(200);
    expect(cartAfter.body.cart.items).toHaveLength(0);

    const payRes = await request(app)
      .post(`/api/orders/${orderId}/pay`)
      .set(auth)
      .send({ payment_method: "Stripe" });

    expect(payRes.status).toBe(200);
    expect(payRes.body.success).toBe(true);
    expect(payRes.body.order.order_status).toBe("Paid");
    expect(payRes.body.payment.transaction_id).toMatch(/^txn_/);
    expect(payRes.body.payment.payment_method).toBe("Stripe");

    const historyRes = await request(app).get("/api/orders").set(auth);
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.success).toBe(true);

    const found = historyRes.body.orders.find((o) => o._id === orderId);
    expect(found).toBeTruthy();
    expect(found.order_status).toBe("Paid");
    expect(found.items[0].product_id.name).toMatch(/Test Product/);
  });

  it("POST /api/orders with an empty cart returns 400", async () => {
    const emptyEmail = `empty_cart_${suffix}@example.com`;
    const reg = await request(app).post("/api/auth/register").send({
      email: emptyEmail,
      password,
      first_name: "Empty",
      last_name: "Cart",
    });

    let emptyToken = reg.body.token;
    if (!emptyToken) {
      const login = await request(app)
        .post("/api/auth/login")
        .send({ email: emptyEmail, password });
      emptyToken = login.body.token;
    }

    // Ensure cart exists but is empty
    await request(app).get("/api/cart").set("Authorization", `Bearer ${emptyToken}`);

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${emptyToken}`)
      .send({
        shipping: {
          full_name: "Empty Cart",
          email: emptyEmail,
          street_address: "2 Test Road",
          city: "Cape Town",
          postal_code: "8001",
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/empty/i);
  });
});
