# SEN371 E-Commerce Project

A MERN-style e-commerce application split into two independently run apps:

| Folder      | Stack                                   | Dev port |
|-------------|-----------------------------------------|----------|
| `backend/`  | Node.js + Express + Mongoose (MongoDB)  | 5000     |
| `frontend/` | React 19 + Vite + React Router          | 5173     |

The frontend talks to the backend over HTTP, so **both must be running** for anything beyond the
static pages to work.

---

## Prerequisites

- **Node.js 18+** (developed on v22) and npm
- A **MongoDB** database — either MongoDB Atlas (a connection string) or a local `mongod` instance

---

## Quick start

```bash
# terminal 1 — API
cd backend
npm install
# create backend/.env with MONGO_URI and JWT_SECRET (see section 1)
npm run dev

# terminal 2 — web app
cd frontend
npm install
npm run dev
```

Then open <http://localhost:5173>. The catalog will be empty until you add products — the
fastest way is `cd backend && node seed.js` (see [Seeding data](#4-seeding-data)).

The sections below explain each step in detail.

---

## 1. Backend setup

```bash
cd backend
npm install
```

### Environment variables

The backend loads config with `dotenv`, so create a `backend/.env` file (it is git-ignored and
**not** included in the repo — you must create it yourself):

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
| `JWT_SECRET`     | yes      | Login/register fail (500) without it |
| `JWT_EXPIRES_IN` | no       | Defaults to `7d` |
| `PORT`           | no       | Defaults to `5000`. The frontend hardcodes 5000 — see section 2 |
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

The API base URL defaults to `http://localhost:5000`. To point at a backend running elsewhere,
create `frontend/.env` with `VITE_API_URL=http://host:port` (see `frontend/src/api.js`).

Other frontend scripts: `npm run build`, `npm run preview`, `npm run lint`.

### Pages

| Route              | What it does | Needs login? |
|--------------------|--------------|--------------|
| `/`                | Home — hero, category tiles, latest arrivals | no |
| `/products`        | Catalog with search (`?search=`), category filter (`?category=<id>`), sort and pagination | no |
| `/products/:sku`   | Product page — gallery, quantity, add to bag, save, related products | no (buttons prompt sign-in) |
| `/register`        | Create an account; stores the JWT in `localStorage` and returns you to where you were | – |
| `/login`           | Sign in; same behaviour | – |
| `/cart`            | Bag — change quantities, remove lines, empty bag, go to checkout | yes |
| `/wishlist`        | Saved items — move to bag or remove | yes |
| `/checkout`        | Delivery → Payment → Review → confirmation. Creates the order and runs the mock payment | yes |
| `/orders`          | Order history with status badges and delivery address | yes |

Protected pages show an illustrated "Sign in to continue" panel instead of an error when you
are signed out. Signing out only clears the token from `localStorage` — the token itself stays
valid until it expires.

### Frontend structure

```
frontend/src/
├── api.js               fetch helpers, price formatting, image helpers
├── brand.js             store name / tagline (change it in one place)
├── totals.js            bag totals shared by the bag and checkout
├── index.css            design system: tokens, components, layout, responsive rules
├── context/             StoreProvider (auth, bag, wishlist, toasts) + useStore hook
├── components/          Layout (header/footer), ProductCard, Illustrations (SVG), Icons, …
└── pages/               Home, Products, ProductDetail, Cart, Wishlist, Checkout, OrderHistory, Login, Register, NotFound
```

All illustrations (hero, empty states, sign-in, 404, category and value-prop icons) are inline
SVG components in `components/Illustrations.jsx`, so there are no image assets to manage.

---

## 3. Logging in

Open <http://localhost:5173/register>, create a user, and the app stores the JWT for you. All
cart, wishlist, checkout and order calls send it as a `Bearer` header automatically.

If you prefer the command line (e.g. for testing the API with `curl`):

```bash
# Register (these are the endpoints the frontend uses)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","first_name":"Test","last_name":"User"}'

# ...or log an existing user in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Both return `{ "success": true, "token": "...", "user": {...} }`. Use the token on protected routes:

```bash
curl http://localhost:5000/api/orders -H "Authorization: Bearer <token>"
```

Passwords must be at least 8 characters.

> **Use `/api/auth/*`, not `/api/users/login|register`.** Both sets of routes exist and share
> the same user collection, but the `/api/users/*` versions sign a token containing only `id`,
> while the cart, wishlist and order controllers read `req.user._id`. A token from
> `/api/users/login` therefore passes the auth check but silently fails to find the user's cart.

---

## 4. Seeding data

A fresh database has no products, so the catalog is empty. Either run the seed script or add
records through the API.

### Option A: `backend/seed.js` (quickest)

```bash
cd backend
node seed.js
```

Reads `MONGO_URI` from `backend/.env`, creates three categories (Peripherals, Monitors, Audio)
and four products with images and stock. It **upserts** by category `slug` and product `sku`, so
it is safe to run again — a second run just refreshes the same records rather than failing on
duplicates.

### Option B: through the API

Products **must** belong to a category, so create a category first, then products that
reference it.

```bash
# 1. Create a category — note the "_id" in the response
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Peripherals","slug":"peripherals","description":"Keyboards, mice and more"}'

# 2. Create a product using that category id
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PERIPH-KEY-001",
    "name": "Wireless Mechanical Keyboard",
    "description": "Compact 75% layout with tactile switches.",
    "price_cents": 129999,
    "stock_quantity": 15,
    "category_id": "<category _id from step 1>",
    "images": [{ "image_url": "https://picsum.photos/seed/kb/600", "is_primary": true }]
  }'
```

Reload <http://localhost:5173> and the product appears. Repeat step 2 for as many products as
you like (each `sku` must be unique).

Either way, `GET /api/products` lists the products and the catalog at
<http://localhost:5173/products> shows them immediately.

---

## API reference (current state)

All responses are JSON. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint                | Auth | Notes |
|--------|-------------------------|------|-------|
| GET    | `/`                     | –    | Health check (`API is running...`) |
| POST   | `/api/auth/register`    | –    | Used by the frontend. Password ≥ 8 chars. Returns `{ success, token, user }` |
| POST   | `/api/auth/login`       | –    | Used by the frontend. Same response shape |
| GET    | `/api/auth/me`          | JWT  | Current user (used by the header) |
| POST   | `/api/auth/logout`      | –    | Stub — returns success, token stays valid |
| POST   | `/api/users/register`, `/api/users/login` | – | Legacy duplicates — token lacks `_id`, see section 3 |
| GET    | `/api/users/me`         | JWT  | Current user |
| GET/PUT/DELETE | `/api/users`, `/api/users/:id` | – | **Placeholder** — returns a message string |
| GET    | `/api/products`         | –    | List. Query params: `search`, `category_id`, `page` (default 1), `limit` (default 12, max 100) |
| POST   | `/api/products`         | –    | Create (see [Seeding data](#4-seeding-data) for the body) |
| GET/PUT/DELETE | `/api/products/:sku` | – | Read / update / delete **by SKU**, not by id |
| GET/POST | `/api/categories`     | –    | List / create (`name`, `slug` required; `slug` unique) |
| GET/PUT/DELETE | `/api/categories/:id` | – | Read / update / delete by id |
| GET/POST/DELETE | `/api/cart`    | JWT  | View, add to (`{ product_id, quantity }`), and empty the cart |
| PUT/DELETE | `/api/cart/items/:productId` | JWT | Change a line's quantity / remove a line |
| GET/POST | `/api/wishlist`       | JWT  | View the wishlist, save a product |
| DELETE | `/api/wishlist/items/:productId` | JWT | Unsave a product |
| POST   | `/api/wishlist/items/:productId/move-to-cart` | JWT | Move a saved product into the cart |
| POST   | `/api/orders`           | JWT  | Creates an order from the user's cart, then clears it |
| GET    | `/api/orders`           | JWT  | User's order history, newest first |
| POST   | `/api/orders/:id/pay`   | JWT  | Simulated payment, marks the order `Paid` |

Errors come back uniformly as `{ "success": false, "message": "...", "stack": "..." }`
(`stack` is omitted when `NODE_ENV=production`).

---

## Known gaps

Things to be aware of when running this in its current state:

- **Product and category write routes are unauthenticated** — anyone can create/edit/delete them.
- **User CRUD routes** (`GET/PUT/DELETE /api/users/:id`) are placeholders.
- **Payment is simulated** — the checkout accepts any card details and `POST /api/orders/:id/pay`
  just flips the status to `Paid`. Delivery is always free so the frontend total matches the
  backend's `total_amount_cents`.
- **No test suite** in either app.
- **Two overlapping auth implementations** (`/api/users/*` and `/api/auth/*`); the `/api/users/*`
  tokens don't work with cart/orders (see section 3).

---

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `Database Connection Error` on startup | `MONGO_URI` missing/wrong in `backend/.env`, or Atlas IP allow-list doesn't include your IP |
| `querySrv ECONNREFUSED` / SRV lookup errors | DNS can't resolve `mongodb+srv://`; see the DNS note in section 1 |
| Frontend shows "Failed to fetch" | Backend not running, or not on port 5000 |
| Cart / wishlist / orders return 401 | Not logged in, or the token expired — log in again |
| Catalog is empty | No products in the database — see [Seeding data](#4-seeding-data) |
| Product detail page 404s | The URL uses the product **SKU**, not its `_id` |

## Module documentation

- [CARTWISHLIST.md](CARTWISHLIST.md) — the cart and wishlist features: how they work and why.
