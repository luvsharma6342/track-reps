"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Search, Dumbbell, ArrowLeft, History, X, Calendar, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";
import { createExercise, getExercises, getExerciseHistory, deleteExercise, renameExercise } from "@/app/actions";

const BODY_PARTS = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Cardio", "Biceps", "Triceps"];

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseBodyPart, setNewExerciseBodyPart] = useState(BODY_PARTS[0]);

  const [selectedExerciseHistory, setSelectedExerciseHistory] = useState<any>(null);
  const [exerciseHistoryData, setExerciseHistoryData] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [exerciseToDelete, setExerciseToDelete] = useState<any>(null);
  const [exerciseToRename, setExerciseToRename] = useState<any>(null);
  const [renameValue, setRenameValue] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  const handleCreate = async () => {
    if (!newExerciseName.trim()) return;
    const created = await createExercise({ name: newExerciseName, bodyPart: newExerciseBodyPart });
    setExercises([...exercises, created]);
    setIsModalOpen(false);
    setNewExerciseName("");
  };

  const handleViewHistory = async (ex: any) => {
    setSelectedExerciseHistory(ex);
    setIsHistoryLoading(true);
    const history = await getExerciseHistory(ex.id);
    setExerciseHistoryData(history);
    setIsHistoryLoading(false);
  };

  const confirmDelete = (ex: any) => {
    setExerciseToDelete(ex);
  };

  const confirmRename = (ex: any) => {
    setExerciseToRename(ex);
    setRenameValue(ex.name);
  };

  const executeRename = async () => {
    if (!exerciseToRename || !renameValue.trim()) return;
    
    // Optimistic update
    setExercises(exercises.map(ex => 
      ex.id === exerciseToRename.id ? { ...ex, name: renameValue } : ex
    ));
    
    const idToRename = exerciseToRename.id;
    const newName = renameValue;
    setExerciseToRename(null);
    setRenameValue("");
    
    await renameExercise(idToRename, newName);
    
    setToastMessage("Exercise renamed successfully");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const executeDelete = async () => {
    if (!exerciseToDelete) return;
    
    // Optimistic UI update
    setExercises(exercises.filter(ex => ex.id !== exerciseToDelete.id));
    const idToDelete = exerciseToDelete.id;
    setExerciseToDelete(null);
    
    await deleteExercise(idToDelete);
    
    // Show toast
    setToastMessage("Exercise deleted successfully");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag ? ex.bodyPart === selectedTag : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05050a]">
      {/* Dynamic Multi-Color Background */}
      <div className="absolute inset-0 w-full h-full opacity-40 pointer-events-none z-0 fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-amber-500/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      <div className="relative z-10 min-h-screen p-6 max-w-2xl mx-auto pb-24">
        <div className="flex items-center mb-8">
        <Link href="/" className="mr-4 p-2 rounded-full hover:bg-white/10 transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Exercise Library</h1>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search exercises..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-input rounded-xl pl-10 pr-4 py-3 text-white border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
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
      </div>

      <div className="space-y-3">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-12 text-gray-400 glass rounded-2xl">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No exercises found.</p>
            {search && (
              <button 
                onClick={() => {
                  setNewExerciseName(search);
                  setIsModalOpen(true);
                }}
                className="mt-4 text-primary font-medium hover:underline"
              >
                Create "{search}"
              </button>
            )}
          </div>
        ) : (
          filteredExercises.map(ex => (
            <motion.div 
              key={ex.id}
              onClick={() => handleViewHistory(ex)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/5 transition border border-white/5 hover:border-primary/20"
            >
              <div>
                <h3 className="font-semibold text-white">{ex.name}</h3>
                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {ex.bodyPart}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                  <History className="w-4 h-4" />
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmRename(ex);
                  }}
                  className="w-8 h-8 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center text-blue-500 transition"
                  title="Rename exercise"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(ex);
                  }}
                  className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 transition"
                  title="Delete exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 z-40"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Exercise Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md rounded-2xl p-6"
            >
              <h2 className="text-2xl font-bold mb-4">Add Exercise</h2>
              
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
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl font-medium text-gray-300 hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCreate}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/20"
                  >
                    Save Exercise
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise History Modal */}
      <AnimatePresence>
        {selectedExerciseHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 z-50"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="glass-card w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl h-[85vh] sm:h-[650px] flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-white/10 flex justify-between items-start bg-white/5">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedExerciseHistory.name}</h2>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {selectedExerciseHistory.bodyPart} • History
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedExerciseHistory(null)} 
                  className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {isHistoryLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Loading history...</p>
                  </div>
                ) : exerciseHistoryData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                    <History className="w-12 h-12 mb-3 opacity-20" />
                    <p>No workouts recorded yet.</p>
                    <p className="text-sm mt-1">Start a workout to log your first sets!</p>
                  </div>
                ) : (
                  exerciseHistoryData.map((workoutData, idx) => (
                    <div key={workoutData.workoutId} className="relative">
                      {idx !== exerciseHistoryData.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-white/5 z-0"></div>
                      )}
                      <div className="flex items-center gap-3 mb-3 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-white">
                          {new Date(workoutData.date).toLocaleDateString(undefined, {
                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </h3>
                      </div>
                      
                      <div className="ml-11 glass rounded-2xl p-4 border border-white/5 space-y-2">
                        {workoutData.sets.map((set: any) => (
                          <div key={set.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-medium">Set {set.setNumber}</span>
                            <span className="text-white font-semibold">{set.weight} kg × {set.reps} reps</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {exerciseToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">Delete Exercise?</h2>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete <strong className="text-white">{exerciseToDelete.name}</strong>? All associated workout history will be lost forever.
              </p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setExerciseToDelete(null)}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-300 bg-white/5 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeDelete}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rename Modal */}
      <AnimatePresence>
        {exerciseToRename && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-4 text-white text-center">Rename Exercise</h2>
              <div className="mb-6">
                <input 
                  type="text" 
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  className="w-full bg-input rounded-xl px-4 py-3 text-white border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Exercise name"
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setExerciseToRename(null)}
                  className="flex-1 py-3 rounded-xl font-medium text-gray-300 bg-white/5 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeRename}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition shadow-lg shadow-blue-500/20"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 z-50 border border-white/10"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="font-medium text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
