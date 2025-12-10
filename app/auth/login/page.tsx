import { login } from "./actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

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
    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
      {params.error}
    </div>
  );
}

/**
 * LoginPage Component
 * Server component that renders the login form
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
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <form className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-md">
        {/* Header section with branding */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Auto Diako Hub</h1>
          <p className="text-gray-500">Sign in to manage inventory</p>
        </div>
        
        {/* Email input field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            required 
            placeholder="admin@autodiako.com" 
          />
        </div>
        
        {/* Password input field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            required 
          />
        </div>

        {/* Display error message if authentication fails */}
        <Suspense fallback={null}>
          <ErrorDisplay searchParams={searchParams} />
        </Suspense>

        {/* Submit button - formAction prop handles server-side submission */}
        <Button formAction={login} className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
}
