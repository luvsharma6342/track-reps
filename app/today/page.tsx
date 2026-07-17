"use client";

import { useEffect, useState } from "react";
import { getTodaysWorkouts } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft, Calendar, Dumbbell, Check } from "lucide-react";

export default function TodaysSessionPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTodaysWorkouts().then(data => {
      setWorkouts(data);
      setIsLoading(false);
    });
  }, []);

  // Aggregate exercises from all of today's workouts
  const exerciseMap = new Map<string, any>();

  workouts.forEach(workout => {
    workout.sets.forEach((set: any) => {
      const exId = set.exercise.id;
      if (!exerciseMap.has(exId)) {
        exerciseMap.set(exId, {
          exercise: set.exercise,
          sets: []
        });
      }
      exerciseMap.get(exId).sets.push(set);
    });
  });

  const activeExercises = Array.from(exerciseMap.values());

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05050a]">
      {/* Dynamic Multi-Color Background */}
      <div 
        className="absolute inset-0 w-full h-full opacity-50 pointer-events-none z-0 fixed"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(79, 70, 229, 0.35) 0%, transparent 50%),
            radial-gradient(circle at 85% 85%, rgba(217, 70, 239, 0.35) 0%, transparent 50%),
            radial-gradient(circle at 85% 15%, rgba(6, 182, 212, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 15% 85%, rgba(245, 158, 11, 0.25) 0%, transparent 50%)
          `
        }}
      />

      <div className="relative z-10 min-h-screen p-6 max-w-2xl mx-auto pb-24">
        <div className="flex items-center mb-8">
          <Link href="/" className="p-2 rounded-full hover:bg-white/10 transition mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-emerald-400" />
            Today's Session
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : activeExercises.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 glass-card">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No workouts logged today yet</h2>
            <p className="text-gray-400 mb-8">Start a workout to see your progress here.</p>
            <Link href="/workouts">
              <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                Start a Workout
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {activeExercises.map((activeEx, exIndex) => (
              <div 
                key={activeEx.exercise.id}
                className="glass-card rounded-2xl overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${exIndex * 100}ms` }}
              >
                <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-white">{activeEx.exercise.name}</h2>
                    <span className="text-xs text-primary">{activeEx.exercise.bodyPart}</span>
                  </div>
                  <div className="text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                    {activeEx.sets.length} Sets Completed
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Current Sets */}
                  {activeEx.sets.map((set: any, i: number) => (
                    <div key={set.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-medium text-gray-400">
                        {i + 1}
                      </div>
                      <div className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-center text-white">
                        {set.weight} kg
                      </div>
                      <div className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-center text-white">
                        {set.reps} reps
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center text-emerald-500">
                        <Check className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
