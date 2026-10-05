"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  LayoutDashboard,
  Mic2,
  History,
  CreditCard,
  LogOut,
  Settings,
  Menu,
  X,
  Zap,
  Bell,
  CheckCircle2,
  AlertCircle,
  Loader,
  Clock,
  ChevronRight,
  Server,
} from "lucide-react";
import { useProfile } from "@/app/lib/util/hooks/useProfile";
import { useAppLayout } from "@/app/lib/util/hooks/useAppLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const { logout, isLoggingOut } = useProfile();
  const { userData, isLoading } = useAppLayout();

  const navItems = [
    { name: "Generator", href: "/app", icon: LayoutDashboard },
    { name: "Brand Voices", href: "/app/voices", icon: Mic2 },
    { name: "History", href: "/app/history", icon: History },
    { name: "Billing", href: "/app/billing", icon: CreditCard },
  ];

  // FIX: Provide a safe fallback (1) to prevent division by zero or NaN
  const limit = userData?.limit || 5; // Default Free tier limit
  const used = userData?.used || 0;
  const usagePercent = Math.min(100, (used / limit) * 100) || 0;
  const isUsageHigh = usagePercent > 80;

  if (pathname === "/app/onboarding") {
    return <>{children}</>;
  }

  return (
    <div className="h-dvh w-full flex bg-paper text-ink font-sans overflow-hidden">
      {/* Left Sidebar */}
      <aside className="hidden rounded-2xl md:flex flex-col w-64 h-full shrink-0 border-r border-ink/10 bg-white shadow-[4px_0_24px_rgba(18,21,27,0.02)] z-20 relative">
        <div className="h-20 shrink-0 flex items-center px-6 gap-3 border-b border-ink/5">
          <div className="size-12 rounded-full bg-linear-to-tr from-green-700 to-signal flex items-center justify-center shadow-lg shadow-signal/20">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 17C4 17 8 7 16 7"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeOpacity="0.4"
              />
              <path
                d="M8 21C8 21 12 11 20 11"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="20" cy="11" r="2" fill="#FFFFFF" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-ink">
            Sociarig
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold text-ink-soft uppercase tracking-widest px-3 mb-4">
            Menu
          </div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== "/app");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative block group"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-paper-dim/60 rounded-xl border border-ink/5"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div
                  className={`relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive ? "text-ink" : "text-ink-soft hover:text-ink hover:bg-paper/30"}`}
                >
                  <Icon
                    size={18}
                    className={`shrink-0 ${isActive ? "text-signal" : "text-ink-faint group-hover:text-ink-soft transition-colors"}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 p-4 space-y-4 border-t border-ink/5 bg-paper-dim/10">
          <div className="bg-white border border-ink/10 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap size={40} />
            </div>
            <p className="text-[10px] font-bold text-ink-soft uppercase tracking-wider mb-2">
              Monthly Usage
            </p>
            <div className="flex items-end justify-between mb-3 relative z-10">
              {isLoading ? (
                <div className="h-6 w-16 bg-ink/10 animate-pulse rounded" />
              ) : (
                <span className="text-xl font-bold text-ink leading-none">
                  {used}{" "}
                  <span className="text-xs font-medium text-ink-soft">
                    / {limit}
                  </span>
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-paper rounded-full overflow-hidden relative z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className={`h-full rounded-full relative ${isUsageHigh ? "bg-red-700" : "bg-signal"}`}
              >
                {!isUsageHigh && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              </motion.div>
            </div>
          </div>

          <div className="group relative bg-white border border-ink/10 rounded-2xl p-2 transition-all hover:border-ink/20 hover:shadow-md h-[65px] cursor-pointer">
            <div className="absolute inset-0 flex items-center gap-3 px-3 py-2 transition-opacity duration-200 opacity-100 group-hover:opacity-0 pointer-events-none">
              {isLoading ? (
                <div className="w-10 h-10 rounded-[12px] bg-ink/10 animate-pulse shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-[12px] bg-paper text-black flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                  {userData?.initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {isLoading ? (
                  <>
                    <div className="h-3 w-20 bg-ink/10 animate-pulse rounded mb-1" />
                    <div className="h-2 w-12 bg-ink/10 animate-pulse rounded" />
                  </>
                ) : (
                  <>
                    <p className="text-[13px] font-bold text-ink truncate">
                      {userData?.fullName}
                    </p>
                    <p className="text-[11px] text-ink-soft truncate font-medium">
                      {userData?.planName}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-1">
              <Link
                href="/app/profile"
                className="flex-1 h-[calc(100%-8px)] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-ink hover:bg-paper transition-colors"
              >
                <Settings size={14} /> Profile
              </Link>
              <div className="w-px h-6 bg-ink/10 shrink-0" />
              <button
                disabled={isLoggingOut}
                onClick={() => logout()}
                className="flex-1 cursor-pointer h-[calc(100%-8px)] rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-ember hover:bg-ember/5 transition-colors"
              >
                <LogOut size={14} />{" "}
                {isLoggingOut ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  "Log Out"
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-ink/10 bg-white/80 backdrop-blur-xl z-50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-linear-to-tr from-green-700 to-signal flex items-center justify-center shadow-lg shadow-signal/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 17C4 17 8 7 16 7"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeOpacity="0.4"
              />
              <path
                d="M8 21C8 21 12 11 20 11"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="20" cy="11" r="2" fill="#FFFFFF" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-ink tracking-tight">
            Sociarig
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/app/profile"
            className="w-8 h-8 rounded-full bg-paper  text-black flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer"
          >
            {userData?.initials || "U"}
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-ink-soft hover:text-ink transition-colors bg-paper rounded-lg"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-16 bg-white border-b border-ink/10 z-40 p-4 shadow-xl rounded-b-[2rem]"
          >
            <nav className="space-y-1.5 mb-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-semibold transition-colors ${isActive ? "bg-paper-dim border border-ink/5 text-ink" : "text-ink-soft hover:bg-paper-dim/30"}`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? "text-signal" : "text-ink-faint"}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-ink/10">
              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="flex w-full items-center justify-center gap-2 py-4 rounded-xl bg-paper text-ember font-bold text-sm transition-colors hover:bg-ember/10"
              >
                <LogOut size={16} />{" "}
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative bg-[radial-gradient(ellipse_at_top_right,_var(--color-signal)_0%,_transparent_50%)] bg-no-repeat bg-[length:600px_600px] bg-[position:100%_-200px] opacity-90 transition-all">
        <div className="pt-24 md:pt-8 max-w-5xl mx-auto p-5 sm:p-8 xl:p-12 min-h-full">
          {children}
        </div>
      </main>

      {/* 5. Right Sidebar (Activity Hub) */}
      <motion.aside
        initial={false}
        animate={{ width: isRightSidebarCollapsed ? 80 : 288 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden xl:flex flex-col rounded-2xl h-full shrink-0 border-l border-ink/10 bg-white/50 backdrop-blur-md shadow-[-4px_0_24px_rgba(18,21,27,0.02)] z-10 relative"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
          className="absolute -left-4 top-8 w-8 h-8 bg-white border border-ink/10 rounded-full flex items-center justify-center text-ink-soft hover:text-signal shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all z-50 ring-[6px] ring-paper cursor-pointer group outline-none"
        >
          <motion.div
            animate={{ rotate: isRightSidebarCollapsed ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ChevronRight
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
          </motion.div>
        </button>

        <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
          <div
            className={`h-20 shrink-0 flex items-center border-b border-ink/5 transition-all ${isRightSidebarCollapsed ? "justify-center px-0" : "justify-between px-6"}`}
          >
            <AnimatePresence mode="popLayout">
              {!isRightSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-bold text-ink whitespace-nowrap overflow-hidden"
                >
                  Activity Hub
                </motion.span>
              )}
            </AnimatePresence>
            <div className="relative cursor-pointer hover:bg-paper p-2 rounded-lg transition-colors">
              <Bell size={18} className="text-ink-soft" />
              {userData?.activities && userData.activities.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-signal border-2 border-white" />
              )}
            </div>
          </div>

          <div
            className={`flex-1 overflow-y-auto space-y-8 ${isRightSidebarCollapsed ? "p-3" : "p-5"}`}
          >
            <div>
              <AnimatePresence mode="popLayout">
                {!isRightSidebarCollapsed && (
                  <motion.h4
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-4 whitespace-nowrap overflow-hidden"
                  >
                    Recent Events
                  </motion.h4>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="w-5 h-5 border-2 border-ink/20 border-t-signal rounded-full animate-spin" />
                  </div>
                ) : userData?.activities?.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock size={24} className="mx-auto text-ink-faint mb-2" />
                    {!isRightSidebarCollapsed && (
                      <p className="text-xs text-ink-soft font-medium">
                        No activity
                      </p>
                    )}
                  </div>
                ) : (
                  userData?.activities?.map((notif) => (
                    <Link href="/app/history" key={notif.id} className="block">
                      <div
                        title={notif.message}
                        className={`bg-white border border-ink/10 rounded-xl shadow-sm flex items-center group hover:border-signal/30 transition-all cursor-pointer overflow-hidden ${isRightSidebarCollapsed ? "p-3 justify-center aspect-square" : "p-3.5 gap-3"}`}
                      >
                        <div className="shrink-0">
                          {notif.type === "success" ? (
                            <CheckCircle2
                              size={isRightSidebarCollapsed ? 20 : 16}
                              className="text-signal"
                            />
                          ) : notif.type === "alert" ? (
                            <AlertCircle
                              size={isRightSidebarCollapsed ? 20 : 16}
                              className="text-amber-500"
                            />
                          ) : (
                            <Loader
                              size={isRightSidebarCollapsed ? 20 : 16}
                              className="text-signal animate-spin"
                            />
                          )}
                        </div>

                        <AnimatePresence mode="popLayout">
                          {!isRightSidebarCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              className="flex-1 min-w-0"
                            >
                              <p className="text-[13px] font-bold text-ink leading-tight truncate">
                                {notif.message}
                              </p>
                              <p className="text-[10px] font-medium text-ink-soft mt-1.5 uppercase tracking-wider">
                                {formatDistanceToNow(new Date(notif.time), {
                                  addSuffix: true,
                                })}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-ink/5">
              <AnimatePresence mode="popLayout">
                {!isRightSidebarCollapsed && (
                  <motion.h4
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-4 whitespace-nowrap overflow-hidden"
                  >
                    System Status
                  </motion.h4>
                )}
              </AnimatePresence>

              <div
                className={`bg-white border border-ink/10 rounded-xl shadow-sm flex items-center transition-all ${isRightSidebarCollapsed ? "p-3 justify-center aspect-square" : "p-4"}`}
              >
                <div className="shrink-0">
                  <Server
                    size={isRightSidebarCollapsed ? 20 : 16}
                    className="text-emerald-500"
                  />
                </div>
                <AnimatePresence mode="popLayout">
                  {!isRightSidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="ml-3 flex-1 min-w-0"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-ink-soft font-bold whitespace-nowrap">
                          Worker Node
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider ml-2">
                          Online
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-ink-faint whitespace-nowrap">
                        Connected
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
