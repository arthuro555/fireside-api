import { sign, verify } from "jsonwebtoken";
import { jwtKey } from "./env";

export const createToken = (object: any) =>
  sign(object, jwtKey, {
    issuer: "fireside-api",
    // Lasts 30 days
    expiresIn: "30d",
  });

export const parseToken = (token: string) =>
  verify(token, jwtKey, { issuer: "fireside-api", maxAge: "30d" });
