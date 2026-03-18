import prisma from "../utils/prisma.js";
import ResponseModel from "../utils/responseModel.js";
import {
  createToken,
  hashPassword,
  verifyPassword,
} from "../utils/authService.js";

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(ResponseModel.error("EMAIL_AND_PASSWORD_REQUIRED", null, req.lang));
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json(ResponseModel.error("PASSWORD_TOO_SHORT", null, req.lang));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res
        .status(409)
        .json(ResponseModel.error("EMAIL_ALREADY_EXISTS", null, req.lang));
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        password: await hashPassword(password),
      },
    });

    const token = createToken({ userId: user.id, email: user.email });

    res.status(201).json(
      ResponseModel.success(
        "USER_REGISTERED_SUCCESSFULLY",
        {
          user: sanitizeUser(user),
          token,
        },
        req.lang,
      ),
    );
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json(
        ResponseModel.error("INTERNAL_SERVER_ERROR", error.message, req.lang),
      );
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(ResponseModel.error("EMAIL_AND_PASSWORD_REQUIRED", null, req.lang));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !(await verifyPassword(password, user.password))) {
      return res
        .status(401)
        .json(ResponseModel.error("INVALID_CREDENTIALS", null, req.lang));
    }

    const token = createToken({ userId: user.id, email: user.email });

    res.status(200).json(
      ResponseModel.success(
        "LOGIN_SUCCESSFUL",
        {
          user: sanitizeUser(user),
          token,
        },
        req.lang,
      ),
    );
  } catch (error) {
    console.error("Error logging in user:", error);
    res
      .status(500)
      .json(
        ResponseModel.error("INTERNAL_SERVER_ERROR", error.message, req.lang),
      );
  }
};
