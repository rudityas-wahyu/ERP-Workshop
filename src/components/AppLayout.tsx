"use client";
import Sidebar from "@/src/components/Sidebar";
import { useEffect, useState } from "react";

export default function AppLayout({ children, headerAction }: { children: React.ReactNode; headerAction?: React.ReactNode }) {
  const [dateStr, setDateStr] = useState("...");
  
  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    );
  }, []);

  return (
    <div className="flex h-full w-full bg-zinc-950 text-zinc-300 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md px-8 flex shrink-0 items-center justify-between sticky top-0 z-10">
          <h1 className="text-sm font-medium tracking-tight text-zinc-100">
            Workshop Control Center
          </h1>
          <div className="flex items-center gap-6">
            {headerAction}
            {headerAction && <div className="h-4 w-[1px] bg-zinc-800"></div>}
            <span className="text-zinc-500 text-xs font-mono">{dateStr}</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
