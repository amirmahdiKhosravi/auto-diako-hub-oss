import { login } from "./actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/password-input";
import { Suspense } from "react";
import Link from "next/link";
import { RevAvenueLogo } from "@/components/rev-avenue-logo";

/**
 * ErrorDisplay Component
 * Displays authentication errors from URL search parameters
 * Uses Suspense for async searchParams handling in Next.js 15+
 * 
 * @param searchParams - Promise containing error message from URL query params
 */
async function ErrorDisplay({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (!params?.error) return null;

  return (
    <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
      {params.error}
    </div>
  );
}

/**
 * LoginPage Component
 * Server component that renders the login form with split-screen layout
 * Uses server actions for form submission (progressive enhancement)
 * 
 * @param searchParams - Promise containing error message from URL query params (for error display)
 */
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Branding Area (Desktop only) */}
      <div className="hidden md:flex md:w-[45%] relative bg-cover bg-center bg-no-repeat" 
           style={{
             backgroundImage: "url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1923&q=80)"
           }}>
        {/* Dark overlay with 60% opacity */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white px-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            The Central Inventory Hub
          </h1>
          <p className="text-lg md:text-xl text-center text-gray-200">
            Manage inventory, monitor AI Sales Agent performance, and close deals in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-[55%] flex items-center justify-center bg-gray-50 dark:bg-gray-50 p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo - dark container so white logo is visible on light background */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center justify-center rounded-lg bg-gray-900 px-6 py-3">
              <RevAvenueLogo width={160} height={44} priority />
            </div>
          </div>

          {/* Login Form */}
          <form action={login} className="space-y-6">
            {/* Email input field */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
                placeholder="admin@revavenue.com"
                className="bg-white text-gray-900 dark:text-gray-900"
              />
            </div>
            
            {/* Password input field */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput 
                id="password" 
                name="password" 
                required
                className="bg-white text-gray-900 dark:text-gray-900"
              />
            </div>

            {/* Display error message if authentication fails */}
            <Suspense fallback={null}>
              <ErrorDisplay searchParams={searchParams} />
            </Suspense>

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 text-white"
            >
              Sign In
            </Button>

            {/* Forgot Password link */}
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Footer note */}
            <div className="text-center text-xs text-muted-foreground pt-4">
              Having trouble? Contact your admin.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
