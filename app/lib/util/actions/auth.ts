"use server";

import { createClient } from "../supabase/server";
import { redirect } from "next/navigation";
// Import the base client to create an Admin instance that bypasses RLS
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function loginUser(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Returning the route to the client for frontend redirection
  return { success: true, route: "/app" };
}

export async function signUpUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Use the standard client to create the user account
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // If signup succeeds, we must provision their default workspace
  if (data.user) {
    // Check which environment variable name you are actually using for the secret key
    const secretKey =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Fail loudly if the secret key is missing from the environment
    if (!secretKey) {
      console.error(
        "CRITICAL: Missing Supabase Secret Key in environment variables.",
      );
      return { error: "Server configuration error. Please contact support." };
    }

    // Initialize Admin Client to bypass RLS and cookie requirements
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      secretKey,
    );

    // Provision the default workspace using the Admin Client
    const { error: insertError } = await supabaseAdmin
      .from("brand_voices")
      .insert({
        user_id: data.user.id,
        name: "My Primary Voice",
        system_prompt: "Default voice generated during onboarding.",
      });

    if (insertError) {
      console.error("Failed to provision voice:", insertError);
      return { error: "Account created, but failed to setup workspace." };
    }

    // Direct new users to the mandatory vector training gate
    return { success: true, route: "/app/onboarding" };
  }
}

export async function signOutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth");
}


export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Redirects the user to this page after they click the email link
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  // Update the authenticated user's password
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, route: "/app" }; // Redirect to dashboard on success
}