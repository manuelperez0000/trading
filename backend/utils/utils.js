import { createHash } from "node:crypto";

export function isValidPassword(password) {
  return (
    typeof password === "string" &&
    Buffer.byteLength(password, "utf8") >= 8 &&
    Buffer.byteLength(password, "utf8") <= 72
  );
}

export function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function passwordResetUrl(token) {
  const baseUrl = process.env.PASSWORD_RESET_URL;
  if (!baseUrl) {
    throw new Error("PASSWORD_RESET_URL is not configured");
  }

  const url = new URL(baseUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("PASSWORD_RESET_URL must use HTTP or HTTPS");
  }
  url.searchParams.set("token", token);
  return url.toString();
}