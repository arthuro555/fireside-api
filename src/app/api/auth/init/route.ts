import { redisClient } from "@/lib/redis";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const GET = async (req: Request) => {
  const uid = randomUUID();
  // Auth request will expire after 120 second
  await redisClient.set(`auth_request:${uid}`, "pending", "EX", 120);
  return NextResponse.json({ uid });
};
