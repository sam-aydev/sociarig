import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/app/lib/util/supabase/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. CRITICAL BYPASSES (Auth Callback, Inngest, Webhooks)
  // These routes MUST execute without a valid user session cookie
  if (
    pathname.startsWith("/api/v1/inngest") ||
    pathname.startsWith("/api/v1/webhooks") ||
    pathname.startsWith("/auth/callback")
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = await createClient();

  // 2. Fetch the user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = pathname.startsWith("/auth");
  const unProtectedPage = pathname === "/" || pathname.startsWith("/blog");
  const isProtectedApp = pathname.startsWith("/app");
  const isOnboardingPage = pathname === "/app/onboarding";

  // 3. Unauthenticated user trying to access the app
  if (!user && isProtectedApp) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // 4. Authenticated user logic
  if (user) {
    // If they are on the auth page, push them into the app
    if (isAuthPage || unProtectedPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }

    // THE ONBOARDING GATE: Check the boolean flag
    if (isProtectedApp) {
      // Look up their brand voice settings
      const { data: voice } = await supabase
        .from("brand_voices")
        .select("is_onboarded")
        .eq("user_id", user.id)
        .single();

      // If they don't have a voice record yet, or it's false, they are not onboarded
      const hasFinishedOnboarding = voice?.is_onboarded === true;

      // Scenario A: They haven't finished, but are trying to access the main dashboard
      if (!hasFinishedOnboarding && !isOnboardingPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/app/onboarding";
        return NextResponse.redirect(url);
      }

      // Scenario B: They HAVE finished, but are trying to access the onboarding page
      if (hasFinishedOnboarding && isOnboardingPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/app";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Removed 'api|' so we can explicitly handle API routes in the middleware logic
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};