"use client";

import { useEffect, useState } from "react";
import { getBodyMetrics, logBodyMetrics, deleteBodyMetrics } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft, Activity, Save, Check, Scale, Ruler, Trash2, Edit2, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ThemeToggle } from "@/app/components/theme-toggle";

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [metricToDelete, setMetricToDelete] = useState<string | null>(null);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadData = async () => {
    const data = await getBodyMetrics();
    setMetrics(data);
    setIsLoading(false);
    
    // Auto-fill form if today's entry exists
    const selectedDate = new Date(date).setHours(0,0,0,0);
    const dateEntry = data.find(m => new Date(m.date).setHours(0,0,0,0) === selectedDate);
    if (dateEntry) {
      setWeight(dateEntry.weight?.toString() || "");
      setBodyFat(dateEntry.bodyFatPercent?.toString() || "");
    } else {
      setWeight("");
      setBodyFat("");
    }
  };

  useEffect(() => {
    loadData();
  }, [date]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      weight: weight ? parseFloat(weight) : undefined,
      bodyFatPercent: bodyFat ? parseFloat(bodyFat) : undefined,
    };

    await logBodyMetrics(new Date(date).toISOString(), payload);
    await loadData();
    setIsSaving(false);
    showToast("Metrics saved!");
  };

  const handleDeleteConfirm = async (id: string) => {
    setIsDeleting(true);
    await deleteBodyMetrics(id);
    await loadData();
    setIsDeleting(false);
    setMetricToDelete(null);
    showToast("Metrics deleted!");
  };

  // Format data for chart
  const chartData = metrics
    .filter(m => m.weight != null)
    .map(m => ({
      name: new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: m.weight
    }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-teal-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-teal-500/20 font-medium flex items-center gap-2 animate-fade-in-up">
          <Check className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 w-full h-full opacity-30 pointer-events-none z-0 fixed"
        style={{
          backgroundImage: `
            radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.25) 0%, transparent 50%)
          `
        }}
      />

      <div className="relative z-10 p-6 max-w-4xl mx-auto pb-24">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/" className="p-2 rounded-full hover:bg-muted transition mr-4">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold flex items-center">
              <Activity className="w-6 h-6 mr-3 text-teal-400" />
              Body Metrics
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Form */}
            <div className="space-y-6">
              <form onSubmit={handleSave} className="glass-card p-6 rounded-3xl border border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Log Metrics</h2>
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-input border border-border rounded-xl px-3 py-2 text-sm focus:border-teal-400 outline-none text-foreground"
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1 flex items-center gap-1"><Scale className="w-4 h-4"/> Weight (kg)</label>
                      <input 
                        type="number" step="0.1" 
                        value={weight} onChange={e => setWeight(e.target.value)}
                        className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-teal-400 outline-none transition"
                        placeholder="e.g. 75.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1 flex items-center gap-1"><Activity className="w-4 h-4"/> Body Fat (%)</label>
                      <input 
                        type="number" step="0.1"
                        value={bodyFat} onChange={e => setBodyFat(e.target.value)}
                        className="w-full bg-input border border-border rounded-xl px-4 py-3 focus:border-teal-400 outline-none transition"
                        placeholder="e.g. 15.2"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full py-4 mt-6 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-teal-500/20 disabled:opacity-50"
                  >
                    {isSaving ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Metrics
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Chart and History */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl border border-border">
                <h2 className="text-xl font-bold mb-6">Weight Progression</h2>
                {chartData.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="rgba(255,255,255,0.5)" 
                          fontSize={12} 
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.5)" 
                          fontSize={12} 
                          tickLine={false}
                          axisLine={false}
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f0f16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#2dd4bf' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#2dd4bf" 
                          strokeWidth={4}
                          dot={{ fill: '#0f0f16', stroke: '#2dd4bf', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: '#2dd4bf' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                    Log your weight to see progression
                  </div>
                )}
              </div>

              <div className="glass-card p-6 rounded-3xl border border-border">
                <h2 className="text-xl font-bold mb-4">History</h2>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[...metrics].reverse().map(m => (
                    <div key={m.id} className="bg-muted border border-border p-4 rounded-2xl flex items-center justify-between hover:bg-secondary transition">
                      <div>
                        <div className="text-sm font-bold text-teal-400">
                          {new Date(m.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                          {m.weight && <span>{m.weight} kg</span>}
                          {m.bodyFatPercent && <span>{m.bodyFatPercent}% BF</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setDate(new Date(m.date).toISOString().split('T')[0]);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 bg-background hover:bg-secondary hover:text-teal-400 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setMetricToDelete(m.id)}
                          className="p-2 bg-background hover:bg-secondary hover:text-red-400 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {metrics.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-4">No metrics logged yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {metricToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
           <div className="bg-muted border border-border rounded-3xl p-6 max-w-sm w-full animate-scale-in">
             <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-400">
               <Trash2 className="w-6 h-6" />
             </div>
             <h3 className="text-xl font-bold mb-2 text-foreground">Delete Entry?</h3>
             <p className="text-muted-foreground mb-6 text-sm">
               Are you sure you want to permanently delete this body metric entry? This action cannot be undone.
             </p>
             <div className="flex gap-3">
               <button 
                 onClick={() => setMetricToDelete(null)}
                 disabled={isDeleting}
                 className="flex-1 px-4 py-3 bg-background hover:bg-secondary text-foreground rounded-xl font-medium transition disabled:opacity-50"
               >
                 Cancel
               </button>
               <button 
                 onClick={() => handleDeleteConfirm(metricToDelete)}
                 disabled={isDeleting}
                 className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
               >
                 {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete"}
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
