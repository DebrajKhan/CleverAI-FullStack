import { getSyllabusAction, getMetricsAction } from "@/app/actions";
import { HeroMetrics } from "@/components/dashboard/HeroMetrics";
import { SyllabusAccordion } from "@/components/syllabus/SyllabusAccordion";
import { SyllabusProvider } from "@/components/dashboard/SyllabusContext";
import { DashboardMetrics, SyllabusNode } from "@/types/models";

function mapBackendSyllabus(backendData: any): SyllabusNode[] {
  if (!backendData || !backendData.subjects) return [];
  return backendData.subjects.map((subject: any) => ({
    id: subject.id,
    title: subject.title,
    type: "subject",
    children: subject.topics?.map((topic: any) => ({
      id: topic.id,
      title: topic.title,
      type: "topic",
      children: topic.subtopics?.map((sub: any) => ({
        id: sub.id,
        title: sub.title,
        type: "subtopic",
        completed: sub.completed || false
      })) || []
    })) || []
  }));
}

export default async function DashboardPage() {
  const syllabusRes = await getSyllabusAction();
  const metricsRes = await getMetricsAction();
  
  const nodes = syllabusRes.success ? mapBackendSyllabus(syllabusRes.data) : [];
  
  // Create an initial completed mapping
  const initialCompleted: Record<string, boolean> = {};
  nodes.forEach(subject => {
    subject.children?.forEach(topic => {
      topic.children?.forEach(sub => {
         if ((sub as any).completed) {
           initialCompleted[sub.id] = true;
         }
      })
    })
  });

  const coverage = metricsRes.success && metricsRes.data.coverage ? metricsRes.data.coverage : 0;
  const activeSubject = metricsRes.success && metricsRes.data.topic ? metricsRes.data.topic : "All Caught Up";
  const retentionScore = metricsRes.success && metricsRes.data.retention ? metricsRes.data.retention : 0;
  const assessments = metricsRes.success && metricsRes.data.assessments ? metricsRes.data.assessments : [];

  const metrics: DashboardMetrics = {
    userId: syllabusRes.success ? syllabusRes.data.user_id : "unknown",
    activeSubject: activeSubject,
    retentionScore: retentionScore,
    syllabusCoverage: coverage,
    assessments: assessments
  };

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here is your progress at a glance.</p>
      </header>
      
      <SyllabusProvider syllabus={nodes} initialCompleted={initialCompleted}>
        <HeroMetrics metrics={metrics} />
        <SyllabusAccordion nodes={nodes} />
      </SyllabusProvider>
    </main>
  );
}
