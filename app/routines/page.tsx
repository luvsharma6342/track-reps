"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Play, Search, Loader2, Dumbbell, ClipboardList, Check, X, Edit2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, startWorkoutFromTemplate, getExercises, createExercise } from "@/app/actions";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

const BODY_PARTS = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Cardio", "Biceps", "Triceps"];

export default function RoutinesPage() {
  const { data: session, isPending: isAuthPending } = useSession();
  const router = useRouter();
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [startingTemplateId, setStartingTemplateId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const [isCreatingCustomExercise, setIsCreatingCustomExercise] = useState(false);
  const [newCustomExerciseName, setNewCustomExerciseName] = useState("");
  const [newCustomExerciseBodyPart, setNewCustomExerciseBodyPart] = useState(BODY_PARTS[0]);
  const [isSubmittingExercise, setIsSubmittingExercise] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredExercises = selectedTag 
    ? exercises.filter(ex => ex.bodyPart === selectedTag)
    : exercises;

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

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim() || selectedExerciseIds.length === 0) return;
    setIsSubmitting(true);
    if (editingTemplateId) {
      await updateTemplate(editingTemplateId, newTemplateName, selectedExerciseIds);
    } else {
      await createTemplate(newTemplateName, selectedExerciseIds);
    }
    setTemplates(await getTemplates());
    setIsCreating(false);
    setEditingTemplateId(null);
    setNewTemplateName("");
    setSelectedExerciseIds([]);
    setIsSubmitting(false);
  };

  const openEditModal = (template: any) => {
    setNewTemplateName(template.name);
    setSelectedExerciseIds(template.exercises.map((te: any) => te.exerciseId));
    setEditingTemplateId(template.id);
    setIsCreating(true);
  };

  const closeMenu = () => {
    setIsCreating(false);
    setEditingTemplateId(null);
    setNewTemplateName("");
    setSelectedExerciseIds([]);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
    setTemplates(await getTemplates());
    setConfirmDeleteId(null);
  };

  const handleCreateCustomExercise = async () => {
    if (!newCustomExerciseName.trim()) return;
    setIsSubmittingExercise(true);
    const newEx = await createExercise({
      name: newCustomExerciseName,
      bodyPart: newCustomExerciseBodyPart
    });
    const allExercises = await getExercises();
    setExercises(allExercises);
    setSelectedExerciseIds([...selectedExerciseIds, newEx.id]);
    setIsCreatingCustomExercise(false);
    setNewCustomExerciseName("");
    setNewCustomExerciseBodyPart(BODY_PARTS[0]);
    setIsSubmittingExercise(false);
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
    <div className="relative min-h-screen bg-background text-foreground pb-24">
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

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="mr-2 p-2 rounded-full hover:bg-muted transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-primary" />
              Routines
            </h1>
          </div>
          <button 
            onClick={() => {
              closeMenu();
              setIsCreating(true);
            }}
            className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </header>

      <main className="relative z-10 container max-w-4xl mx-auto px-4 py-8">
        
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
              <div key={template.id} className="glass rounded-2xl p-5 border border-border shadow-sm flex flex-col hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{template.name}</h3>
                  {confirmDeleteId === template.id ? (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleDelete(template.id)}
                        className="w-8 h-8 flex items-center justify-center text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        title="Confirm Delete"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground bg-muted hover:bg-secondary rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditModal(template)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(template.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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

      {/* Create / Edit Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex-1 container max-w-2xl mx-auto flex flex-col p-4 pt-10 h-full">
            <h2 className="text-2xl font-bold mb-6">{editingTemplateId ? "Edit Routine" : "New Routine"}</h2>
            
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
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-muted-foreground">Select Exercises</label>
              </div>

              {/* Tag Filters */}
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

              <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {/* Custom Exercise inline button/form moved to top */}
                {!isCreatingCustomExercise ? (
                  <button
                    onClick={() => setIsCreatingCustomExercise(true)}
                    className="w-full p-4 mb-2 border border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Create Custom Exercise
                  </button>
                ) : (
                  <div className="p-4 mb-2 border border-border rounded-xl bg-muted/30 space-y-3">
                    <input 
                      type="text" 
                      placeholder="Exercise Name"
                      value={newCustomExerciseName}
                      onChange={e => setNewCustomExerciseName(e.target.value)}
                      className="w-full bg-input rounded-xl px-4 py-2 text-foreground border border-border focus:border-primary outline-none"
                      autoFocus
                    />
                    <select 
                      value={newCustomExerciseBodyPart}
                      onChange={e => setNewCustomExerciseBodyPart(e.target.value)}
                      className="w-full bg-input rounded-xl px-4 py-2 text-foreground border border-border focus:border-primary outline-none appearance-none"
                    >
                      {BODY_PARTS.map(part => (
                        <option key={part} value={part}>{part}</option>
                      ))}
                    </select>
                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={() => setIsCreatingCustomExercise(false)}
                        className="flex-1 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-xl transition"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleCreateCustomExercise}
                        disabled={!newCustomExerciseName.trim() || isSubmittingExercise}
                        className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition disabled:opacity-50 flex justify-center"
                      >
                        {isSubmittingExercise ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                      </button>
                    </div>
                  </div>
                )}

                {filteredExercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => toggleExerciseSelection(exercise.id)}
                    className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-colors ${
                      selectedExerciseIds.includes(exercise.id) 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "glass border-border hover:border-primary/50 text-foreground"
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
                onClick={closeMenu}
                className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80 py-4 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
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
