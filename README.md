# Products API

This project is a small Express + Prisma API for:

- user registration and login
- product listing and product details
- wishlist management for authenticated users
- localized API messages in English and Arabic

The database uses SQLite through Prisma, and authentication is handled with JWT bearer tokens.

## How The App Works

The server starts from [service.js](/Users/mahrous/BackendProjects/products/service.js), which loads the Express app from [app.js](/Users/mahrous/BackendProjects/products/app.js) and listens on port `3000`.

Inside the app:

- `express.json()` parses request bodies
- `localizationMiddleware` reads `lang` or `Accept-Language` and sets `req.lang`
- `optionalAuthMiddleware` reads the `Authorization` header and, if the JWT is valid, sets `req.userId`
- routes are mounted for `/auth`, `/products`, and `/wishlist`

## Main Features

### 1. Auth

Routes live in [auth.routes.js](/Users/mahrous/BackendProjects/products/routes/auth.routes.js) and logic lives in [authController.js](/Users/mahrous/BackendProjects/products/controllers/authController.js).

Available endpoints:

- `POST /auth/register`
- `POST /auth/login`

What happens on register:

- the app validates `email` and `password`
- the password is hashed before saving
- a new user is created in the `users` table
- a JWT token is returned in the response

What happens on login:

- the app looks up the user by email
- it verifies the password against the stored hash
- if valid, it returns a JWT token

JWT creation and verification are handled in [authService.js](/Users/mahrous/BackendProjects/products/utils/authService.js).

## 2. Products

Routes live in [products.routes.js](/Users/mahrous/BackendProjects/products/routes/products.routes.js) and logic lives in [productsController.js](/Users/mahrous/BackendProjects/products/controllers/productsController.js).

Available endpoints:

- `GET /products`
- `GET /products/:id`

Behavior:

- without a token, products are returned normally
- with a valid JWT token, each product response includes `isInWishlist`
- `isInWishlist` is calculated from the authenticated user’s wishlist entries

That means product data changes slightly depending on whether the request is authenticated.

## 3. Wishlist

Routes live in [wishlist.routes.js](/Users/mahrous/BackendProjects/products/routes/wishlist.routes.js) and logic lives in [wishlistController.js](/Users/mahrous/BackendProjects/products/controllers/wishlistController.js).

Available endpoints:

- `POST /wishlist/add`
- `DELETE /wishlist/remove`
- `GET /wishlist`

Wishlist routes are protected by [requireAuthMiddleware.js](/Users/mahrous/BackendProjects/products/middlewares/requireAuthMiddleware.js).

What that means:

- if there is no valid JWT, the request returns `401 Unauthorized`
- the authenticated user is taken from `req.userId`
- the client does not need to send `userId` in the request body

Examples:

- add to wishlist with `{ "productId": 2 }`
- remove from wishlist with `{ "productId": 2 }`
- fetch the current user’s wishlist with `GET /wishlist`

## Localization

The project supports:

- `en`
- `ar`

Message lookup is handled in [localizationService.js](/Users/mahrous/BackendProjects/products/utils/localizationService.js), and translated messages live in:

- [locales/en.js](/Users/mahrous/BackendProjects/products/locales/en.js)
- [locales/ar.js](/Users/mahrous/BackendProjects/products/locales/ar.js)

You can set language using:

- query param: `?lang=ar`
- header: `Accept-Language: ar`

## Database

The Prisma schema is in [schema.prisma](/Users/mahrous/BackendProjects/products/prisma/schema.prisma).

Main models:

- `User`
- `Product`
- `Wishlist`

Relationships:

- one user can have many wishlist items
- one product can appear in many wishlist items
- each wishlist row connects one user to one product

## Environment Variables

The app currently uses:

- `DATABASE_URL`
- `JWT_SECRET`

Example from `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="replace-this-with-a-long-random-secret"
```

## Running The App

Install dependencies:

```bash
npm install
```

Sync Prisma with the local SQLite database:

```bash
npx prisma db push
```

Start the server:

```bash
node service.js
```

The server runs on:

```text
http://localhost:3000
```

## Postman Collection

The collection file is [Products-API.postman_collection.json](/Users/mahrous/BackendProjects/products/Products-API.postman_collection.json).

It already includes:

- auth requests for register and login
- product requests
- wishlist requests
- post-response scripts on login/register that save the JWT into `authToken`
- automatic bearer auth for the wishlist folder using `{{authToken}}`

Recommended flow in Postman:

1. Run `Register` or `Login`
2. Let the collection save the returned token
3. Call wishlist endpoints directly
4. Call product endpoints with the same token if you want `isInWishlist` in the response

## Response Format

The API uses a shared response shape from [responseModel.js](/Users/mahrous/BackendProjects/products/utils/responseModel.js):

```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": []
}
```

Error example:

```json
{
  "success": false,
  "message": "Unauthorized",
  "error": null
}
```

## Current Request Flow

Here is the typical flow for an authenticated request:

1. The client sends `Authorization: Bearer <jwt>`
2. `optionalAuthMiddleware` verifies the token
3. The user ID is attached to `req.userId`
4. Protected routes also pass through `requireAuthMiddleware`
5. Controllers use `req.userId` to query wishlist or user-specific data
6. Responses are returned using the shared response model

## Notes

- products are public
- wishlist actions are private
- `isInWishlist` only appears on product responses when the request has a valid JWT
- passwords are stored as hashes, not plain text

