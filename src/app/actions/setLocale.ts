"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isSupported } from "~/i18n/locales";

export async function setLocale(locale: string) {
  if (!isSupported(locale)) return;

  const cookieStore = cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/", "layout");
}
