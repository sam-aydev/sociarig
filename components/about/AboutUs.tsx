"use client";

import { motion, Variants } from "motion/react";
import Link from "next/link";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { Sparkles, Fingerprint, Zap, Globe2, ArrowRight } from "lucide-react";

const VALUES = [
  {
    icon: Fingerprint,
    title: "Authenticity at Scale",
    description:
      "We don't believe in generic AI slop. Sociarig is built to map, memorize, and accurately replicate your unique linguistic footprint so you never sound like a robot.",
  },
  {
    icon: Zap,
    title: "Frictionless Execution",
    description:
      "Founders should spend their time building companies, not formatting LinkedIn posts. We handle the formatting, character limits, and syntax translation instantly.",
  },
  {
    icon: Globe2,
    title: "Omnichannel Reach",
    description:
      "A great idea deserves maximum surface area. We make it effortless to distribute your core thesis across every major text-based network simultaneously.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-paper font-sans text-ink selection:bg-signal/20 relative overflow-hidden">
      <Nav />

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.08, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-signal blur-[120px] rounded-full opacity-10 translate-x-1/3 -translate-y-1/3"
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,21,27,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,21,27,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_20%,transparent_100%)]" />
      </div>

      <main className="relative z-10 pt-32 pb-16 md:pt-48 md:pb-24 px-6 max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-24 md:mb-32"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-signal/10 text-signal font-bold text-xs uppercase tracking-widest mb-6 border border-signal/20">
            <Sparkles size={14} /> Our Story
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-8 text-balance">
            We are building the autonomous engine for human creators.
          </h1>
          <p className="text-lg md:text-xl text-ink-soft leading-relaxed text-balance">
            We started Sociarig because we realized the modern founder has a scaling problem. You have brilliant insights, but packaging those insights for five different algorithms takes hours you don't have. 
          </p>
        </motion.section>

        {/* The Narrative / Editorial Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24 md:mb-40">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="md:col-span-5"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4 sticky top-32">
              Content creation shouldn't be a bottleneck for great ideas.
            </h2>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="md:col-span-7 prose prose-lg prose-p:text-ink-soft prose-p:leading-relaxed"
          >
            <p>
              In the age of algorithmic distribution, attention is the most valuable currency. But capturing that attention requires feeding the machine constantly. Many creators solve this by hiring expensive ghostwriting agencies, while others resort to generic AI tools that strip their writing of all personality.
            </p>
            <p>
              <strong>We built Sociarig to bridge that gap.</strong> 
            </p>
            <p>
              By combining vector database memory with advanced Large Language Models, we created a synthesis engine that doesn't just write <em>for</em> you—it writes <em>like</em> you. Our architecture maps your structural cadences, your favorite vocabulary, and your specific formatting quirks.
            </p>
            <p>
              The result? You write one brilliant thought, drop the link into Sociarig, and let the engine handle the distribution mechanics.
            </p>
          </motion.div>
        </section>

        {/* Values Section */}
        <section className="mb-24 md:mb-40">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-4">
              Our Core Pillars
            </h2>
            <p className="text-ink-soft text-lg max-w-xl mx-auto">
              The principles that govern our engineering and product decisions.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div 
                  key={value.title}
                  variants={itemVariants}
                  className="group p-8 rounded-[2rem] bg-white border border-ink/5 shadow-sm hover:shadow-xl hover:shadow-ink/5 hover:border-ink/10 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-paper border border-ink/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-signal/10 group-hover:text-signal transition-all duration-300">
                    <Icon size={24} className="text-ink-soft group-hover:text-signal transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-ink mb-3">{value.title}</h3>
                  <p className="text-ink-soft leading-relaxed text-sm">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* Call to Action Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative rounded-[3rem] bg-ink overflow-hidden py-20 px-6 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-signal)_0%,_transparent_60%)] opacity-20" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Ready to multiply your output?
            </h2>
            <p className="text-paper-dim/80 text-lg mb-10">
              Join the founders and creators who are already using Sociarig to scale their digital presence without sacrificing their authentic voice.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth/signup" 
                className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-black/20 transition-all flex items-center justify-center gap-2 shadow-xl shadow-signal/20 active:scale-95"
              >
                Start Repurposing Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}