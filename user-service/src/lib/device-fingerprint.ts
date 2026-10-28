import type { Request } from "express";
import crypto from "node:crypto";

export async function deviceFingerprint(req: Request) {
  const ip = req.ip;
  const userAgent = req.headers["user-agent"];
  const accept = req.headers["accept"];

  const raw = `${ip}:${userAgent}:${accept}`;

  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}
