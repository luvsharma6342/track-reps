"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Play, Search, Loader2, Dumbbell, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { getTemplates, createTemplate, deleteTemplate, startWorkoutFromTemplate, getExercises } from "@/app/actions";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export default function RoutinesPage() {
  const { data: session, isPending: isAuthPending } = useSession();
  const router = useRouter();
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [startingTemplateId, setStartingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/login");
    } else if (session) {
      Promise.all([getTemplates(), getExercises()]).then(([t, e]) => {
        setTemplates(t);
        setExercises(e);
        setIsLoading(false);
      });
    }
  }, [session, isAuthPending, router]);

  if (isAuthPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newTemplateName.trim() || selectedExerciseIds.length === 0) return;
    setIsSubmitting(true);
    await createTemplate(newTemplateName, selectedExerciseIds);
    setTemplates(await getTemplates());
    setIsCreating(false);
    setNewTemplateName("");
    setSelectedExerciseIds([]);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this routine?")) {
      await deleteTemplate(id);
      setTemplates(await getTemplates());
    }
  };

  const handleStart = async (id: string) => {
    setStartingTemplateId(id);
    await startWorkoutFromTemplate(id);
    router.push("/workouts");
  };

  const toggleExerciseSelection = (id: string) => {
    setSelectedExerciseIds(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Routines
          </h1>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        
        {templates.length === 0 && !isCreating ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
            <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No Routines Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create a template to quickly start your favorite workouts with pre-loaded exercises.</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-sm"
            >
              Create Routine
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {templates.map(template => (
              <div key={template.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex flex-col hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{template.name}</h3>
                  <button 
                    onClick={() => handleDelete(template.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">{template.exercises.length} Exercises</p>
                  <ul className="text-sm space-y-1 text-card-foreground line-clamp-3">
                    {template.exercises.map((te: any) => (
                      <li key={te.id}>• {te.exercise.name}</li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={() => handleStart(template.id)}
                  disabled={startingTemplateId === template.id}
                  className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {startingTemplateId === template.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" /> Start Routine
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Nav Spacer */}
        <div className="h-20" />
      </main>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex-1 container max-w-2xl mx-auto flex flex-col p-4 pt-10 h-full">
            <h2 className="text-2xl font-bold mb-6">New Routine</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Routine Name</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="e.g. Push Day"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full bg-muted border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-3 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <label className="block text-sm font-medium text-muted-foreground mb-3">Select Exercises</label>
              <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {exercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => toggleExerciseSelection(exercise.id)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-colors ${
                      selectedExerciseIds.includes(exercise.id) 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-card border-border hover:border-primary/50 text-card-foreground"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{exercise.name}</div>
                      <div className="text-xs opacity-70">{exercise.bodyPart}</div>
                    </div>
                    {selectedExerciseIds.includes(exercise.id) && (
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <span className="text-xs font-bold">{selectedExerciseIds.indexOf(exercise.id) + 1}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3 mt-auto pb-8">
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80 py-4 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newTemplateName.trim() || selectedExerciseIds.length === 0 || isSubmitting}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none flex justify-center"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Routine"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
