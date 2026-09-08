# Cart & Wishlist Module

This document covers the shopping cart and wishlist features: what was added, how
they work, and why each part was built the way it was.

---

## 1. What was added

### Backend

| File | Purpose |
|------|---------|
| `backend/controllers/cartController.js` | All cart logic (get, add, change quantity, remove, clear) |
| `backend/controllers/wishlistController.js` | All wishlist logic (get, save, remove, move to cart) |
| `backend/routes/cartRoutes.js` | Maps `/api/cart` URLs to the cart controller |
| `backend/routes/wishlistRoutes.js` | Maps `/api/wishlist` URLs to the wishlist controller |
| `backend/utils/httpError.js` | Small helper that builds an error with an HTTP status code |
| `backend/utils/findProduct.js` | Looks a product up and rejects bad/unknown ids |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/src/pages/Cart.jsx` | The cart screen |
| `frontend/src/pages/Wishlist.jsx` | The wishlist screen |
| `frontend/src/api.js` | Shared `request()` helper and money formatter |

### Files that were changed

- `backend/server.js` — registered the two new routers.
- `backend/models/Cart.js` and `backend/models/Wishlist.js` — added `unique: true` to `user_id`.
- `frontend/src/App.jsx` — added the `/cart` and `/wishlist` routes and two nav links.

The `Cart` and `Wishlist` **schemas were otherwise left exactly as they were**, because
`orderController.createOrder` already reads the cart in that shape. Changing the schema
would have broken checkout, which belongs to another group member.

---

## 2. How it works

### The data

```
Cart      { user_id, items: [ { product_id, quantity } ] }
Wishlist  { user_id, products: [ product_id ] }
```

A cart line stores **only a product reference and a quantity** — never a copy of the name
or the price. When the frontend asks for the cart, the backend uses Mongoose `populate()`
to read the current name, price and stock from the products collection and send them along.

**Why:** if a price changed, a cart holding a copied price would quietly show the old one.
Referencing the product means the cart is always priced at today's price. The price is only
frozen at the moment the order is placed — that is what `price_at_purchase_cents` on the
`Order` model is for, and it is already handled by `createOrder`.

A wishlist stores just an array of product ids, with **no quantity**. A wishlist answers
"I might want this later", so a quantity would be meaningless until the item is really
bought. The quantity is chosen when the product moves into the cart.

### The request flow

```
Cart.jsx ──fetch──> /api/cart ──> protect ──> cartController ──> Cart + Product ──> MongoDB
                                     │
                            reads req.user._id
                              from the JWT
```

Every route runs through the existing `protect` middleware, which decodes the JWT and puts
the user on `req.user`. The controllers then look up the cart with **`req.user._id`** and
never with an id from the request body or URL. This is the whole of the module's security:
there is simply no way to ask for someone else's cart, because the request never gets to
say whose cart it wants.

### One cart per shopper, created on demand

Both controllers use the same helper:

```js
const getOrCreateCart = (userId) =>
  Cart.findOneAndUpdate(
    { user_id: userId },
    { $setOnInsert: { items: [] } },
    { upsert: true, new: true },
  );
```

`upsert: true` means a brand new shopper gets an empty cart back instead of a `404`.

**Why this instead of a "create cart" endpoint:** the frontend never has to check whether a
cart exists before using it, so there is no first-time special case anywhere in the UI.
`findOneAndUpdate` with `upsert` is also a **single atomic database call**, so two quick
clicks cannot create two carts, which a `findOne()` followed by a `create()` could.
`unique: true` on `user_id` backs this up at the database level.

---

## 3. API reference

All routes need `Authorization: Bearer <token>`. All of them respond with the **whole
updated cart or wishlist**, so the frontend can redraw straight from the answer.

### Cart — `/api/cart`

| Method | Path | Body | Does |
|--------|------|------|------|
| GET | `/api/cart` | – | Returns the cart, creating an empty one on first use |
| POST | `/api/cart` | `{ product_id, quantity? }` | Adds a product (`quantity` defaults to 1) |
| PUT | `/api/cart/items/:productId` | `{ quantity }` | Sets a line's quantity outright |
| DELETE | `/api/cart/items/:productId` | – | Removes one line |
| DELETE | `/api/cart` | – | Empties the cart, keeping the cart itself |

### Wishlist — `/api/wishlist`

| Method | Path | Body | Does |
|--------|------|------|------|
| GET | `/api/wishlist` | – | Returns the wishlist, creating an empty one on first use |
| POST | `/api/wishlist` | `{ product_id }` | Saves a product |
| DELETE | `/api/wishlist/items/:productId` | – | Removes a saved product |
| POST | `/api/wishlist/items/:productId/move-to-cart` | – | Adds it to the cart and unsaves it |

### Example

```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":"6a9fff84379ba9c730b00f2e","quantity":2}'
```

```json
{
  "success": true,
  "cart": {
    "_id": "6a9fff77ba637fe38a195c80",
    "user_id": "6a9fff775f9a4fddab03230a",
    "items": [
      {
        "_id": "6a9fff90...",
        "quantity": 2,
        "product_id": {
          "_id": "6a9fff84379ba9c730b00f2e",
          "name": "Wireless Mechanical Keyboard",
          "price_cents": 129999,
          "stock_quantity": 10,
          "images": []
        }
      }
    ]
  }
}
```

Failures use the project's existing error shape, produced by `middleware/errorHandler.js`:

```json
{ "success": false, "message": "Only 3 of \"Ergonomic Gaming Mouse\" left in stock" }
```

| Situation | Status | Message |
|-----------|--------|---------|
| No/invalid token | 401 | `Not authorized, no token` |
| `product_id` left out | 400 | `product_id is required` |
| Id is not a valid ObjectId | 400 | `Invalid product id` |
| Quantity is 0, negative or not a whole number | 400 | `quantity must be a whole number of 1 or more` |
| Asked for more than the stock | 400 | `Only N of "X" left in stock` |
| Product does not exist | 404 | `Product not found` |
| Line/saved item is not there | 404 | `That product is not in your cart` / `... wishlist` |

---

## 4. Design decisions and why

### Line items are addressed by **product id**, not by the line's own `_id`

`PUT /api/cart/items/:productId` rather than `/api/cart/items/:itemId`.

The frontend already knows the product id, because that is what it rendered the row from.
Using it as the address means adding, changing and removing an item all take the same
identifier, so there is one id to think about instead of two.

### Adding a product already in the cart **tops up** the quantity

Adding the keyboard twice gives one line with quantity 2, not two lines of the same
keyboard. `PUT` is the operation that *sets* a quantity outright, because that is what a
quantity box on the cart page means. So `POST` = "add one more", `PUT` = "make it exactly
this many". Splitting the two makes both the `+` button and a typed quantity easy to write.

### A quantity of 0 is rejected instead of deleting the line

Removing is `DELETE`'s job. If `PUT { quantity: 0 }` also deleted, one endpoint would do two
different things and a UI bug that sent 0 by accident would silently destroy a line rather
than showing an error.

### Products are checked to exist before being stored

`findProductOr404` runs before anything is written. Without it, a mistyped id would sit in
the cart unnoticed until checkout — and `createOrder` reads `item.product_id.price_cents`
off the populated product, which would crash on a reference to nothing. Catching it at the
point of adding turns a later 500 into an immediate, clear 404.

An id that is not even a valid ObjectId is rejected first, because `Product.findById()`
throws a `CastError` on a malformed id, which the error handler would report as a 500.

### Stock is checked on add and on update

`assertInStock` compares the *resulting* quantity against `stock_quantity`, so topping up an
existing line cannot sneak past the limit. This is a friendly guard, not a reservation — two
shoppers can still both hold the last item, and the real decision belongs at checkout. It
was added because catching it in the cart is far clearer to the shopper than a failure after
they have filled in their payment details.

### The wishlist uses `$addToSet`, so saving twice is harmless

```js
{ $addToSet: { products: product._id } }
```

Clicking "save for later" twice leaves one entry. **Why:** the operation is idempotent, so
the UI never has to check whether something is already saved, and a double-click or a
retried request cannot create a duplicate. MongoDB enforces this in one call, so there is no
read-then-write gap where two requests could both add the same product.

### "Move to cart" reuses the cart's own add function

`wishlistController` imports `addProductToCart` from `cartController` instead of writing to
the cart itself. The "already in the cart" rule and the stock check therefore exist in
exactly one place. If someone later adds a rule — a maximum quantity, say — it applies to
moving from the wishlist automatically, with no second copy to forget about.

### Every response returns the full updated object

Rather than returning `{ success: true }` and having the page patch its own copy, the
backend sends back the whole cart or wishlist. The frontend just does `setCart(data.cart)`.

**Why:** the screen can never drift out of step with the database, and there is no duplicate
"what the cart looks like now" logic in the React code. The pages hold no state that they
calculate themselves — the only thing computed in the browser is the display total, from
the data the server just sent.

### A shared `request()` helper on the frontend

`frontend/src/api.js` holds the base URL, the `Authorization` header and the error handling
once. The two pages make nine different calls between them; without the helper, the same
five lines of `fetch` boilerplate would be repeated nine times, and changing the API URL
would mean nine edits.

### Errors are shown, not swallowed

Both pages keep an `error` state and show the backend's own `message`. Because the backend
writes messages meant for a person ("Only 3 ... left in stock"), no translation table is
needed in the UI.

---

## 5. Trying it out

The endpoints need a real product to exist, and the products module is still a stub, so
insert one by hand first.

**1. Start MongoDB and the backend**, then create a user and keep the token:

```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"password123","first_name":"Test","last_name":"User"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)
```

**2. Insert a category and a product** with `mongosh`, and copy the product's `_id`:

```js
use sen371
const cat = db.categories.insertOne({ name: "Peripherals", slug: "peripherals" })
db.products.insertOne({
  sku: "KB-001",
  name: "Wireless Mechanical Keyboard",
  description: "A keyboard",
  price_cents: 129999,      // R1299.99 - prices are stored in whole cents
  stock_quantity: 10,
  category_id: cat.insertedId,
  images: []
})
```

**3. Use the API:**

```bash
PRODUCT_ID=<the _id you just copied>

curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"product_id\":\"$PRODUCT_ID\",\"quantity\":2}"

curl http://localhost:5000/api/cart -H "Authorization: Bearer $TOKEN"
```

**4. Or use the pages** — start the frontend and open <http://localhost:5173/cart> or
<http://localhost:5173/wishlist>, and paste the product id into the box at the top.

Note that `App.jsx` still passes a hardcoded mock token to every page, so paste the `$TOKEN`
value from step 1 into `mockToken` for the pages to load anything.

### What was verified

Run against a local MongoDB, all of the following behaved as described: an empty cart and
wishlist are created on first request; a request with no token is refused with 401; adding
the same product twice tops up one line; setting, removing and clearing work; over-stock,
zero, malformed-id and unknown-product requests are all refused with the right status;
saving the same product to the wishlist twice leaves one entry; move-to-cart adds to the
cart and unsaves in one call; two different users cannot see each other's carts; and
`POST /api/orders` still turns the cart into an order with the correct total.

---

## 6. Known limitations

- **Products cannot be browsed yet.** The product routes are placeholders, so both pages ask
  for a product id to be pasted in. When the products module is finished, those two boxes
  should be replaced by an "Add to cart" / "Save for later" button on a product card — the
  API behind them does not need to change.
- **Stock is checked but not held.** Two shoppers can both put the last item in their cart.
  Reserving stock properly belongs with checkout and the orders module.
- **The wishlist has no "move everything to cart" action.** It was left out because moving
  items one at a time is what the wishlist page needs today; the backend loop to add it
  would be a few lines on top of `addProductToCart`.
- **`updateCartItem` loads the product a second time** to check stock. Fine at this size, but
  it is an extra query per quantity change.

### One thing for the team

`getUserOrders` in `orderController.js` does not `populate("items.product_id")`, but
`OrderHistory.jsx` renders `item.product_id?.name`. Order history therefore shows "Product"
for every line. It is outside this module so it was left alone, but the fix is to add the
same `populate` call the cart uses.
