import { createCookieSessionStorage, type Session } from "react-router";
import { portal } from "../config";
export interface PortalUser {
  id: string;
  name: string;
  role: string;
  country_code: string;
  language?: string;
}
export type SessionData = {
  accessToken: string;
  refreshToken: string;
  user: PortalUser;
  preAuthToken: string;
  phone: string;
};
export type PortalSession = Session<SessionData>;
export function sessionStorage() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return createCookieSessionStorage<SessionData>({
    cookie: {
      name: `ringdo_${portal.id}`,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
      secrets: [secret],
    },
  });
}
export async function readSession(request: Request) {
  const storage = sessionStorage();
  return {
    storage,
    session: storage
      ? await storage.getSession(request.headers.get("Cookie"))
      : null,
  };
}
export function publicUser(user: PortalUser | undefined): PortalUser | null {
  return user
    ? {
        id: user.id,
        name: user.name,
        role: user.role,
        country_code: user.country_code,
        language: user.language,
      }
    : null;
}
