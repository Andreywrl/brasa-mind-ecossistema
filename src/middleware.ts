import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const isLoggedIn = Boolean(req.auth?.user);

  const memberArea = pathname.startsWith("/membro");
  const adminArea = pathname.startsWith("/admin");
  const portariaArea = pathname.startsWith("/portaria");

  if ((memberArea || adminArea || portariaArea) && !isLoggedIn) {
    const url = new URL("/", req.nextUrl.origin);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (adminArea && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/membro", req.nextUrl.origin));
  }

  if (portariaArea && role !== "PORTARIA" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  if (memberArea && role === "ADMIN") {
    // admins can peek member area
  } else if (memberArea && role === "PORTARIA") {
    return NextResponse.redirect(new URL("/portaria", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/membro/:path*", "/admin/:path*", "/portaria/:path*"],
};
