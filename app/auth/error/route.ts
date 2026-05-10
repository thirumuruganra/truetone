import { NextResponse } from "next/server";

export function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const redirectUrl = new URL("/", origin);
  const response = NextResponse.redirect(redirectUrl);
  const error = searchParams.get("error");

  if (error) {
    response.cookies.set("auth-error", error, {
      httpOnly: true,
      maxAge: 15,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}