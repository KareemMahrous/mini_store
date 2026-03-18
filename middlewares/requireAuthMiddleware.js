import ResponseModel from "../utils/responseModel.js";

export const requireAuthMiddleware = (req, res, next) => {
  if (!req.userId) {
    return res
      .status(401)
      .json(ResponseModel.error("UNAUTHORIZED", null, req.lang));
  }

  next();
};
