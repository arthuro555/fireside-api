import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  return NextResponse.json({ success: true });
};
