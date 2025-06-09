// Type declarations for Deno and external modules
declare namespace Deno {
  export interface Env {
    get(name: string): string | undefined;
  }
  export const env: Env;
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare module "npm:@supabase/supabase-js@2.38.4" {
  export * from "@supabase/supabase-js";
}

declare module "npm:stripe@11.18.0" {
  import Stripe from "stripe";
  export default Stripe;
}

declare module "npm:stripe@17.7.0" {
  import Stripe from "stripe";
  export default Stripe;
}

// XHR module type definitions
declare module "https://deno.land/x/xhr@0.3.0/mod.ts"
