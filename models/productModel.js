/**
 * Product Model
 * 
 * Represents a product in the system
 * Can be added to users' wishlists
 * 
 * Schema Example (for Prisma):
 * model Product {
 *   id          Int       @id @default(autoincrement())
 *   name        String
 *   description String?
 *   price       Float
 *   image       String?
 *   category    String?
 *   stock       Int       @default(0)
 *   createdAt   DateTime  @default(now())
 *   updatedAt   DateTime  @updatedAt
 *   
 *   // Relations
 *   wishlists   Wishlist[]
 * }
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get all products
 */
export const getAllProducts = async () => {
  return await prisma.product.findMany({
    include: {
      wishlists: true,
    },
  });
};

/**
 * Get product by ID
 */
export const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      wishlists: true,
    },
  });
};

/**
 * Create new product
 */
export const createProduct = async (productData) => {
  return await prisma.product.create({
    data: productData,
    include: {
      wishlists: true,
    },
  });
};

/**
 * Update product
 */
export const updateProduct = async (id, productData) => {
  return await prisma.product.update({
    where: { id: parseInt(id) },
    data: productData,
    include: {
      wishlists: true,
    },
  });
};

/**
 * Delete product
 */
export const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id: parseInt(id) },
  });
};

/**
 * Get product with wishlist info
 */
export const getProductWithWishlists = async (id) => {
  return await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      wishlists: {
        include: {
          user: true,
        },
      },
    },
  });
};
