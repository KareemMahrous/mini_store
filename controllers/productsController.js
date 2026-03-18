import ResponseModel from "../utils/responseModel.js";
import prisma from "../utils/prisma.js";
import { parseIntegerId } from "../utils/validation.js";

const attachWishlistStatus = (products, wishlistProductIds) => {
  return products.map((product) => ({
    ...product,
    isInWishlist: wishlistProductIds.has(product.id),
  }));
};

// Fetch all products
export const fetchAllProducts = async (req, res) => {
  try {
    const [products, wishlistItems] = await Promise.all([
      prisma.product.findMany(),
      req.userId
        ? prisma.wishlist.findMany({
            where: { userId: req.userId },
            select: { productId: true },
          })
        : [],
    ]);
    const responseProducts = req.userId
      ? attachWishlistStatus(
          products,
          new Set(wishlistItems.map((wishlistItem) => wishlistItem.productId)),
        )
      : products;

    res
      .status(200)
      .json(
        ResponseModel.success(
          "PRODUCTS_FETCHED_SUCCESSFULLY",
          responseProducts,
          req.lang,
        ),
      );
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json(
        ResponseModel.error("INTERNAL_SERVER_ERROR", error.message, req.lang),
      );
  }
};

// Fetch product by ID
export const fetchProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseIntegerId(id);

    if (!productId) {
      return res
        .status(400)
        .json(ResponseModel.error("INVALID_PRODUCT_ID", null, req.lang));
    }

    const [product, wishlistItem] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
      }),
      req.userId
        ? prisma.wishlist.findUnique({
            where: {
              userId_productId: {
                userId: req.userId,
                productId,
              },
            },
          })
        : null,
    ]);

    if (!product) {
      return res
        .status(404)
        .json(ResponseModel.error("PRODUCT_NOT_FOUND", null, req.lang));
    }

    const responseProduct = req.userId
      ? {
          ...product,
          isInWishlist: Boolean(wishlistItem),
        }
      : product;

    res
      .status(200)
      .json(
        ResponseModel.success(
          "PRODUCT_FETCHED_SUCCESSFULLY",
          responseProduct,
          req.lang,
        ),
      );
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res
      .status(500)
      .json(
        ResponseModel.error("INTERNAL_SERVER_ERROR", error.message, req.lang),
      );
  }
};
