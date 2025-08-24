// Central auth-related configuration
// NOTE: In this Lovable setup, traditional frontend environment variables (VITE_*) are not supported.
// Use this flag to control whether changing the email requires confirmation (client-side behavior).
// If set to false, we will use an Edge Function with the service role to update the email instantly.
export const REQUIRE_EMAIL_CONFIRM_ON_CHANGE = false;