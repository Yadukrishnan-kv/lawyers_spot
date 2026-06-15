import 'server-only';
import { getBackendUrl } from '@/lib/cms/backend-url';

export type PublicQaAnswer = {
  id: string;
  lawyerId: string;
  lawyerName: string;
  body: string;
  createdAt?: string;
};

export async function getQaAnswersBySlug(slug: string) {
  try {
    const res = await fetch(`${getBackendUrl()}/api/v1/qa/${encodeURIComponent(slug)}/answers`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { question: null, answers: [] as PublicQaAnswer[] };
    const data = (await res.json()) as {
      question: { content?: string };
      answers: PublicQaAnswer[];
    };
    return data;
  } catch {
    return { question: null, answers: [] as PublicQaAnswer[] };
  }
}
