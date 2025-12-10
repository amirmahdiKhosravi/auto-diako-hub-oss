"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Server action to handle user login
 * This function processes the login form submission on the server side
 * 
 * @param formData - Form data containing email and password fields
 */
export async function login(formData: FormData) {
  // 1. Get data from form
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 2. Validate that both email and password are provided
  if (!email || !password) {
    redirect("/auth/login?error=Email and password are required");
  }

  // 3. Create Supabase client for server-side authentication
  const supabase = await createClient();

  // 4. Sign in using Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // 5. Handle authentication errors
  if (error) {
    // Redirect back to login page with error message in URL
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  // 6. If successful, refresh the cache and redirect to protected route
  // Revalidating the root layout ensures user data is fresh after login
  revalidatePath("/", "layout");
  redirect("/dashboard"); 
} 
