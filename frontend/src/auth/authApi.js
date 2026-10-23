// Client for the authentication API.
//
// NOTE: the India-Tour backend does not implement these endpoints yet. Until it does, every
// call resolves to an "unavailable" AuthError and the UI says so; nothing pretends to succeed.
//
// Expected contract (see README "Authentication"):
//   POST /api/auth/register  { name, email, password }       -> 201 { user }  | 409 email taken
//   POST /api/auth/login     { email, password, remember }   -> 200 { user }  | 401 bad credentials
// The server should hash passwords and keep the session in an httpOnly cookie, so the
// frontend never stores passwords or tokens.

const BASE = import.meta.env.VITE_API_URL || "";

export class AuthError extends Error {
  constructor(message, kind) {
    super(message);
    this.kind = kind;
  }
}

async function post(path, body) {
  let res;
  try {
    res = await fetch(`${BASE}/api/auth${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError("We couldn't reach the server. Check your connection and try again.", "network");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty or non-JSON body
  }
  if (res.ok) return data;

  switch (res.status) {
    case 404:
    case 405:
    case 501:
      throw new AuthError(
        "Accounts aren't available yet: the India-Tour server doesn't support sign-in so far. Nothing was saved.",
        "unavailable"
      );
    case 401:
      throw new AuthError("That email and password don't match. Please try again.", "invalid_credentials");
    case 409:
      throw new AuthError("An account with this email already exists. Try logging in instead.", "exists");
    case 429:
      throw new AuthError("Too many attempts. Please wait a moment and try again.", "rate_limited");
    case 400:
    case 422:
      throw new AuthError(
        typeof data?.detail === "string" ? data.detail : "Please check your details and try again.",
        "invalid"
      );
    default:
      throw new AuthError("Something went wrong on our side. Please try again in a moment.", "server");
  }
}

export const authApi = {
  login: ({ email, password, remember }) =>
    post("/login", { email: email.trim(), password, remember }),
  register: ({ name, email, password }) =>
    post("/register", { name: name.trim(), email: email.trim(), password }),
};
