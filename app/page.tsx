"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Dumbbell, Activity, TrendingUp, Flame, Zap } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function Dashboard() {
  const { data: session, isPending } = useSession();

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
    <div className="relative min-h-screen overflow-hidden bg-[#05050a]">
      {/* Dynamic Multi-Color Background */}
      <div 
        className="absolute inset-0 w-full h-full opacity-70 pointer-events-none z-0 fixed"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(79, 70, 229, 0.35) 0%, transparent 50%),
            radial-gradient(circle at 85% 85%, rgba(217, 70, 239, 0.35) 0%, transparent 50%),
            radial-gradient(circle at 85% 15%, rgba(6, 182, 212, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 15% 85%, rgba(245, 158, 11, 0.25) 0%, transparent 50%)
          `
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 max-w-5xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full text-center"
        >
          {/* Personalized Greeting */}
          {!isPending && session?.user?.name && (
            <motion.div variants={itemVariants} className="mb-4">
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium backdrop-blur-md shadow-lg">
                <span>👋</span> Hi, {session.user.name.split(' ')[0]}! Welcome back.
              </span>
            </motion.div>
          )}

          {/* Hero Section */}
          <motion.div variants={itemVariants} className="mb-8 mt-4">
            <span className="inline-block py-1 px-3 rounded-full bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300 text-sm font-bold tracking-widest mb-6 uppercase shadow-[0_0_15px_rgba(217,70,239,0.2)]">
              Redefine Your Limits
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 drop-shadow-sm">
              Track Every Rep.<br/>Break Every Record.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Your ultimate lifting companion. Log your heaviest sets, analyze your history, and build the custom routines you need to get stronger.
            </p>
          </motion.div>

          {/* Primary Call to Action */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <Link href="/workouts" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(139,92,246,0.5)] hover:shadow-[0_0_60px_rgba(139,92,246,0.7)] transition-all border border-white/10"
              >
                <Zap className="w-5 h-5 fill-current text-yellow-300" />
                Start a Workout
              </motion.button>
            </Link>
            
            <Link href="/exercises" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 glass text-white font-semibold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              >
                <Dumbbell className="w-5 h-5 text-cyan-400" />
                Manage Library
              </motion.button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all duration-300 group shadow-lg hover:shadow-indigo-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-600/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform border border-indigo-500/30">
                <Activity className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">Build Routines</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Add any exercise you can imagine. Tag them by body part, and quickly add them during your sessions.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-fuchsia-500/50 hover:bg-fuchsia-950/20 transition-all duration-300 group shadow-lg hover:shadow-fuchsia-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-pink-600/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform border border-fuchsia-500/30">
                <Flame className="w-7 h-7 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors">Log Heavy Sets</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Effortlessly record your weights and reps mid-workout. Stay focused on the lift, not the app.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-amber-500/50 hover:bg-amber-950/20 transition-all duration-300 group shadow-lg hover:shadow-amber-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform border border-amber-500/30">
                <TrendingUp className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">Track Progression</h3>
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
