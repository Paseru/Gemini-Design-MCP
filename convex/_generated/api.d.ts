/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_gemini from "../actions/gemini.js";
import type * as actions_stripe from "../actions/stripe.js";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as lib_constants from "../lib/constants.js";
import type * as mutations_apiKeys from "../mutations/apiKeys.js";
import type * as mutations_billing from "../mutations/billing.js";
import type * as mutations_credits from "../mutations/credits.js";
import type * as mutations_stripe from "../mutations/stripe.js";
import type * as mutations_subscriptions from "../mutations/subscriptions.js";
import type * as mutations_users from "../mutations/users.js";
import type * as queries_apiKeys from "../queries/apiKeys.js";
import type * as queries_stripe from "../queries/stripe.js";
import type * as queries_subscriptions from "../queries/subscriptions.js";
import type * as queries_usage from "../queries/usage.js";
import type * as queries_users from "../queries/users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/gemini": typeof actions_gemini;
  "actions/stripe": typeof actions_stripe;
  auth: typeof auth;
  http: typeof http;
  "lib/constants": typeof lib_constants;
  "mutations/apiKeys": typeof mutations_apiKeys;
  "mutations/billing": typeof mutations_billing;
  "mutations/credits": typeof mutations_credits;
  "mutations/stripe": typeof mutations_stripe;
  "mutations/subscriptions": typeof mutations_subscriptions;
  "mutations/users": typeof mutations_users;
  "queries/apiKeys": typeof queries_apiKeys;
  "queries/stripe": typeof queries_stripe;
  "queries/subscriptions": typeof queries_subscriptions;
  "queries/usage": typeof queries_usage;
  "queries/users": typeof queries_users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
