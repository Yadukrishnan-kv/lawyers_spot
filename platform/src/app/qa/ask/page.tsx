import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ask a Free Legal Question',
  description: 'Post your legal question and get answers from verified lawyers across India.',
};

export default function AskQuestionPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Q&A', href: '/qa' }, { label: 'Ask Question' }]} />
      <h1 className="font-display text-3xl font-bold">Ask a Free Legal Question</h1>
      <form className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-semibold">Category</label>
          <select className="mt-1 h-11 w-full rounded-xl border px-3 dark:border-navy-700 dark:bg-navy-800">
            <option>Family Law</option>
            <option>Property</option>
            <option>Criminal</option>
            <option>Tax & GST</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Your question</label>
          <textarea rows={6} className="mt-1 w-full rounded-xl border p-3 dark:border-navy-700 dark:bg-navy-800" placeholder="Describe your legal issue..." />
        </div>
        <Button type="submit" size="lg" className="w-full">Submit Question</Button>
      </form>
    </div>
  );
}
