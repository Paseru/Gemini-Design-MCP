"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.queries.users.me);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-7 h-7 bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] font-medium text-stone-600 hover:bg-stone-200 hover:border-stone-300 transition-colors"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 shadow-[0_20px_50px_rgba(0,0,0,0.08)] z-50">
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Account</p>
            <p className="text-xs text-stone-900 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-3 text-left text-xs text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
