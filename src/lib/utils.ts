import { NextResponse } from "next/server";
import type { TypeOf, ZodSchema } from "zod";

export const getQueryStringParameters = <Schema extends ZodSchema>(
  req: Request,
  zSchema: Schema
): TypeOf<Schema> => {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());

  // Match against zod schema.
  const parseResults = zSchema.safeParse(params);
  if (!parseResults.success)
    // The request is invalid, return a generic error.
    throw NextResponse.json({
      error: `Invalid request: see 'error_messages'`,
      error_messages: parseResults.error.issues
        .map(({ message }) => message)
        .join("\n"),
    });

  // The request is valid, carry on with the request parameters.
  return params;
};
