"use client";

import React, { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Stethoscope, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="relative w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
        
        {/* Logo/Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-4 bg-blue-500/10 dark:bg-blue-400/10 rounded-2xl text-blue-600 dark:text-blue-400 mb-4 ring-8 ring-blue-500/5 dark:ring-blue-400/5">
            <Stethoscope size={36} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            HastaTakip
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            Klinik ve Muayenehane Yönetim Sistemi
          </p>
        </div>

        {/* Login Form */}
        <form action={action} className="space-y-6">
          
          {/* General Form Error */}
          {state?.errors?.form && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-sm font-medium text-red-600 dark:text-red-400">
              {state.errors.form.map((error, idx) => (
                <p key={idx}>{error}</p>
              ))}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={pending}
                placeholder="dr.ahmet@klinik.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all text-sm font-medium disabled:opacity-50"
              />
            </div>
            {state?.errors?.email && (
              <p className="text-xs font-semibold text-red-500 dark:text-red-400 mt-1">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Şifre
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={pending}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all text-sm font-medium disabled:opacity-50"
              />
            </div>
            {state?.errors?.password && (
              <p className="text-xs font-semibold text-red-500 dark:text-red-400 mt-1">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-white py-3.5 px-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 dark:shadow-none hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Giriş yapılıyor...
              </>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          Giriş yapmak için: <span className="font-semibold select-all">dr.ahmet@klinik.com</span> / <span className="font-semibold select-all">password123</span>
        </div>
      </div>
    </div>
  );
}
