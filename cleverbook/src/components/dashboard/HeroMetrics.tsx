"use client";

import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { DashboardMetrics } from "@/types/models";
import { AmbientParticles } from "./AmbientParticles";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { SyllabusContext } from "./SyllabusContext";
import { getAssessmentQuestionsAction } from "@/app/actions";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(value, { mass: 1, stiffness: 100, damping: 15 });
  const display = useTransform(spring, (current) => `${Math.round(current)}%`);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className="text-4xl font-extrabold text-slate-900">{display}</motion.span>;
}

const cardHover = {
  hover: { y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }, 
  rest: { y: 0, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" } 
};
const springTransition = { type: "spring" as const, stiffness: 400, damping: 30 };

export function AntigravityCard({ children, className, ambient = false }: { children: React.ReactNode, className?: string, ambient?: boolean }) {
  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      transition={springTransition}
      className={cn("bg-white border border-slate-100 rounded-2xl p-6 relative overflow-hidden", className)}
    >
      {ambient && <AmbientParticles />}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function HeroMetrics({ metrics, userRole = 'college' }: { metrics: DashboardMetrics, userRole?: 'college' | 'school' }) {
  const context = useContext(SyllabusContext);
  const coveragePercentage = context ? context.coveragePercentage : metrics.syllabusCoverage;
  const activeTitle = context ? context.activeTitle : metrics.activeSubject;
  const activePercentage = context ? context.activePercentage : metrics.retentionScore;

  const collegeAssessments = [
    { id: 'c1', title: 'Mock Interview', date: 'Today', statusOrScore: 'Cleared' },
    { id: 'c2', title: 'Aptitude Test', date: 'Yesterday', statusOrScore: 'Failed' },
    { id: 'c3', title: 'Coding Round', date: 'Oct 1', statusOrScore: 'Cleared' }
  ];

  const schoolAssessments = [
    { id: 's1', title: 'Mathematics', date: 'Today', statusOrScore: '27/30' },
    { id: 's2', title: 'Physics', date: 'Yesterday', statusOrScore: '18/30' },
    { id: 's3', title: 'Chemistry', date: 'Oct 1', statusOrScore: '22/30' }
  ];

  const displayAssessments = metrics.assessments && metrics.assessments.length > 0 
    ? metrics.assessments 
    : userRole === 'school' ? schoolAssessments : collegeAssessments;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAssessmentTitle, setSelectedAssessmentTitle] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleOpenAssessment = async (id: string, title: string) => {
    setSelectedAssessmentTitle(title);
    setQuestions([]);
    setModalOpen(true);
    setLoadingQuestions(true);
    
    const res = await getAssessmentQuestionsAction(id);
    if (res.success && res.data && res.data.questions) {
      setQuestions(res.data.questions);
    } else {
      setQuestions(["Failed to load questions."]);
    }
    setLoadingQuestions(false);
  };

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Component A: Weekly Performance Focus */}
      <AntigravityCard ambient className="md:col-span-1">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Focus</h3>
        <div className="relative h-8 mb-1">
          <AnimatePresence mode="wait">
            <motion.p 
              key={activeTitle}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 text-2xl font-bold text-slate-900 truncate"
            >
              {activeTitle}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex items-end gap-2 mt-4 relative">
          <AnimatedCounter value={activePercentage} />
          <span className="text-sm font-medium text-slate-500 pb-1">Retention</span>
        </div>
      </AntigravityCard>

      {/* Component B: Syllabus Coverage */}
      <AntigravityCard className="md:col-span-1 flex flex-col justify-center">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Coverage</h3>
        <div className="flex justify-between text-sm font-medium text-slate-900 mb-2">
          <span>Overall Progress</span>
          <span>{coveragePercentage}%</span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${coveragePercentage}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.8 }}
            className="h-full bg-slate-900 rounded-full"
          />
        </div>
      </AntigravityCard>

      {/* Component C: Assessment Ledger */}
      <AntigravityCard className="md:col-span-1">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Available Assessments</h3>
        <div className="space-y-4">
          {displayAssessments.map((assessment: any) => (
            <div key={assessment.id} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-semibold text-slate-900">{assessment.title}</p>
                <p className="text-xs text-slate-500">{assessment.date}</p>
              </div>
              <button 
                onClick={() => handleOpenAssessment(assessment.id, assessment.title)}
                className="text-slate-600 hover:text-slate-900 transition-colors p-1"
                title="View Questions"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </AntigravityCard>
    </div>

    {/* Assessment Questions Modal */}
    <AnimatePresence>
      {modalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">{selectedAssessmentTitle}</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-slate-900">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {loadingQuestions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-500 mb-2">Question {idx + 1}</p>
                    <div className="text-slate-800 text-sm leading-relaxed">
                      <Latex>{q}</Latex>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
