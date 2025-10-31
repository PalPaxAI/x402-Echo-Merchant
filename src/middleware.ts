import { NextRequest, NextResponse } from "next/server";

// CORS configuration via environment variable
// Set CORS_ALLOWED_ORIGINS as a comma-separated list, e.g.:
// CORS_ALLOWED_ORIGINS="https://example.com,https://app.example.com"
const allowedCorsOrigins: string[] = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

function buildCorsHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const requestOrigin = request.headers.get("origin");

  if (requestOrigin && allowedCorsOrigins.includes(requestOrigin)) {
    headers.set("Access-Control-Allow-Origin", requestOrigin);
    headers.set("Vary", "Origin");
  }

  // Allow credentials only when we reflect a specific origin
  if (headers.has("Access-Control-Allow-Origin")) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Reflect requested headers for preflight
  const requestHeaders = request.headers.get("access-control-request-headers");
  if (requestHeaders) {
    headers.set("Access-Control-Allow-Headers", requestHeaders);
  } else {
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-PAYMENT, X-PAYMENT-RESPONSE");
  }

  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Max-Age", "600");
  // Expose custom headers used by the app to the browser
  headers.set("Access-Control-Expose-Headers", "X-PAYMENT-RESPONSE");

  return headers;
}

function withCors(request: NextRequest, response: NextResponse) {
  const corsHeaders = buildCorsHeaders(request);
  corsHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });
  return response;
}

export async function middleware(request: NextRequest) {
  // Handle CORS preflight
  if (request.method.toUpperCase() === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 });
    return withCors(request, preflight);
  }

  // For all API routes, add CORS headers
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    return withCors(request, response);
  }

      return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all API routes to ensure consistent CORS handling
    '/api/:path*'
  ]
};
