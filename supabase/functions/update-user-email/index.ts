// Supabase Edge Function: update-user-email
// Updates the authenticated user's email without requiring confirmation
// Requires SUPABASE_SERVICE_ROLE_KEY to be set as a secret

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://hvdfrpmzexovxbjqtqtj.supabase.co';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!serviceRoleKey) {
      return json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, 500);
    }
    if (!anonKey) {
      return json({ error: 'Falta SUPABASE_ANON_KEY' }, 500);
    }

    // Client using anon key and caller's JWT to get current user
    const supabaseAuthClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') ?? '' }
      }
    });

    const {
      data: { user },
      error: getUserError,
    } = await supabaseAuthClient.auth.getUser();

    if (getUserError || !user) {
      return json({ error: 'No autorizado' }, 401);
    }

    const body = await req.json().catch(() => null);
    const newEmail: string | undefined = body?.newEmail;

    if (!newEmail || typeof newEmail !== 'string') {
      return json({ error: 'newEmail es requerido' }, 400);
    }

    // Admin client to perform the update without confirmation
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email: newEmail,
      email_confirm: true, // mark as confirmed
    } as any);

    if (updateError) {
      return json({ error: updateError.message }, 500);
    }

    return json({ success: true });
  } catch (e) {
    return json({ error: e?.message || 'Unexpected error' }, 500);
  }
}, { onListen: () => {} });

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    }
  });
}
