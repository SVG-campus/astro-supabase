/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  // Add other environment variables here as needed.
}

declare namespace App {
  interface Locals {
    email: string;
  }
}
