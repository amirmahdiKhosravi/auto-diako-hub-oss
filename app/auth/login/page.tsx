import { login } from "./actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import Link from "next/link";

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
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Auto Diako Hub</CardTitle>
            <CardDescription>Sign in to manage your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={login} className="space-y-6">
              {/* Email input field */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="admin@autodiako.com"
                  className="bg-background"
                />
              </div>
              
              {/* Password input field */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required
                  className="bg-background"
                />
              </div>

              {/* Display error message if authentication fails */}
              <Suspense fallback={null}>
                <ErrorDisplay searchParams={searchParams} />
              </Suspense>

              {/* Submit button - formAction prop handles server-side submission */}
              <Button type="submit" className="w-full">
                Sign In
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
