/**
 * Wishlist Controller
 *
 * Handles all wishlist operations for users:
 * - Adding products to wishlist
 * - Removing products from wishlist
 * - Fetching user's wishlist
 * - Checking if a product is in wishlist
 */

import ResponseModel from "../utils/responseModel.js";
import prisma from "../utils/prisma.js";
import { parseIntegerId } from "../utils/validation.js";

/**
 * Add product to wishlist
 *
 * POST /wishlist/add
 * Body: { userId, productId }
 *
 * - Validates userId and productId are provided
 * - Checks if product already exists in wishlist
 * - Creates new wishlist entry with product details
 *
 * Returns: 201 with wishlist item | 400 if duplicate | 500 on error
 */
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const parsedProductId = parseIntegerId(productId);

    if (productId == null) {
      return res
        .status(400)
        .json(ResponseModel.error("PRODUCT_ID_REQUIRED", null, req.lang));
    }

    if (!parsedProductId) {
      return res
        .status(400)
        .json(ResponseModel.error("INVALID_PRODUCT_ID", null, req.lang));
    }

    // Check if product already exists in wishlist
    const existingWishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId: parsedProductId,
        },
      },
    });

    if (existingWishlistItem) {
      return res
        .status(400)
        .json(
          ResponseModel.error("PRODUCT_ALREADY_IN_WISHLIST", null, req.lang),
        );
    }

    // Add product to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: req.userId,
        productId: parsedProductId,
      },
      include: {
        product: true,
      },
    });

    res
      .status(201)
      .json(
        ResponseModel.success(
          "PRODUCT_ADDED_TO_WISHLIST",
          wishlistItem,
          req.lang,
        ),
      );
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res
      .status(500)
      .json(
        ResponseModel.error("INTERNAL_SERVER_ERROR", error.message, req.lang),
      );
  }
};

/**
 * Remove product from wishlist
 *
 * DELETE /wishlist/remove
 * Body: { userId, productId }
 *
 * - Validates userId and productId are provided
 * - Finds and deletes the wishlist entry
 *
 * Returns: 200 on success | 404 if not found | 500 on error
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const parsedProductId = parseIntegerId(productId);

    if (productId == null) {
      return res
        .status(400)
        .json(ResponseModel.error("PRODUCT_ID_REQUIRED", null, req.lang));
    }

    if (!parsedProductId) {
      return res
        .status(400)
        .json(ResponseModel.error("INVALID_PRODUCT_ID", null, req.lang));
    }

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.userId,
          productId: parsedProductId,
        },
      },
    });

    if (!wishlistItem) {
      return res
        .status(404)
        .json(ResponseModel.error("PRODUCT_NOT_IN_WISHLIST", null, req.lang));
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: req.userId,
          productId: parsedProductId,
        },
      },
    });

    res
      .status(200)
      .json(
        ResponseModel.success("PRODUCT_REMOVED_FROM_WISHLIST", null, req.lang),
      );
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res
      .status(500)
      .json(
        ResponseModel.error("INTERNAL_SERVER_ERROR", error.message, req.lang),
      );
  }
};

/**
 * Get user's wishlist
 *
 * GET /wishlist/:userId
 * Params: userId
 *
 * - Retrieves all products in user's wishlist
 * - Includes full product details with each entry
 * - Returns empty array if wishlist is empty
 *
 * Returns: 200 with wishlist array | 400 if userId missing | 500 on error
 */
export const getUserWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: {
        userId: req.userId,
      },
      include: {
        product: true,
      },
    });

    if (!wishlist || wishlist.length === 0) {
      return res
        .status(200)
        .json(ResponseModel.success("WISHLIST_IS_EMPTY", [], req.lang));
    }

    res
      .status(200)
      .json(
        ResponseModel.success(
          "WISHLIST_FETCHED_SUCCESSFULLY",
          wishlist,
          req.lang,
        ),
      );
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res
      .status(500)
      .json(
        ResponseModel.error("INTERNAL_SERVER_ERROR", error.message, req.lang),
      );
  }
};
