# SEN371 E-Commerce Project

A MERN-style e-commerce application split into two independently run apps:

| Folder      | Stack                                   | Dev port |
|-------------|-----------------------------------------|----------|
| `backend/`  | Node.js + Express + Mongoose (MongoDB)  | 5000     |
| `frontend/` | React 19 + Vite + React Router          | 5173     |

---

## Prerequisites

- **Node.js 18+** (developed on v22) and npm
- A **MongoDB** database — either MongoDB Atlas (a connection string) or a local `mongod` instance

---

## 1. Backend setup

```bash
cd backend
npm install
```

### Environment variables

The backend loads config with `dotenv`, so create a `backend/.env` file (it is git-ignored):

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/sen371?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
```

| Variable         | Required | Notes |
|------------------|----------|-------|
| `MONGO_URI`      | yes      | Server exits with `Database Connection Error` if missing/unreachable |
| `JWT_SECRET`     | yes      | Auth routes throw `JWT_SECRET is not configured` (500) without it |
| `JWT_EXPIRES_IN` | no       | Defaults to `7d` |
| `PORT`           | no       | Defaults to `5000` |
| `NODE_ENV`       | no       | Anything other than `production` includes error stack traces in responses |

For a **local MongoDB** instead of Atlas, use `MONGO_URI=mongodb://127.0.0.1:27017/sen371`.

### Run it

```bash
npm run dev     # nodemon, restarts on file changes
# or
npm start       # plain node server.js
```

Expected output:

```
Currently trying to connect with: mongodb+srv://...
Server running on port 5000
MongoDB Connected: <host>
```

Sanity check: `curl http://localhost:5000/` → `API is running...`

> **Note:** `server.js` forces DNS resolution through `8.8.8.8` / `1.1.1.1`. This was added so
> MongoDB Atlas `mongodb+srv://` SRV lookups resolve on networks with a broken resolver. If you
> are on a network that blocks external DNS, remove the two `dns` lines at the top of `server.js`.

---

## 2. Frontend setup

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Vite prints a local URL, normally <http://localhost:5173>.

There is **no route at `/`** yet — the landing page shows only the temporary nav bar. Use the links, or go straight to:

- <http://localhost:5173/cart> — shopping cart (calls the backend)
- <http://localhost:5173/wishlist> — wishlist (calls the backend)
- <http://localhost:5173/checkout> — multi-step checkout (Shipping → Payment → Confirmation); creates an order and runs mock payment
- <http://localhost:5173/orders> — order history (calls the backend)

**Checkout flow:** add items to the cart → open `/checkout` → enter shipping → choose simulated Stripe/PayPal → Place order. Paste a fresh JWT into `frontend/src/App.jsx` `mockToken` first (see section 3).

The API base URL is currently **hardcoded** as `http://localhost:5000` — in
`frontend/src/api.js` for cart, wishlist, checkout, and order history — so the backend must run on port 5000.

Other frontend scripts: `npm run build`, `npm run preview`, `npm run lint`.

---

## 3. Getting a working auth token

All `/api/orders` routes and `/api/auth/me` are protected by a `Bearer` JWT.

`frontend/src/App.jsx` passes a **hardcoded mock token** to both pages. That token expires
**14 September 2026** and is only valid against the exact `JWT_SECRET` it was signed with, so
in practice you need to mint your own:

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","first_name":"Test","last_name":"User"}'

# ...or log an existing one in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Both return `{ "success": true, "token": "...", "user": {...} }`. Paste that `token` value into
the `mockToken` constant in `frontend/src/App.jsx`, or use it directly:

```bash
curl http://localhost:5000/api/orders -H "Authorization: Bearer <token>"
```

Passwords must be at least 8 characters.

---

## API reference (current state)

| Method | Endpoint                | Auth | Status |
|--------|-------------------------|------|--------|
| GET    | `/`                     | –    | Health check |
| POST   | `/api/auth/register`    | –    | Implemented |
| POST   | `/api/auth/login`       | –    | Implemented |
| POST   | `/api/auth/logout`      | –    | Stub — returns success, token stays valid |
| GET    | `/api/auth/me`          | JWT  | Implemented |
| GET    | `/api/users/me`         | JWT  | Implemented |
| GET/PUT/DELETE | `/api/users`, `/api/users/:id` | – | **Placeholder** — returns a message string |
| POST   | `/api/orders`           | JWT  | Creates an order from the user's cart, then clears it |
| GET    | `/api/orders`           | JWT  | User's order history, newest first |
| POST   | `/api/orders/:id/pay`   | JWT  | Simulated payment, marks the order `Paid` |
| GET/POST/DELETE | `/api/cart`    | JWT  | View, add to, and empty the cart |
| PUT/DELETE | `/api/cart/items/:productId` | JWT | Change a line's quantity / remove a line |
| GET/POST | `/api/wishlist`       | JWT  | View the wishlist, save a product |
| DELETE | `/api/wishlist/items/:productId` | JWT | Unsave a product |
| POST   | `/api/wishlist/items/:productId/move-to-cart` | JWT | Move a saved product into the cart |
| GET/POST/PUT/DELETE | `/api/products`, `/api/products/:id` | – | **Placeholder** — returns a message string |

Errors come back uniformly as `{ "success": false, "message": "...", "stack": "..." }`.

---

## What is not wired up yet

Things to be aware of when running this in its current state:

- **Product and user CRUD routes are placeholders** — they return hardcoded messages, not database records.
- **Products cannot be browsed.** The product routes are placeholders, so the cart and wishlist
  pages ask you to paste a product id, and products must be inserted into MongoDB by hand.
  See [CARTWISHLIST.md](CARTWISHLIST.md) for a step-by-step walkthrough.
- **No database seeding script**, so products/categories must be inserted manually to see real data.
- **No test suite** in either app.
- The token in `App.jsx` is a temporary placeholder for the login module (see section 3).

---

## Quick start (both apps)

```bash
# terminal 1
cd backend && npm install && npm run dev

# terminal 2
cd frontend && npm install && npm run dev
```

Then open <http://localhost:5173/cart>.

## Module documentation

- [CARTWISHLIST.md](CARTWISHLIST.md) — the cart and wishlist features: how they work and why.
