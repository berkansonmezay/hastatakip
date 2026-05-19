import React from "react";
import { Hammer, Construction } from "lucide-react";

export default function UnderConstruction({ title }: { title: string }) {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="p-6 bg-orange-100 dark:bg-orange-900/20 text-orange-600 rounded-full animate-bounce">
        <Construction size={64} />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        Bu modül şu anda geliştirme aşamasındadır. Çok yakında tam fonksiyonel olarak hizmetinizde olacaktır.
      </p>
      <div className="flex items-center gap-2 text-sm text-orange-500 font-medium bg-orange-50 dark:bg-orange-900/10 px-4 py-2 rounded-lg border border-orange-100 dark:border-orange-800">
        <Hammer size={16} />
        Yapım aşamasında
      </div>
    </div>
  );
}
