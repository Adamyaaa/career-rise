import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/server-config";

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = `/${path.join("/")}`;
  const search = req.nextUrl.search;
  const targetUrl = `${API_BASE_URL}${targetPath}${search}`;

  const cookieStore = await cookies();
  let accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  const method = req.method;
  let body: any = undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  const makeFetch = async (token?: string) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(targetUrl, {
      method,
      headers,
      body: body ? body : undefined,
    });
  };

  let apiRes = await makeFetch(accessToken);

  // If unauthorized and we have a refresh token, perform silent refresh
  if (apiRes.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      accessToken = refreshData.accessToken;

      cookieStore.set("access_token", accessToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });

      cookieStore.set("refresh_token", refreshData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      // Retry the original request with the fresh token
      apiRes = await makeFetch(accessToken);
    }
  }

  const resText = await apiRes.text();
  let resJson: any = null;
  try {
    resJson = JSON.parse(resText);
  } catch {
    resJson = resText;
  }

  return NextResponse.json(resJson, { status: apiRes.status });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
