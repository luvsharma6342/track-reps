"use client";

import Link from "next/link";
import { Dumbbell, Activity, TrendingUp, Flame, Zap, Calendar, Play, Scale, ClipboardList } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { getActiveWorkout } from "@/app/actions";

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const [hasActiveWorkout, setHasActiveWorkout] = useState(false);

  useEffect(() => {
    getActiveWorkout().then(workout => {
      setHasActiveWorkout(!!workout);
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Dynamic Multi-Color Background */}
      <div 
        className="absolute inset-0 w-full h-full opacity-70 pointer-events-none z-0 fixed"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 85% 85%, rgba(14, 165, 233, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.25) 0%, transparent 50%)
          `
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 max-w-5xl mx-auto">
        <div className="w-full text-center">
          {/* Personalized Greeting */}
          {!isPending && session?.user?.name && (
            <div className="mb-4 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-muted border border-border text-foreground text-sm font-medium backdrop-blur-md shadow-lg">
                <span>👋</span> Hi, {session.user.name.split(' ')[0]}! Welcome back.
              </span>
            </div>
          )}

          {/* Hero Section */}
          <div className="mb-8 mt-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <span className="inline-block py-1 px-3 rounded-full bg-gradient-to-r from-blue-100 to-sky-100 dark:from-blue-500/20 dark:to-sky-500/20 border border-blue-200 dark:border-sky-500/30 text-[#1E90FF] text-sm font-bold tracking-widest mb-6 uppercase shadow-[0_0_15px_rgba(14,165,233,0.1)] dark:shadow-[0_0_15px_rgba(14,165,233,0.2)]">
              Redefine Your Limits
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 drop-shadow-sm">
              Track Every Rep.<br/>Break Every Record.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Your ultimate lifting companion. Log your heaviest sets, analyze your history, and build the custom routines you need to get stronger.
            </p>
          </div>

          {/* Primary Call to Action */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mb-24 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Link href={session ? "/workouts" : "/login"} className="w-full sm:w-auto">
              {hasActiveWorkout ? (
                <button 
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(14,165,233,0.5)] hover:shadow-[0_0_60px_rgba(14,165,233,0.7)] transition-all border border-white/10 hover:scale-105 active:scale-95 animate-pulse"
                >
                  <Play className="w-5 h-5 fill-current text-white" />
                  Resume Workout
                </button>
              ) : (
                <button 
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_rgba(37,99,235,0.7)] transition-all border border-white/10 hover:scale-105 active:scale-95"
                >
                  <Zap className="w-5 h-5 fill-current text-sky-300" />
                  Start a Workout
                </button>
              )}
            </Link>
            
            <Link href={session ? "/routines" : "/login"} className="w-full sm:w-auto">
              <button 
                className="w-full sm:w-auto px-8 py-4 glass text-foreground font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:bg-muted hover:scale-105 active:scale-95"
              >
                <ClipboardList className="w-5 h-5 text-purple-500" />
                Templates
              </button>
            </Link>
            <Link href={session ? "/exercises" : "/login"} className="w-full sm:w-auto">
              <button 
                className="w-full sm:w-auto px-8 py-4 glass text-foreground font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-muted hover:scale-105 active:scale-95"
              >
                <Dumbbell className="w-5 h-5 text-cyan-500" />
                Manage Library
              </button>
            </Link>

            <Link href={session ? "/today" : "/login"} className="w-full sm:w-auto">
              <button 
                className="w-full sm:w-auto px-8 py-4 glass text-foreground font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:bg-muted hover:scale-105 active:scale-95"
              >
                <Calendar className="w-5 h-5 text-emerald-500" />
                Today's Session
              </button>
            </Link>

            <Link href={session ? "/metrics" : "/login"} className="w-full sm:w-auto">
              <button 
                className="w-full sm:w-auto px-8 py-4 glass text-foreground font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all hover:border-teal-400/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:bg-muted hover:scale-105 active:scale-95"
              >
                <Scale className="w-5 h-5 text-teal-500" />
                Body Metrics
              </button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                       <div className="glass-card p-6 rounded-3xl hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 group shadow-lg hover:shadow-blue-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-sky-600/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform border border-blue-500/30">
                <Activity className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-500 transition-colors">Build Routines</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Add any exercise you can imagine. Tag them by body part, and quickly add them during your sessions.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl hover:border-sky-500/50 hover:bg-sky-500/10 transition-all duration-300 group shadow-lg hover:shadow-sky-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-600/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform border border-sky-500/30">
                <Flame className="w-7 h-7 text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-sky-500 transition-colors">Log Heavy Sets</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Effortlessly record your weights and reps mid-workout. Stay focused on the lift, not the app.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300 group shadow-lg hover:shadow-cyan-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-600/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform border border-cyan-500/30">
                <TrendingUp className="w-7 h-7 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-cyan-500 transition-colors">Track Progression</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                View your complete exercise history at a glance. See your past performance to beat it today.
              </p>
            </div>   </div>

          {/* Footer */}
          <div className="mt-24 pt-8 pb-4 border-t border-border flex flex-col items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <p className="text-muted-foreground text-sm">
              Designed and Built by <span className="text-foreground font-medium">Luv Sharma</span>
            </p>
            <a href="mailto:luvsharma105@gmail.com" className="text-muted-foreground text-xs hover:text-primary transition-colors">
              luvsharma105@gmail.com
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
