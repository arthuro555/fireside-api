import { redisClient } from "@/lib/redis";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const revalidate = 0;
export const GET = async (req: Request) => {
  const authRequestUid = randomUUID();
  // Auth request will expire after 120 second
  await redisClient.set(`auth_request:${authRequestUid}`, "pending", "EX", 120);
  return NextResponse.json({ authRequestUid });
};
