"use server";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(1, "Şifre girilmelidir."),
});

export type LoginState = {
  errors?: {
    email?: string[];
    password?: string[];
    form?: string[];
  };
  success?: boolean;
};

export async function loginAction(state: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  try {
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: result.data.email },
    });

    // Check credentials (plain text to match seed data)
    if (!user || user.password !== result.data.password) {
      return {
        errors: {
          form: ["E-posta veya şifre hatalı."],
        },
      };
    }

    // Create session
    await createSession({
      userId: user.id,
      role: user.role,
      name: user.name || "Kullanıcı",
    });
  } catch (error) {
    console.error("Login database error:", error);
    return {
      errors: {
        form: ["Veritabanı bağlantı hatası oluştu."],
      },
    };
  }

  // Redirect to dashboard
  redirect("/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
