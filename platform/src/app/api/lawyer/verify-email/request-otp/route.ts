import { proxyToBackend } from '@/lib/cms/proxy';

export async function POST(request: Request) {
  return proxyToBackend('/api/v1/lawyer/verify-email/request-otp', request, {
    method: 'POST',
  });
}
