/**
 * Product Routes
 *
 * Handles all product-related endpoints
 */

import express from "express";
import {
  fetchAllProducts,
  fetchProductById,
} from "../controllers/productsController.js";

const router = express.Router();

/**
 * GET /products
 * Fetch all products
 * Query: ?lang=en or ?lang=ar
 */
router.get("/", fetchAllProducts);

/**
 * GET /products/:id
 * Fetch product by ID
 * Params: id - Product ID
 */
router.get("/:id", fetchProductById);

export default router;
