"use server"
import { cookies } from "next/headers"

export async function loginAction(email: string, password: string) {
    const fd = new URLSearchParams();
    fd.append('username', email);
    fd.append('password', password);
    const res = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: fd.toString()
    });
    if (res.ok) {
        const data = await res.json();
        const cookieStore = await cookies();
        cookieStore.set("token", data.access_token, { httpOnly: true, path: "/" });
        return { success: true };
    }
    return { success: false, error: await res.text() };
}

export async function signupAction(payload: any) {
    const res = await fetch("http://localhost:8000/api/v1/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (res.ok) {
        return loginAction(payload.email, payload.password);
    }
    return { success: false, error: await res.text() };
}

export async function getSyllabusAction() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return { success: false, error: "No token" };

    const res = await fetch("http://localhost:8000/api/v1/syllabus/", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
        return { success: true, data: await res.json() };
    }
    return { success: false, error: await res.text() };
}

export async function getMetricsAction() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return { success: false, error: "No token" };

    const res = await fetch("http://localhost:8000/api/v1/metrics/coverage", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
        return { success: true, data: await res.json() };
    }
    return { success: false, error: await res.text() };
}

export async function toggleSubtopicAction(subtopicId: string, completed: boolean) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return { success: false, error: "No token" };

    const res = await fetch(`http://localhost:8000/api/v1/syllabus/toggle_subtopic?subtopic_id=${subtopicId}&completed=${completed}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
        return { success: true };
    }
    return { success: false, error: await res.text() };
}

export async function getAssessmentQuestionsAction(assessmentId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return { success: false, error: "No token" };

    const res = await fetch(`http://localhost:8000/api/v1/assessments/${assessmentId}/questions`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (res.ok) {
        return { success: true, data: await res.json() };
    }
    return { success: false, error: await res.text() };
}
