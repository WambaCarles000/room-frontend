import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { createClient } from "@/lib/supabase/browser";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function buildUrl(path) {
  if (!path) return API_URL;
  return path.startsWith("http") ? path : `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function getTokenFromSupabase() {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch (e) {
    return null;
  }
}

async function request(method, path, { body, headers = {}, auth = false, signal } = {}) {
  const url = buildUrl(path);

  const init = {
    method,
    headers: { ...headers },
    signal,
  };

  if (body != null) {
    // let consumers pass FormData/raw body; otherwise stringify JSON
    if (body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      init.headers["Content-Type"] = init.headers["Content-Type"] || "application/json";
    }
  }

  if (auth) {
    const token = await getTokenFromSupabase();
    if (token) {
      init.headers = { ...init.headers, Authorization: `Bearer ${token}` };
    }
    // use fetchWithAuth to get standardized error handling for 401 / suspended
    return fetchWithAuth(url, init);
  }

  // non-auth requests: normal fetch + parse
  const res = await fetch(url, init);
  if (!res.ok) {
    let data = {};
    try {
      data = await res.clone().json();
    } catch (e) {}
    const msg = data?.message || res.statusText || "Request failed";
    throw new Error(msg);
  }

  try {
    return await res.json();
  } catch (e) {
    return res;
  }
}

export const api = {
  get: (path, opts) => request("GET", path, opts),
  post: (path, body, opts = {}) => request("POST", path, { ...opts, body }),
  put: (path, body, opts = {}) => request("PUT", path, { ...opts, body }),
  patch: (path, body, opts = {}) => request("PATCH", path, { ...opts, body }),
  del: (path, body, opts = {}) => request("DELETE", path, { ...opts, body }),
};

export default api;
