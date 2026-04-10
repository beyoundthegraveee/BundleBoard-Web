import "server-only";
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export async function createSession(accessToken: string, refreshToken: string) {
  const payload = decodeJwt(refreshToken);
  
  const expiresAt = payload.exp 
    ? new Date(payload.exp * 1000) 
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const session = await encrypt({ 
    accessToken, 
    refreshToken, 
    expiresAt: expiresAt.toISOString() 
  });

   cookies().set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt
  });
}

export async function deleteSession() {
  cookies().delete("session");
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(encodedKey);
}


export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}