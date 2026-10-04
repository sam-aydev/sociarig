"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-paper text-ink-soft relative overflow-hidden pt-20 pb-12 border-t border-ink/10">
      {/* Ambient footer glow - slightly lower opacity for light background */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[300px] bg-[radial-gradient(ellipse_at_bottom,_var(--color-signal)_0%,_transparent_70%)] opacity-[0.05] pointer-events-none" />

      <div className="max-w-[var(--container-content)] mx-auto px-6 md:px-10 relative z-10">
        {/* Top Grid Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-ink/10"
        >
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="size-9 md:size-12 rounded-full bg-linear-to-tr from-green-700 to-signal flex items-center justify-center shadow-lg shadow-signal/20">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 17C4 17 8 7 16 7"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeOpacity="0.4"
                  ></path>
                  <path
                    d="M8 21C8 21 12 11 20 11"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  ></path>
                  <circle cx="20" cy="11" r="2" fill="#FFFFFF"></circle>
                </svg>
              </div>
              <span className="font-display text-lg text-ink font-medium tracking-wide">
                Sociarig
              </span>
            </div>
            <p className="text-sm text-ink-soft max-w-sm leading-relaxed">
              The automated AI content syndication pipeline that transforms a
              single video into a month of authentic, voice-matched social
              assets.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-green-700 transition-colors font-medium"
                >
                  How it works
                </a>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-green-700 transition-colors font-medium"
                >
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signup"
                  className="hover:text-green-700 transition-colors font-medium"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Socials Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Connect & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-green-700 transition-colors flex items-center gap-1.5 font-medium"
                >
                  Twitter / X <span className="text-xs text-signal">↗</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-green-700 transition-colors font-medium"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-green-700 transition-colors font-medium"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-soft">
          <p>
            © {new Date().getFullYear()} Sociarig Engine. All rights reserved.
          </p>
          <div className="flex items-center gap-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-900 animate-pulse" />
            <span>Systems fully operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
