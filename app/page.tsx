"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Dumbbell, Play, Activity, TrendingUp, Flame, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 max-w-5xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full text-center"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wider mb-6">
              REDEFINE YOUR LIMITS
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
              Track Every Rep.<br/>Break Every Record.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
              Your ultimate lifting companion. Log your heaviest sets, analyze your history, and build the custom routines you need to get stronger.
            </p>
          </motion.div>

          {/* Primary Call to Action */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/workouts" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                Start a Workout
              </motion.button>
            </Link>
            
            <Link href="/exercises" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 glass text-white font-semibold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-white/10"
              >
                <Dumbbell className="w-5 h-5 text-gray-300" />
                Manage Library
              </motion.button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Build Custom Routines</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Add any exercise you can imagine. Tag them by body part, and quickly add them during your sessions.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-accent/30 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Log Heavy Sets</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Effortlessly record your weights and reps mid-workout. Stay focused on the lift, not the app.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-green-500/30 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Track Progression</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                View your complete exercise history at a glance. See your past performance to beat it today.
              </p>
            </div>

          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
