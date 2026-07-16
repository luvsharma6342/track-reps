"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Dumbbell, Play } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <h1 className="text-4xl font-bold mb-4 tracking-tight">TrackReps</h1>
        <p className="text-gray-400 mb-12">Log your sets. See your progress. Get stronger.</p>

        <div className="space-y-4">
          <Link href="/workouts" className="block">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass p-6 rounded-2xl flex items-center justify-between cursor-pointer border border-primary/20 bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Play className="text-primary w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-white">Start a Workout</h2>
                  <p className="text-sm text-gray-400">Log a new session</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/exercises" className="block">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass p-6 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/5 rounded-full">
                  <Dumbbell className="text-gray-300 w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-white">Manage Exercises</h2>
                  <p className="text-sm text-gray-400">Build your custom library</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
