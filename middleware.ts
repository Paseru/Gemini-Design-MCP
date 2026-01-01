import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isLoginPage = createRouteMatcher(["/login"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/settings(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuth = await convexAuth.isAuthenticated();
  console.log("[Middleware]", request.nextUrl.pathname, "isAuthenticated:", isAuth);

  // Redirect authenticated users away from login page
  if (isLoginPage(request) && isAuth) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
  // Redirect unauthenticated users to login page
  if (isProtectedRoute(request) && !isAuth) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
