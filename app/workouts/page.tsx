"use client";

import { useState, useEffect } from "react";
import { Plus, Check, ArrowLeft, Search, Clock, History, Loader2, Trash2, Edit2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startWorkout, getExercises, addSetToWorkout, getPreviousSession, createExercise, removeExerciseFromWorkout, updateSet, deleteSet, getActiveWorkout, finishWorkout, addExerciseToWorkout } from "@/app/actions";
import { useSession } from "@/lib/auth-client";

const BODY_PARTS = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Cardio", "Biceps", "Triceps"];

export default function WorkoutPage() {
  const { data: session, isPending: isAuthPending } = useSession();
  const router = useRouter();
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [exercises, setExercises] = useState<any[]>([]);
  
  // Active state for the workout
  const [activeExercises, setActiveExercises] = useState<any[]>([]);
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null);
  const [addingExerciseId, setAddingExerciseId] = useState<string | null>(null);
  
  // Modal and new exercise state
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseBodyPart, setNewExerciseBodyPart] = useState(BODY_PARTS[0]);

  // Inline search/filter state
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    getExercises().then(setExercises);
    getActiveWorkout().then(async active => {
      if (active) {
        setWorkoutId(active.id);
        const reconstructed: any[] = [];
        
        if (active.workoutExercises && active.workoutExercises.length > 0) {
          for (const we of active.workoutExercises) {
            const exSets = active.sets.filter((s: any) => s.exerciseId === we.exerciseId);
            reconstructed.push({
              ...we.exercise,
              sets: exSets
            });
          }
        } else {
          // Fallback for workouts that predated WorkoutExercise
          const grouped = new Map();
          for (const set of active.sets) {
             if (!grouped.has(set.exerciseId)) {
               grouped.set(set.exerciseId, {
                 ...set.exercise,
                 sets: [],
               });
             }
             grouped.get(set.exerciseId).sets.push(set);
          }
          reconstructed.push(...Array.from(grouped.values()));
        }

        for (const ex of reconstructed) {
          const prev = await getPreviousSession(ex.id);
          ex.previousSets = prev || [];
        }
        setActiveExercises(reconstructed);
      }
      setIsInitializing(false);
    });
  }, []);

  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/login");
    }
  }, [session, isAuthPending, router]);

  if (isAuthPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const handleStartWorkout = async () => {
    setIsStarting(true);
    const workout = await startWorkout();
    setWorkoutId(workout.id);
    setIsStarting(false);
  };

  const handleAddExercise = async (exercise: any) => {
    setAddingExerciseId(exercise.id);
    if (workoutId) {
      await addExerciseToWorkout(workoutId, exercise.id);
    }
    const previousSets = await getPreviousSession(exercise.id);
    setActiveExercises([...activeExercises, { ...exercise, sets: [], previousSets: previousSets || [] }]);
    setSearch("");
    setAddingExerciseId(null);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    setDeletingExerciseId(exerciseId);
    if (workoutId) {
      await removeExerciseFromWorkout(workoutId, exerciseId);
    }
    setActiveExercises(activeExercises.filter((e) => e.id !== exerciseId));
    setDeletingExerciseId(null);
  };

  const handleFinishWorkout = async () => {
    setIsFinishing(true);
    if (workoutId) {
      await finishWorkout(workoutId);
    }
    router.push("/");
  };

  const handleCreateNewExercise = async () => {
    if (!newExerciseName.trim()) return;
    const newEx = await createExercise({ name: newExerciseName, bodyPart: newExerciseBodyPart }); 
    setExercises([...exercises, newEx]);
    handleAddExercise(newEx);
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

  if (isInitializing) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background flex flex-col items-center justify-center p-6 text-center">
         <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
         <p className="text-muted-foreground font-medium">Loading session...</p>
      </div>
    );
  }

  if (!workoutId) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background flex flex-col items-center justify-center p-6 text-center">
        {/* Dynamic Multi-Color Background */}
        <div 
          className="absolute inset-0 w-full h-full opacity-50 pointer-events-none z-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 85% 85%, rgba(14, 165, 233, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.25) 0%, transparent 50%),
              radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.25) 0%, transparent 50%)
            `
          }}
        />

        <Link href="/" className="absolute top-6 left-6 p-2 rounded-full hover:bg-muted transition z-10">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div
          className="relative z-10 animate-scale-in"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Ready to lift?</h1>
          <p className="text-muted-foreground mb-8 max-w-sm">Start your session now. Track your reps, beat your records.</p>
          <button 
            onClick={handleStartWorkout}
            disabled={isStarting}
            className="w-full max-w-xs py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-70 flex items-center justify-center"
          >
            {isStarting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Start Workout"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Dynamic Multi-Color Background */}
      <div 
        className="absolute inset-0 w-full h-full opacity-50 pointer-events-none z-0 fixed"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 85% 85%, rgba(14, 165, 233, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 15% 85%, rgba(6, 182, 212, 0.25) 0%, transparent 50%)
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
            disabled={isFinishing}
            className="text-sm font-semibold bg-muted hover:bg-secondary px-4 py-2 rounded-full transition flex items-center gap-2 disabled:opacity-50"
          >
            {isFinishing && <Loader2 className="w-4 h-4 animate-spin" />}
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
              <div className="p-4 border-b border-border bg-muted flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-foreground">{activeEx.name}</h2>
                  <span className="text-xs text-primary">{activeEx.bodyPart}</span>
                </div>
                <button 
                  onClick={() => handleDeleteExercise(activeEx.id)}
                  disabled={deletingExerciseId === activeEx.id}
                  className="w-8 h-8 flex items-center justify-center text-destructive hover:bg-destructive/20 bg-destructive/10 rounded-xl transition disabled:opacity-50"
                  title="Remove Exercise"
                >
                  {deletingExerciseId === activeEx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Previous History Inline */}
                {activeEx.previousSets && activeEx.previousSets.length > 0 && (
                  <div className="bg-muted rounded-xl p-3 mb-4 border border-border">
                    <div className="flex items-center text-xs text-muted-foreground font-medium mb-2">
                      <History className="w-3 h-3 mr-1.5" />
                      PREVIOUS SESSION
                    </div>
                    <div className="space-y-1">
                      {activeEx.previousSets.map((prevSet: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm text-muted-foreground">
                          <span>Set {prevSet.setNumber}</span>
                          <span>{prevSet.weight} kg × {prevSet.reps} reps</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Sets */}
                {activeEx.sets.map((set: any, i: number) => (
                  <WorkoutSetRow
                    key={set.id}
                    set={set}
                    index={i}
                    onSave={(updatedSet) => {
                      const newActive = [...activeExercises];
                      newActive[exIndex].sets[i] = updatedSet;
                      setActiveExercises(newActive);
                    }}
                    onDelete={() => {
                      const newActive = [...activeExercises];
                      newActive[exIndex].sets.splice(i, 1);
                      setActiveExercises(newActive);
                    }}
                  />
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
          <div className="mt-10 mb-6 bg-secondary p-6 rounded-3xl border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">Add from Library</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search exercises..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-input rounded-xl pl-10 pr-4 py-3 text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              <button 
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition ${!selectedTag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}
              >
                All
              </button>
              {BODY_PARTS.map(part => (
                <button 
                  key={part}
                  onClick={() => setSelectedTag(part)}
                  className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition ${selectedTag === part ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}
                >
                  {part}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {filteredExercises.map(ex => (
                <button 
                  key={ex.id}
                  onClick={() => handleAddExercise(ex)}
                  disabled={addingExerciseId === ex.id}
                  className="w-full text-left p-4 rounded-xl glass border-border hover:border-primary/30 transition flex items-center justify-between group disabled:opacity-50"
                >
                  <div>
                    <div className="font-medium text-foreground">{ex.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{ex.bodyPart}</div>
                  </div>
                  {addingExerciseId === ex.id ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition" />
                  )}
                </button>
              ))}
              
              {search && filteredExercises.length === 0 && (
                <div className="text-center py-8 text-muted-foreground glass rounded-2xl border-border">
                  <p className="mb-4">Exercise not found.</p>
                  <button 
                    onClick={() => {
                      setNewExerciseName(search);
                      setNewExerciseBodyPart(selectedTag || BODY_PARTS[0]);
                      setIsCreatingExercise(true);
                    }}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/20 inline-flex items-center"
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
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Exercise Name</label>
                  <input 
                    type="text" 
                    value={newExerciseName}
                    onChange={e => setNewExerciseName(e.target.value)}
                    className="w-full bg-input rounded-xl px-4 py-3 text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="e.g. Bench Press"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Body Part</label>
                  <select 
                    value={newExerciseBodyPart}
                    onChange={e => setNewExerciseBodyPart(e.target.value)}
                    className="w-full bg-input rounded-xl px-4 py-3 text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
                  >
                    {BODY_PARTS.map(part => (
                      <option key={part} value={part}>{part}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setIsCreatingExercise(false)}
                    className="flex-1 py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreateNewExercise}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/20"
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
  const [isDropSet, setIsDropSet] = useState(false);

  const handleAdd = async () => {
    if (!weight || !reps) return;
    setIsLoading(true);
    const newSet = await addSetToWorkout(workoutId, exerciseId, setNumber, parseFloat(weight), parseInt(reps), isDropSet);
    onAdd(newSet);
    // Keep weight, clear reps for next set
    setReps("");
    setIsDropSet(false);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
        {setNumber}
      </div>
      <div className="flex-1 relative">
        <input 
          type="number" 
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="kg"
          className="w-full bg-input border border-border rounded-xl px-4 py-2 text-center text-foreground focus:border-primary outline-none"
        />
      </div>
      <div className="flex-1 relative">
        <input 
          type="number" 
          value={reps}
          onChange={e => setReps(e.target.value)}
          placeholder="reps"
          className="w-full bg-input border border-border rounded-xl px-4 py-2 text-center text-foreground focus:border-primary outline-none"
        />
      </div>
      <button 
        onClick={() => setIsDropSet(!isDropSet)}
        className={`w-8 h-8 flex items-center justify-center rounded-xl font-bold text-xs transition border border-border ${isDropSet ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}
        title="Mark as Drop Set"
      >
        D
      </button>
      <button 
        onClick={handleAdd}
        disabled={!weight || !reps || isLoading}
        className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 transition"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
      </button>
    </div>
  );
}

// Subcomponent for displaying and editing an active set
function WorkoutSetRow({ set, index, onSave, onDelete }: { set: any, index: number, onSave: (updatedSet: any) => void, onDelete: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [weight, setWeight] = useState(set.weight.toString());
  const [reps, setReps] = useState(set.reps.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateSet(set.id, parseFloat(weight), parseInt(reps));
    setIsEditing(false);
    setIsSaving(false);
    onSave({ ...set, weight: parseFloat(weight), reps: parseInt(reps) });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteSet(set.id);
    onDelete();
    setIsDeleting(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
          {set.isDropSet ? <span className="text-orange-500 font-bold text-xs">D</span> : (index + 1)}
        </div>
        <div className="flex-1 relative">
          <input 
            type="number" 
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-full bg-input border border-primary/50 rounded-xl px-4 py-2 text-center text-foreground focus:border-primary outline-none"
            placeholder="kg"
            autoFocus
          />
        </div>
        <div className="flex-1 relative">
          <input 
            type="number" 
            value={reps}
            onChange={e => setReps(e.target.value)}
            className="w-full bg-input border border-primary/50 rounded-xl px-4 py-2 text-center text-foreground focus:border-primary outline-none"
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
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
        {set.isDropSet ? <span className="text-orange-500 font-bold text-xs">D</span> : (index + 1)}
      </div>
      <div className="flex-1 bg-muted rounded-xl px-4 py-2 text-center text-foreground transition group-hover:bg-secondary">
        {set.weight} kg
      </div>
      <div className="flex-1 bg-muted rounded-xl px-4 py-2 text-center text-foreground transition group-hover:bg-secondary">
        {set.reps} reps
      </div>
      <div className="flex items-center gap-2 shrink-0 opacity-50 group-hover:opacity-100 transition">
        <button 
          onClick={() => setIsEditing(true)}
          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground bg-muted rounded-xl transition"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-8 h-8 flex items-center justify-center text-destructive hover:text-white bg-destructive/10 hover:bg-destructive/30 rounded-xl transition disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
