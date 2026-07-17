"use client";

import { useState, useEffect } from "react";
import { Plus, Check, ArrowLeft, Search, Clock, History } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startWorkout, getExercises, addSetToWorkout, getPreviousSession, createExercise } from "@/app/actions";

const BODY_PARTS = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Cardio", "Biceps", "Triceps"];

export default function WorkoutPage() {
  const router = useRouter();
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  
  // Active state for the workout
  const [activeExercises, setActiveExercises] = useState<any[]>([]);
  
  // Modal and new exercise state
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseBodyPart, setNewExerciseBodyPart] = useState(BODY_PARTS[0]);

  // Inline search/filter state
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  const handleStartWorkout = async () => {
    const workout = await startWorkout();
    setWorkoutId(workout.id);
  };

  const handleFinishWorkout = () => {
    router.push("/");
  };

  const handleAddExerciseToWorkout = async (exercise: any) => {
    const previousSets = await getPreviousSession(exercise.id);
    
    setActiveExercises([...activeExercises, {
      ...exercise,
      sets: [],
      previousSets: previousSets || []
    }]);
    setSearch("");
  };

  const handleCreateNewExercise = async () => {
    if (!newExerciseName.trim()) return;
    const newEx = await createExercise({ name: newExerciseName, bodyPart: newExerciseBodyPart }); 
    setExercises([...exercises, newEx]);
    handleAddExerciseToWorkout(newEx);
    setIsCreatingExercise(false);
    setNewExerciseName("");
    setSearch("");
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag ? ex.bodyPart === selectedTag : true;
    // Don't show exercises already in the workout
    const notActive = !activeExercises.find(a => a.id === ex.id);
    return matchesSearch && matchesTag && notActive;
  });

  if (!workoutId) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#05050a] flex flex-col items-center justify-center p-6 text-center">
        {/* Dynamic Multi-Color Background */}
        <div 
          className="absolute inset-0 w-full h-full opacity-50 pointer-events-none z-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 15%, rgba(79, 70, 229, 0.35) 0%, transparent 50%),
              radial-gradient(circle at 85% 85%, rgba(217, 70, 239, 0.35) 0%, transparent 50%),
              radial-gradient(circle at 85% 15%, rgba(6, 182, 212, 0.25) 0%, transparent 50%),
              radial-gradient(circle at 15% 85%, rgba(245, 158, 11, 0.25) 0%, transparent 50%)
            `
          }}
        />

        <Link href="/" className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 transition z-10">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div
          className="relative z-10 animate-scale-in"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Ready to lift?</h1>
          <p className="text-gray-400 mb-8 max-w-sm">Start your session now. Track your reps, beat your records.</p>
          <button 
            onClick={handleStartWorkout}
            className="w-full max-w-xs py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20"
          >
            Start Workout
          </button>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
            Active Workout
          </h1>
          <button 
            onClick={handleFinishWorkout}
            className="text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition"
          >
            Finish
          </button>
        </div>

        <div className="space-y-6">
          {activeExercises.map((activeEx, exIndex) => (
            <div 
              key={activeEx.id}
              className="glass-card rounded-2xl overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${exIndex * 100}ms` }}
            >
              <div className="p-4 border-b border-white/5 bg-white/5">
                <h2 className="font-bold text-lg text-white">{activeEx.name}</h2>
                <span className="text-xs text-primary">{activeEx.bodyPart}</span>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Previous History Inline */}
                {activeEx.previousSets && activeEx.previousSets.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-3 mb-4 border border-white/5">
                    <div className="flex items-center text-xs text-gray-400 font-medium mb-2">
                      <History className="w-3 h-3 mr-1.5" />
                      PREVIOUS SESSION
                    </div>
                    <div className="space-y-1">
                      {activeEx.previousSets.map((prevSet: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm text-gray-300">
                          <span>Set {prevSet.setNumber}</span>
                          <span>{prevSet.weight} kg × {prevSet.reps} reps</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Sets */}
                {activeEx.sets.map((set: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-medium text-gray-400">
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-center text-white">
                      {set.weight} kg
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-center text-white">
                      {set.reps} reps
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center text-green-500">
                      <Check className="w-5 h-5" />
                    </div>
                  </div>
                ))}

                {/* Add New Set Form */}
                <AddSetForm 
                  workoutId={workoutId} 
                  exerciseId={activeEx.id} 
                  setNumber={activeEx.sets.length + 1}
                  onAdd={(newSet) => {
                    const newActive = [...activeExercises];
                    newActive[exIndex].sets.push(newSet);
                    setActiveExercises(newActive);
                  }} 
                />
              </div>
            </div>
          ))}

          {/* Inline Exercise Library */}
          <div className="mt-10 mb-6 bg-black/20 p-6 rounded-3xl border border-white/5">
            <h2 className="text-xl font-bold text-white mb-4">Add from Library</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search exercises..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-input rounded-xl pl-10 pr-4 py-3 text-white border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              <button 
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition ${!selectedTag ? 'bg-primary text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
              >
                All
              </button>
              {BODY_PARTS.map(part => (
                <button 
                  key={part}
                  onClick={() => setSelectedTag(part)}
                  className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition ${selectedTag === part ? 'bg-primary text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  {part}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {filteredExercises.map(ex => (
                <button 
                  key={ex.id}
                  onClick={() => handleAddExerciseToWorkout(ex)}
                  className="w-full text-left p-4 rounded-xl glass border border-white/5 hover:border-primary/30 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="font-medium text-white">{ex.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{ex.bodyPart}</div>
                  </div>
                  <Plus className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
              
              {search && filteredExercises.length === 0 && (
                <div className="text-center py-8 text-gray-400 glass rounded-2xl border border-white/5">
                  <p className="mb-4">Exercise not found.</p>
                  <button 
                    onClick={() => {
                      setNewExerciseName(search);
                      setNewExerciseBodyPart(selectedTag || BODY_PARTS[0]);
                      setIsCreatingExercise(true);
                    }}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/20 inline-flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Exercise
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create New Exercise Modal */}
        {isCreatingExercise && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="glass-card w-full max-w-md rounded-2xl p-6 animate-scale-in">
              <h2 className="text-2xl font-bold mb-4">Create New Exercise</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Exercise Name</label>
                  <input 
                    type="text" 
                    value={newExerciseName}
                    onChange={e => setNewExerciseName(e.target.value)}
                    className="w-full bg-input rounded-xl px-4 py-3 text-white border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="e.g. Bench Press"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Body Part</label>
                  <select 
                    value={newExerciseBodyPart}
                    onChange={e => setNewExerciseBodyPart(e.target.value)}
                    className="w-full bg-input rounded-xl px-4 py-3 text-white border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
                  >
                    {BODY_PARTS.map(part => (
                      <option key={part} value={part}>{part}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setIsCreatingExercise(false)}
                    className="flex-1 py-3 rounded-xl font-medium text-gray-300 hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateNewExercise}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/20"
                  >
                    Save & Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponent for adding a set inline
function AddSetForm({ workoutId, exerciseId, setNumber, onAdd }: { workoutId: string, exerciseId: string, setNumber: number, onAdd: (set: any) => void }) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!weight || !reps) return;
    setIsLoading(true);
    const newSet = await addSetToWorkout(workoutId, exerciseId, setNumber, parseFloat(weight), parseInt(reps));
    onAdd(newSet);
    // Keep weight, clear reps for next set
    setReps("");
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-white">
        {setNumber}
      </div>
      <div className="flex-1 relative">
        <input 
          type="number" 
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="kg"
          className="w-full bg-input border border-white/10 rounded-xl px-4 py-2 text-center text-white focus:border-primary outline-none"
        />
      </div>
      <div className="flex-1 relative">
        <input 
          type="number" 
          value={reps}
          onChange={e => setReps(e.target.value)}
          placeholder="reps"
          className="w-full bg-input border border-white/10 rounded-xl px-4 py-2 text-center text-white focus:border-primary outline-none"
        />
      </div>
      <button 
        onClick={handleAdd}
        disabled={!weight || !reps || isLoading}
        className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
