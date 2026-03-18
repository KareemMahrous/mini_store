import { verifyToken } from "../utils/authService.js";

export const optionalAuthMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  const payload = verifyToken(token);

  if (payload) {
    req.userId = payload.userId;
    req.userEmail = payload.email;
  }

  next();
};
