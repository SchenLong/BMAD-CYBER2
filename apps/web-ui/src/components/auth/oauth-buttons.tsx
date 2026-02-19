/**
 * OAuth Sign-in Button Component
 * Story 1.3: Authentication - OAuth Providers
 *
 * Provides styled OAuth sign-in buttons for Google and GitHub.
 * Integrates with NextAuth.js signIn function.
 */

"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

/**
 * Props for OAuthButton component
 */
interface OAuthButtonProps {
  provider: "google" | "github";
  callbackUrl?: string;
  className?: string;
}

/**
 * SVG Icon for Google
 */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
    <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
    <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
    <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
  </svg>
);

/**
 * SVG Icon for GitHub
 */
const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 1C4.58173 1 1 4.58173 1 9C1 12.393 3.00698 15.2974 5.88521 16.5C5.98518 16.5196 6.02743 16.5 6.02743 16.3677V14.9206C6.02743 14.9206 5.66125 15.0265 5.24416 15.0265C4.07693 15.0265 3.72762 14.1369 3.72762 14.1369C3.72762 14.1369 3.35705 13.3456 2.91504 13.3456C2.91504 13.3456 2.29865 13.3219 2.96484 13.3456C2.96484 13.3456 2.33434 13.7754 2.33434 14.6059C2.33434 15.0265 2.62039 15.4015 2.62039 15.4015C2.62039 15.4015 2.33434 16.1269 2.33434 16.1269C2.33434 16.1269 3.00053 17.1367 4.56582 17.1367C5.21018 17.1367 5.75402 16.9609 5.75402 16.9609C5.75402 16.9609 5.66125 16.3677 5.66125 16.3677V16.5C8.53948 15.2974 10.5465 12.393 10.5465 9C10.5465 4.58173 7.41827 1 9 1Z" fill="white"/>
  </svg>
);

/**
 * Configuration for each OAuth provider
 */
const providerConfig = {
  google: {
    name: "Google",
    bgColor: "bg-white dark:bg-gray-100",
    textColor: "text-gray-900",
    borderColor: "border-gray-300",
    hoverBg: "hover:bg-gray-50 dark:hover:bg-gray-200",
    icon: <GoogleIcon />
  },
  github: {
    name: "GitHub",
    bgColor: "bg-gray-900 dark:bg-gray-800",
    textColor: "text-white",
    borderColor: "border-transparent",
    hoverBg: "hover:bg-gray-800 dark:hover:bg-gray-700",
    icon: <GitHubIcon />
  }
};

/**
 * Simple spinner component for loading state
 */
function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-5 w-5 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * OAuth Sign-in Button Component
 *
 * @param provider - The OAuth provider ("google" or "github")
 * @param callbackUrl - URL to redirect to after successful sign-in
 * @param className - Additional CSS classes for styling
 *
 * @example
 * ```tsx
 * <OAuthButton provider="google" callbackUrl="/dashboard" />
 * <OAuthButton provider="github" callbackUrl="/dashboard" />
 * ```
 */
export function OAuthButton({ provider, callbackUrl, className = "" }: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const config = providerConfig[provider];

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn(provider, { callbackUrl, redirect: false });
      if (result?.error) {
        setError(`Failed to sign in with ${config.name}: ${result.error}`);
        setIsLoading(false);
      } else if (result?.ok) {
        // Successful sign-in - will be handled by NextAuth redirect
        window.location.href = callbackUrl || "/dashboard";
      }
    } catch (err) {
      setError(`An error occurred signing in with ${config.name}`);
      console.error(`Sign in with ${config.name} error:`, err);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className={`
          ${config.bgColor} ${config.textColor} ${config.borderColor} ${config.hoverBg}
          border rounded-md px-4 py-2.5 flex items-center justify-center gap-3 font-medium
          transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          w-full
          ${className}
        `}
        type="button"
      >
        {isLoading ? (
          <Spinner className={provider === "google" ? "text-gray-600" : "text-white"} />
        ) : (
          config.icon
        )}
        <span>
          {isLoading ? "Signing in..." : `Continue with ${config.name}`}
        </span>
      </button>
      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}

/**
 * Container component for all OAuth buttons
 *
 * Displays OAuth buttons with a divider for visual separation
 *
 * @example
 * ```tsx
 * <OAuthSignInButtons callbackUrl="/dashboard" />
 * ```
 */
interface OAuthSignInButtonsProps {
  callbackUrl?: string;
  className?: string;
}

export function OAuthSignInButtons({ callbackUrl, className = "" }: OAuthSignInButtonsProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <OAuthButton provider="google" callbackUrl={callbackUrl} />
        <OAuthButton provider="github" callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}

/**
 * Individual OAuth button for use in custom layouts
 *
 * @example
 * ```tsx
 * <GoogleButton callbackUrl="/dashboard" />
 * <GitHubButton callbackUrl="/dashboard" />
 * ```
 */
export function GoogleButton({ callbackUrl, className }: { callbackUrl?: string; className?: string }) {
  return <OAuthButton provider="google" callbackUrl={callbackUrl} className={className} />;
}

export function GitHubButton({ callbackUrl, className }: { callbackUrl?: string; className?: string }) {
  return <OAuthButton provider="github" callbackUrl={callbackUrl} className={className} />;
}
