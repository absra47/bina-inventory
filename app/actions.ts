"use server";

import { redirect } from "next/navigation";
import { verifyCredentials, createSession, destroySession } from "@/lib/auth";

export async function login(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const session = await verifyCredentials(email, password);
  if (!session) {
    return { error: "Invalid email or password." };
  }
  await createSession(session);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
