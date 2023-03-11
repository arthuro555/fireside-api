import { NextResponse } from "next/server";
import type { TypeOf, ZodSchema } from "zod";

export const getQueryStringParameters = <Schema extends ZodSchema>(
  req: Request,
  zSchema: Schema
): TypeOf<Schema> | NextResponse => {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());

  // Match against zod schema.
  const parseResults = zSchema.safeParse(params);
  if (!parseResults.success)
    // The request is invalid, return a generic error.
    return NextResponse.json(
      {
        error: `Bad request: see 'error_messages'`,
        error_messages: parseResults.error.issues
          .map(({ path, message }) => `${path}: ${message}`)
          .join("\n"),
      },
      { status: 400 }
    );

  // The request is valid, carry on with the request parameters.
  return params;
};

export const isResponse = (obj: any): obj is Response => {
  return obj instanceof Response;
};
