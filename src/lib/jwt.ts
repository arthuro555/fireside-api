import { TokenData } from "@/types/TokenData";
import { Jwt, sign, verify } from "jsonwebtoken";
import { jwtKey } from "./env";

export const createToken = (object: TokenData) =>
  sign(object, jwtKey, {
    issuer: "fireside-api",
    // Lasts 30 days
    expiresIn: "30d",
  });

export const parseToken = (token: string): TokenData =>
  // This type assertion is safe, as we will only ever sign a valid token.
  verify(token, jwtKey, { issuer: "fireside-api", maxAge: "30d" }) as TokenData;
