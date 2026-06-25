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

export async function fetchUserProfile() {
  const res = await fetch('/api/user/profile', { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json() as Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    phone: string | null;
    profileImage: string | null;
    address: string | null;
  }>;
}

export async function updateUserProfile(body: {
  name?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
}) {
  const res = await fetch('/api/user/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Failed to update profile');
  return data as { success: boolean; profile: Record<string, unknown> };
}

export async function fetchUserBookings() {
  const res = await fetch('/api/user/bookings', { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Failed to load bookings');
  return data as {
    bookings: Array<{
      id: string;
      lawyerId: string;
      lawyerName: string;
      lawyerImage: string;
      date: string;
      time: string;
      type: string;
      status: string;
    }>;
  };
}

export async function fetchSavedLawyerIds() {
  const res = await fetch('/api/user/saved-lawyers/ids', { credentials: 'include' });
  if (res.status === 401) return { ids: [] as string[] };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ids: [] as string[] };
  return data as { ids: string[] };
}

export async function saveLawyer(lawyerId: string) {
  const res = await fetch('/api/user/saved-lawyers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lawyerId }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Failed to save lawyer');
  return data as { success: boolean; saved: boolean };
}

export async function removeSavedLawyer(lawyerId: string) {
  const res = await fetch(`/api/user/saved-lawyers/${encodeURIComponent(lawyerId)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Failed to remove saved lawyer');
  return data as { success: boolean; saved: boolean };
}

export async function fetchSavedLawyers() {
  const res = await fetch('/api/user/saved-lawyers', { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Failed to load saved lawyers');
  return data as {
    savedLawyers: Array<{
      id: string;
      slug?: string;
      name: string;
      image: string;
      rating: number;
      reviews: number;
      experience: number;
      fee?: number;
      currency?: string;
      location: string;
      practice: string;
      specialization: string[];
      online: boolean;
      verified: boolean;
      savedAt: string;
    }>;
  };
}

export async function fetchNotifications() {
  const res = await fetch('/api/user/notifications', { credentials: 'include' });
  if (res.status === 401) return { notifications: [] };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { notifications: [] };
  return data as {
    notifications: Array<{
      id: number;
      title: string;
      message: string;
      type: string;
      read: boolean;
      createdAt: string;
    }>;
  };
}

export async function markNotificationRead(id: number) {
  await fetch(`/api/user/notifications/${id}/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: '{}',
  });
}

export async function markAllNotificationsRead() {
  await fetch('/api/user/notifications/read-all', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: '{}',
  });
}

export async function fetchConversations() {
  const res = await fetch('/api/user/conversations', { credentials: 'include' });
  if (res.status === 401) return { conversations: [] };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { conversations: [] };
  return data as {
    conversations: Array<{
      id: number;
      lawyerId: string;
      lawyerName: string;
      lawyerImage: string;
      lawyerPractice: string;
      lastMessage: string | null;
      lastMessageAt: string;
      unreadCount?: number;
    }>;
  };
}

export async function fetchMessages(conversationId: number) {
  const res = await fetch(`/api/user/conversations/${conversationId}/messages`, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Failed to load messages');
  return data as {
    messages: Array<{
      id: number;
      senderId: string;
      senderType: string;
      text: string;
      createdAt: string;
      isRead?: boolean;
    }>;
  };
}

export async function sendMessage(conversationId: number, text: string) {
  const res = await fetch(`/api/user/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Failed to send message');
  return data as { success: boolean; message: Record<string, unknown> };
}

export async function startConversation(lawyerId: string, initialMessage?: string) {
  const res = await fetch('/api/user/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lawyerId, initialMessage }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Failed to create conversation');
  return data as { conversationId: number; existing: boolean };
}

export async function fetchDocuments() {
  const res = await fetch('/api/user/documents', { credentials: 'include' });
  if (res.status === 401) return { documents: [] };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { documents: [] };
  return data as {
    documents: Array<{
      id: number;
      fileUrl: string;
      fileName: string;
      fileSize: number | null;
      mimeType: string | null;
      createdAt: string;
    }>;
  };
}

export async function uploadDocument(fileName: string, fileData: string, mimeType: string) {
  const res = await fetch('/api/user/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, fileData, mimeType }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Failed to upload document');
  return data as { success: boolean; document: Record<string, unknown> };
}

export async function deleteDocument(id: number) {
  const res = await fetch(`/api/user/documents/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Failed to delete document');
  return data as { success: boolean };
}

/* ─── Lawyer Messaging API ─── */

export async function fetchLawyerConversations() {
  const res = await fetch('/api/lawyer/conversations', { credentials: 'include' });
  if (res.status === 401) return { conversations: [] };
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { conversations: [] };
  return data as {
    conversations: Array<{
      id: number;
      userId: string;
      userName: string;
      userEmail: string;
      lastMessage: string | null;
      lastMessageAt: string;
      unreadCount: number;
    }>;
  };
}

export async function fetchLawyerMessages(conversationId: number) {
  const res = await fetch(`/api/lawyer/conversations/${conversationId}/messages`, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Failed to load messages');
  return data as {
    messages: Array<{
      id: number;
      senderId: string;
      senderType: string;
      text: string;
      createdAt: string;
      isRead: boolean;
    }>;
  };
}

export async function sendLawyerMessage(conversationId: number, text: string) {
  const res = await fetch(`/api/lawyer/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? 'Failed to send message');
  return data as { success: boolean; message: Record<string, unknown> };
}

export async function markConversationRead(conversationId: number, role: 'user' | 'lawyer') {
  const prefix = role === 'lawyer' ? 'lawyer' : 'user';
  const res = await fetch(`/api/${prefix}/conversations/${conversationId}/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Failed to mark as read');
  return data as { success: boolean };
}

export async function fetchUnreadCounts() {
  const [userConvs, lawyerConvs] = await Promise.all([
    fetchConversations().catch(() => ({ conversations: [] })),
    fetchLawyerConversations().catch(() => ({ conversations: [] })),
  ]);
  const userUnread = (userConvs.conversations ?? []).reduce((sum, c) => sum + ((c as { unreadCount?: number }).unreadCount ?? 0), 0);
  const lawyerUnread = (lawyerConvs.conversations ?? []).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  return { userUnread, lawyerUnread };
}
