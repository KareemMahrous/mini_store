/**
 * Wishlist Routes
 *
 * Handles all wishlist-related endpoints
 */

import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
} from "../controllers/wishlistController.js";
import { requireAuthMiddleware } from "../middlewares/requireAuthMiddleware.js";

const router = express.Router();

router.use(requireAuthMiddleware);

/**
 * POST /wishlist/add
 * Add product to wishlist
 * Body: { productId }
 */
router.post("/add", addToWishlist);

/**
 * DELETE /wishlist/remove
 * Remove product from wishlist
 * Body: { productId }
 */
router.delete("/remove", removeFromWishlist);

/**
 * GET /wishlist
 * Get authenticated user's wishlist
 */
router.get("/", getUserWishlist);

export default router;
