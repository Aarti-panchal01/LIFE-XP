
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Target } from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: Home, path: "Dashboard" },
  { name: "Goals", icon: Target, path: "Goals" },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  if (currentPageName === "Onboarding") {
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="hidden md:block border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
              <div className="text-3xl">🎯</div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">LIFE XP</h1>
                <p className="text-xs text-cyan-400">LEVEL UP YOUR LIFE</p>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === createPageUrl(item.path);
                return (
                  <Link
                    key={item.path}
                    to={createPageUrl(item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="pb-20 md:pb-0">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex items-center justify-around py-3 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === createPageUrl(item.path);
            return (
              <Link
                key={item.path}
                to={createPageUrl(item.path)}
                className="flex flex-col items-center gap-1 min-w-[60px]"
              >
                <div
                  className={`p-2 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600"
                      : "text-white/60"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                </div>
                <span
                  className={`text-xs ${
                    isActive ? "text-white font-semibold" : "text-white/60"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
