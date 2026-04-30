import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { config } from "../config.js";

export type AccessPayload = { sub: string; email: string };

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, config.jwtAccessSecret, { expiresIn: config.accessTtlSec });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, config.jwtAccessSecret) as AccessPayload & jwt.JwtPayload;
  return { sub: decoded.sub, email: decoded.email };
}

export function newRefreshTokenValue(): string {
  return randomBytes(48).toString("base64url");
}

export function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
