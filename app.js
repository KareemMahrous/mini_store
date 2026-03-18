import express from "express";
import authRoutes from "./routes/auth.routes.js";
import productsRoutes from "./routes/products.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import { localizationMiddleware } from "./middlewares/localizationMiddleware.js";
import { optionalAuthMiddleware } from "./middlewares/optionalAuthMiddleware.js";

const app = express();

app.use(express.json());

// Add localization middleware BEFORE routes
app.use(localizationMiddleware);
app.use(optionalAuthMiddleware);

app.use("/auth", authRoutes);
app.use("/products", productsRoutes);
app.use("/wishlist", wishlistRoutes);

export default app;
