import { parseToken } from "@/lib/jwt";
import { redisClient } from "@/lib/redis";
import { getQueryStringParameters, isResponse } from "@/lib/utils";
import { NextResponse } from "next/server";
import * as z from "zod";

const wait = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

const queryStringValidator = z.object({
  authRequestUid: z.string().uuid(),
});

export const revalidate = 0;
export const GET = async (req: Request) => {
  const queryStringParametersOrErrorResponse = getQueryStringParameters(
    req,
    queryStringValidator
  );
  if (isResponse(queryStringParametersOrErrorResponse))
    return queryStringParametersOrErrorResponse;
  const { authRequestUid } = queryStringParametersOrErrorResponse;

  let jwt = await redisClient.get(`auth_request:${authRequestUid}`);
  if (!jwt)
    return NextResponse.json({
      error: `Authentication request already failed or expired.`,
    });

  while (jwt === "pending") {
    await wait(3000);
    jwt = await redisClient.get(`auth_request:${authRequestUid}`);
    if (!jwt)
      return NextResponse.json({
        error: `Authentication timed out.`,
      });
  }

  // Pre-parse the JWT to minimize work to do in the SDKs (since there are multiple its a higher engineering cost).
  // This also protects against an attack where someone gains access to the redis instance without having the JWT secret.
  const userData = parseToken(jwt);

  return NextResponse.json({ jwt, userData });
};
