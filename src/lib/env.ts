import * as z from "zod";

const envSchema = z.object({
  API_HOSTNAME: z.string().url().default("http://localhost:3000"),
  JWT_SECRET_SIGN_KEY: z.string().min(10),

  DISCORD_CLIENT_ID: z.string().min(18),
  DISCORD_CLIENT_SECRET: z.string().min(18),

  REDIS_HOST: z.string().ip(),
  REDIS_PASSWORD: z.string().min(5),
});

try {
  var {
    API_HOSTNAME,
    JWT_SECRET_SIGN_KEY,
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    REDIS_HOST,
    REDIS_PASSWORD,
  } = envSchema.parse(process.env);
} catch (e) {
  throw new Error(`Environement variable secrets are missing!
Make sure you have a ".env.local" file at the root of the project, and add the following missing keys:
${(e as z.ZodError).issues.reduce(
  (acc, issue) => (acc += `${issue.path[0]}\n`),
  "\n"
)}`);
}

export const hostname = API_HOSTNAME;
export const discodClientId = DISCORD_CLIENT_ID;
export const discodClientSecret = DISCORD_CLIENT_SECRET;
export const jwtKey = JWT_SECRET_SIGN_KEY;
export const redisHost = REDIS_HOST;
export const redisPassword = REDIS_PASSWORD;
