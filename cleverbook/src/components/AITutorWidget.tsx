"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Sparkles, AlertCircle, CheckCircle2, LayoutDashboard, BrainCircuit } from "lucide-react";
import { AnimatedArchitectureCanvas } from "@/components/tutor/AnimatedArchitectureCanvas";

export function AITutorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  
  const [question, setQuestion] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<{ is_correct: boolean; full_text: string } | null>(null);
  
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualData, setVisualData] = useState<{ full_text: string } | null>(null);
  const [viewMode, setViewMode] = useState<'diagram' | 'raw'>('diagram');

  const handleEvaluate = async () => {
    if (!question.trim() || !studentAnswer.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tutor/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, student_answer: studentAnswer })
      });
      if (!res.ok) throw new Error("Server Error");
      const data = await res.json();
      setDiagnosis(data);
      setPhase(1);
    } catch (e) {
      console.error(e);
      setDiagnosis({ is_correct: false, full_text: "Service Error: Failed to reach tutor API." });
      setPhase(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisualize = async () => {
    if (!question || !studentAnswer || !diagnosis?.full_text) return;
    setPhase(2);
    setIsVisualizing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/tutor/visualize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question, 
          student_answer: studentAnswer,
          misconception: diagnosis.full_text 
        })
      });
      if (!res.ok) throw new Error("Server Error");
      const data = await res.json();
      setVisualData(data);
    } catch (e) {
      console.error(e);
      setVisualData({ full_text: "Failed to generate visual breakdown." });
    } finally {
      setIsVisualizing(false);
    }
  };
  
  const resetTutor = () => {
     setPhase(0);
     setQuestion("");
     setStudentAnswer("");
     setDiagnosis(null);
     setVisualData(null);
  };

  const renderDiagnosis = (text: string) => {
     return text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) {
           return <h4 key={i} className="font-bold text-slate-900 mt-4 mb-2">{line.replace('### ', '')}</h4>;
        } else if (line.startsWith('**') && line.includes('**', 2)) {
           return <p key={i} className="text-slate-800 my-1 font-medium">{line.replaceAll('**', '')}</p>;
        } else if (line.trim().length > 0) {
           return <p key={i} className="text-slate-600 my-1 text-sm">{line}</p>;
        }
        return <br key={i} />;
     });
  };

  const renderVisualizer = (text: string) => {
     const parts = text.split("```mermaid");
     if (parts.length > 1) {
        const afterMermaid = parts[1].split("```");
        const mermaidCode = afterMermaid[0];
        const breakdown = afterMermaid.length > 1 ? afterMermaid[1] : "";
        
        return (
          <div className="space-y-4">
             {viewMode === 'diagram' ? (
                <AnimatedArchitectureCanvas mermaidCode={mermaidCode} />
             ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-x-auto">
                  <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">System Architecture (Mermaid.js)</div>
                  <pre className="text-[11px] leading-snug text-slate-800 font-mono">
                    {mermaidCode.trim()}
                  </pre>
                </div>
             )}
             <div>
                {renderDiagnosis(breakdown.trim())}
             </div>
          </div>
        );
     }
     return renderDiagnosis(text);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <Bot className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse border-2 border-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md w-[calc(100vw-3rem)] bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px] max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Clever AI</h3>
                  <p className="text-xs text-slate-500 font-medium">Adaptive Diagnostic Engine</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50">
              <AnimatePresence mode="wait">
                {/* Phase 0: Input */}
                {phase === 0 && (
                  <motion.div 
                    key="phase0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Question / Problem Statement</label>
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g. Write a function to reverse a linked list..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors resize-none h-28"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Student's Answer</label>
                      <textarea
                        value={studentAnswer}
                        onChange={(e) => setStudentAnswer(e.target.value)}
                        placeholder="e.g. I just loop through and assign next to next..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors resize-none h-28"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Phase 1: Diagnosis */}
                {phase === 1 && diagnosis && (
                  <motion.div 
                    key="phase1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    <div className={`p-4 rounded-xl border flex gap-3 ${
                      diagnosis.is_correct 
                        ? 'bg-emerald-50 border-emerald-100' 
                        : 'bg-red-50 border-red-100'
                    }`}>
                      {diagnosis.is_correct ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className={`text-sm font-bold mb-1 ${diagnosis.is_correct ? 'text-emerald-800' : 'text-red-800'}`}>
                          {diagnosis.is_correct ? 'Conceptually Correct' : 'Misconception Detected'}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">Analysis complete. See breakdown below.</p>
                      </div>
                    </div>

                    <div className="prose prose-sm text-slate-700">
                      {renderDiagnosis(diagnosis.full_text)}
                    </div>
                  </motion.div>
                )}

                {/* Phase 2: Visualizer */}
                {phase === 2 && (
                  <motion.div 
                    key="phase2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-slate-900">
                        <LayoutDashboard className="w-4 h-4" />
                        <h4 className="text-sm font-semibold">Visual Breakdown</h4>
                      </div>
                      {visualData && (
                        <button
                          onClick={() => setViewMode(m => m === 'diagram' ? 'raw' : 'diagram')}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
                        >
                          {viewMode === 'diagram' ? 'View Raw Code' : 'View Diagram'}
                        </button>
                      )}
                    </div>
                    {isVisualizing ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                        <Sparkles className="w-6 h-6 animate-pulse text-slate-900" />
                        <p className="text-sm font-medium">Synthesizing architecture diagram...</p>
                      </div>
                    ) : (
                      visualData && renderVisualizer(visualData.full_text)
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-3">
              {phase === 0 ? (
                <button
                  onClick={handleEvaluate}
                  disabled={isLoading || !question || !studentAnswer}
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[52px]"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Evaluate Submission
                    </>
                  )}
                </button>
              ) : phase === 1 ? (
                <>
                  <button
                    onClick={resetTutor}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors h-[52px]"
                  >
                    Reset
                  </button>
                  {!diagnosis?.is_correct && (
                    <button
                      onClick={handleVisualize}
                      className="flex-[2] py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 h-[52px]"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Show Visualizer
                    </button>
                  )}
                </>
              ) : phase === 2 ? (
                <button
                  onClick={resetTutor}
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors h-[52px]"
                >
                  Start Over
                </button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
