"use client";

import { useEffect, useState } from "react";
import { getTodaysWorkouts, updateSet, deleteSet, deleteTodaysExerciseSets } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft, Calendar, Dumbbell, Check, Edit2, X, Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function TodaysSessionPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom states for Delete Modal and Toasts
  const [deleteConf, setDeleteConf] = useState<{ type: 'exercise' | 'set', id: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchWorkouts = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    getTodaysWorkouts(start.toISOString(), end.toISOString()).then(data => {
      setWorkouts(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const confirmDelete = async () => {
    if (!deleteConf) return;
    setIsDeleting(true);
    
    if (deleteConf.type === 'exercise') {
      await deleteTodaysExerciseSets(deleteConf.id);
      showToast("Exercise deleted");
    } else {
      await deleteSet(deleteConf.id);
      showToast("Set deleted");
    }
    setDeleteConf(null);
    setIsDeleting(false);
    fetchWorkouts();
  };

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
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 font-medium flex items-center gap-2 animate-fade-in-up">
          <Check className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f0f16] border border-white/10 p-6 rounded-3xl max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Delete {deleteConf.type === 'exercise' ? 'Exercise' : 'Set'}?
            </h2>
            <p className="text-gray-400 mb-6">
              {deleteConf.type === 'exercise' 
                ? "Are you sure you want to delete this exercise and all its sets from today's session? This cannot be undone."
                : "Are you sure you want to delete this set? This cannot be undone."}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConf(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
                      {activeEx.sets.length} Sets Completed
                    </div>
                    <button 
                      onClick={() => setDeleteConf({ type: 'exercise', id: activeEx.exercise.id })}
                      className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-500/20 bg-red-500/10 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Current Sets */}
                  {activeEx.sets.map((set: any, i: number) => (
                    <SetRow 
                      key={set.id} 
                      set={set} 
                      index={i} 
                      onSave={fetchWorkouts} 
                      onDelete={() => setDeleteConf({ type: 'set', id: set.id })}
                    />
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

function SetRow({ set, index, onSave, onDelete }: { set: any, index: number, onSave: () => void, onDelete: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(set.weight.toString());
  const [reps, setReps] = useState(set.reps.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateSet(set.id, parseFloat(weight), parseInt(reps));
    setIsEditing(false);
    setIsSaving(false);
    onSave();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-medium text-gray-400 shrink-0">
          {set.isDropSet ? <span className="text-orange-500 font-bold text-xs">D</span> : (index + 1)}
        </div>
        <div className="flex-1 relative">
          <input 
            type="number" 
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-full bg-input border border-primary/50 rounded-xl px-4 py-2 text-center text-white focus:border-primary outline-none"
            placeholder="kg"
            autoFocus
          />
        </div>
        <div className="flex-1 relative">
          <input 
            type="number" 
            value={reps}
            onChange={e => setReps(e.target.value)}
            className="w-full bg-input border border-primary/50 rounded-xl px-4 py-2 text-center text-white focus:border-primary outline-none"
            placeholder="reps"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-8 h-8 flex items-center justify-center text-emerald-400 bg-emerald-400/10 rounded-xl hover:bg-emerald-400/20 transition disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setIsEditing(false);
              setWeight(set.weight.toString());
              setReps(set.reps.toString());
            }}
            disabled={isSaving}
            className="w-8 h-8 flex items-center justify-center text-red-400 bg-red-400/10 rounded-xl hover:bg-red-400/20 transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 group">
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-medium text-gray-400 shrink-0">
        {set.isDropSet ? <span className="text-orange-500 font-bold text-xs">D</span> : (index + 1)}
      </div>
      <div className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-center text-white transition group-hover:bg-white/10">
        {set.weight} kg
      </div>
      <div className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-center text-white transition group-hover:bg-white/10">
        {set.reps} reps
      </div>
      <div className="flex items-center gap-2 shrink-0 opacity-50 group-hover:opacity-100 transition">
        <button 
          onClick={() => setIsEditing(true)}
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white bg-white/5 rounded-xl transition"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/30 rounded-xl transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
