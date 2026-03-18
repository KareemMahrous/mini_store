import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt);
const JWT_ALGORITHM = "HS256";
const JWT_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;

const base64UrlEncode = (value) => {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);

  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
};

const getJwtSecret = () => {
  return process.env.JWT_SECRET || "dev-jwt-secret-change-me";
};

const signSegment = (segment) => {
  return crypto
    .createHmac("sha256", getJwtSecret())
    .update(segment)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);

  return `${salt}:${derivedKey.toString("hex")}`;
};

export const verifyPassword = async (password, hashedPassword) => {
  const [salt, storedHash] = hashedPassword.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedKey = await scrypt(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, derivedKey);
};

export const createToken = ({ userId, email }) => {
  const header = base64UrlEncode(
    JSON.stringify({ alg: JWT_ALGORITHM, typ: "JWT" }),
  );
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: userId,
      email,
      exp: Math.floor(Date.now() / 1000) + JWT_EXPIRATION_SECONDS,
    }),
  );
  const signature = signSegment(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
};

export const verifyToken = (token) => {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    return null;
  }

  const expectedSignature = signSegment(`${header}.${payload}`);

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const parsedPayload = JSON.parse(base64UrlDecode(payload));

    if (
      !parsedPayload.sub ||
      !Number.isInteger(parsedPayload.sub) ||
      !parsedPayload.exp ||
      parsedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      userId: parsedPayload.sub,
      email: parsedPayload.email,
    };
  } catch {
    return null;
  }
};
