'use client';

import type { Article, QaAnswer } from '@/lib/cms/types';
import type { Lawyer, SubscriptionPlan } from '@/lib/data-types';

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Request failed');
  return data as T;
}

export async function loginUser(email: string, password: string, role?: 'client' | 'lawyer') {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Login failed');
  return data as { success: boolean; role: string; name?: string };
}

export async function signupUser(name: string, email: string, password: string) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Signup failed');
  return data;
}

export async function lawyerSignup(body: {
  name: string;
  email: string;
  password: string;
  phone: string;
  practice: string;
  barId: string;
  citySlug: string;
}) {
  const res = await fetch('/api/auth/lawyer-signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Signup failed');
  return data;
}

export async function logoutUser() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
}

export async function fetchCurrentUser() {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to load user');
  return res.json() as Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    lawyerId?: string;
  }>;
}

export async function fetchLawyerProfile() {
  const res = await fetch('/api/lawyer/profile', { credentials: 'include' });
  return parseJson<{ lawyer: Lawyer; user?: { id: string; name: string; email: string } }>(res);
}

export async function updateLawyerProfile(body: Record<string, unknown>) {
  const res = await fetch('/api/lawyer/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return parseJson<{ success: boolean; lawyer: Lawyer }>(res);
}

export async function changeLawyerPassword(currentPassword: string, newPassword: string) {
  const res = await fetch('/api/lawyer/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
    credentials: 'include',
  });
  return parseJson<{ success: boolean }>(res);
}

export async function fetchLawyerSubscription() {
  const res = await fetch('/api/lawyer/subscription', { credentials: 'include' });
  return parseJson<{
    planId: string;
    plan: SubscriptionPlan | null;
    expiresAt: string | null;
    status: 'active' | 'expiring_soon' | 'expired';
    availablePlans: SubscriptionPlan[];
  }>(res);
}

export async function renewLawyerSubscription(planId: string) {
  const res = await fetch('/api/lawyer/subscription/renew', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
    credentials: 'include',
  });
  return parseJson<{ success: boolean; message?: string; expiresAt?: string }>(res);
}

export async function fetchLawyerArticles() {
  const res = await fetch('/api/lawyer/articles', { credentials: 'include' });
  return parseJson<{ articles: Article[] }>(res);
}

export async function fetchLawyerArticle(slug: string) {
  const res = await fetch(`/api/lawyer/articles/${encodeURIComponent(slug)}`, { credentials: 'include' });
  return parseJson<{ article: Article }>(res);
}

export async function createLawyerArticle(body: Partial<Article>) {
  const res = await fetch('/api/lawyer/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return parseJson<{ success: boolean; article: Article }>(res);
}

export async function updateLawyerArticle(slug: string, body: Partial<Article>) {
  const res = await fetch(`/api/lawyer/articles/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return parseJson<{ success: boolean; article: Article }>(res);
}

export async function deleteLawyerArticle(slug: string) {
  const res = await fetch(`/api/lawyer/articles/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return parseJson<{ success: boolean }>(res);
}

export type LawyerQaQuestion = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  answers: number;
  views: number;
  answeredByMe: boolean;
};

export async function fetchLawyerQaQuestions() {
  const res = await fetch('/api/lawyer/qa/questions', { credentials: 'include' });
  return parseJson<{ questions: LawyerQaQuestion[] }>(res);
}

export async function fetchLawyerQaAnswers() {
  const res = await fetch('/api/lawyer/qa/answers', { credentials: 'include' });
  return parseJson<{ answers: QaAnswer[] }>(res);
}

export async function fetchLawyerQaQuestion(id: string) {
  const res = await fetch(`/api/lawyer/qa/questions/${encodeURIComponent(id)}`, { credentials: 'include' });
  return parseJson<{
    question: {
      id: string;
      slug: string;
      title: string;
      excerpt: string;
      category: string;
      content?: string;
    };
    myAnswer: QaAnswer | null;
  }>(res);
}

export async function submitLawyerQaAnswer(questionId: string, body: string) {
  const res = await fetch(`/api/lawyer/qa/questions/${encodeURIComponent(questionId)}/answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
    credentials: 'include',
  });
  return parseJson<{ success: boolean; answer: QaAnswer }>(res);
}

export async function deleteLawyerQaAnswer(answerId: string) {
  const res = await fetch(`/api/lawyer/qa/answers/${encodeURIComponent(answerId)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return parseJson<{ success: boolean }>(res);
}

export async function createBooking(body: {
  lawyerId: string;
  lawyerName: string;
  clientName: string;
  clientEmail: string;
  date: string;
  time: string;
  type: string;
}) {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Booking failed');
  return data;
}
