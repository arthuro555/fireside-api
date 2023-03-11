import { hostname, discodClientId, discodClientSecret } from "@/lib/env";
import { createToken } from "@/lib/jwt";
import { redisClient } from "@/lib/redis";
import { getQueryStringParameters, isResponse } from "@/lib/utils";
import { TokenData } from "@/types/TokenData";
import { redirect } from "next/navigation";
import * as z from "zod";

const scope = ["guilds.members.read"].join(" ");
// This endpoint also acts as the redirect URL
const REDIRECT_URI = `${hostname}/api/auth/oauth`;

const OAUTH_QS = new URLSearchParams({
  client_id: discodClientId,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope,
}).toString();

const OAUTH_URI = `https://discord.com/api/oauth2/authorize?${OAUTH_QS}`;

const queryStringValidator = z.object({
  // The discord oauth code
  code: z.string().optional(),
  // The authentication request ID
  state: z.string().uuid().optional(),
  // An error from discord
  error_description: z.string().optional(),
});

export const revalidate = 0;
export const GET = async (req: Request) => {
  const queryStringParametersOrErrorResponse = getQueryStringParameters(
    req,
    queryStringValidator
  );
  if (isResponse(queryStringParametersOrErrorResponse))
    return queryStringParametersOrErrorResponse;
  const { error_description, code, state } =
    queryStringParametersOrErrorResponse;

  // We received an error from discord, forward it.
  if (error_description) {
    redisClient.del(`auth_request:${state}`);
    return redirect(
      `/auth/failure?error=${encodeURIComponent(error_description)}`
    );
  }

  if (!state) {
    return redirect(
      `/auth/failure?error=${encodeURIComponent(
        `'state' argument missing. Initiate an authentication request with '/api/auth/init', and supply the resulting connection request ID to this endpoint.`
      )}`
    );
  }

  if (!(await redisClient.exists(`auth_request:${state}`))) {
    return redirect(
      `/auth/failure?error=${encodeURIComponent(
        `Auth request has timed out! Please try again.`
      )}`
    );
  }

  if (!code || typeof code !== "string") {
    // We did not receive a code, this is not a proper response from discord. Redirect to discord oath.
    return redirect(`${OAUTH_URI}&state=${encodeURIComponent(state)}`);
  }

  const body = new URLSearchParams({
    client_id: discodClientId,
    client_secret: discodClientSecret,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    code,
    scope,
  }).toString();

  const discordResponse = await fetch("https://discord.com/api/oauth2/token", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body,
  }).then((res) => res.json());

  const { access_token = null, token_type = "Bearer" } = discordResponse;

  if (!access_token || typeof access_token !== "string") {
    return redirect(
      `/auth/failure?error=${encodeURIComponent(
        `Discord did not send an access token back, could not verify that the authentication succeeded. ${JSON.stringify(
          discordResponse
        )}`
      )}`
    );
  }

  const firesideInfo:
    | { code: 10004 } // Response when the guild has not been joined
    // Informations about guild membership
    | {
        code: undefined;
        joined_at: Date;
        premium_since: number | null;
        roles: string[];
        user: { username: string; avatar: string; id: string };
      } = await fetch(
    "https://discord.com/api/users/@me/guilds/761432288877346837/member",
    {
      headers: { Authorization: `${token_type} ${access_token}` },
    }
  ).then((res) => res.json());

  if (firesideInfo.code === 10004) {
    return redirect(
      `/auth/failure?error=${encodeURIComponent(
        `You are not a member of the GameDev Fireside. As such, you cannot login to this system. Please join the GameDev Fireside (https://discord.com/invite/9dHpGJ3).`
      )}`
    );
  }

  const {
    user: { username, avatar, id },
    roles,
    joined_at,
    premium_since,
  } = firesideInfo;

  const isTheHelper = roles.includes("768532753107910729");
  const isMod = roles.includes("768534258104401950");
  const isFlame = roles.includes("768614621665427456");
  const isLit = roles.includes("768614558016208906");

  const tokenPayload: TokenData = {
    is_the_marshmallow_toaster: isTheHelper,
    is_marshal: isMod || isTheHelper,
    is_flame: isFlame || isMod || isTheHelper,
    is_kindling: isLit || isFlame || isMod || isTheHelper,
    is_nitro_booster: !!premium_since,
    membership_time_in_ms: Date.now() - new Date(joined_at).getTime(),
    username,
    avatarUrl: `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`,
  };

  const token = createToken(tokenPayload);
  // The token is to be read by the application through the polling endpoint in the next 30 seconds
  await redisClient.set(`auth_request:${state}`, token, "EX", 30);

  return redirect(`/auth/success`);
};
