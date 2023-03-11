import { redisClient } from "@/lib/redis";
import { getQueryStringParameters, isResponse } from "@/lib/utils";
import { NextResponse } from "next/server";
import * as z from "zod";

const wait = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

const queryStringValidator = z.object({
  authRequestUid: z.string().uuid(),
});
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

  return NextResponse.json({ jwt });
};
