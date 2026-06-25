'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { fetchConversations, fetchMessages, sendMessage } from '@/lib/user-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Conversation = {
  id: number;
  lawyerId: string;
  lawyerName: string;
  lawyerImage: string;
  lawyerPractice: string;
  lastMessage: string | null;
  lastMessageAt: string;
};

type ChatMessage = {
  id: number;
  senderId: string;
  senderType: string;
  text: string;
  createdAt: string;
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations()
      .then((data) => setConversations(data.conversations))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedConv && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedConv]);

  async function selectConversation(conv: Conversation) {
    setSelectedConv(conv);
    setMessagesLoading(true);
    setMessages([]);
    try {
      const data = await fetchMessages(conv.id);
      setMessages(data.messages);
    } catch {}
    setMessagesLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!msgText.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      const data = await sendMessage(selectedConv.id, msgText.trim());
      setMessages((prev) => [...prev, data.message as ChatMessage]);
      setMsgText('');
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, lastMessage: msgText.trim(), lastMessageAt: new Date().toISOString() }
            : c,
        ),
      );
    } catch {}
    setSending(false);
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-600 border-t-transparent" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-navy-900 dark:text-white">Messages</h2>
        <div className="flex flex-col items-center gap-4 py-12">
          <MessageSquare className="h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-500">No conversations yet. Book a consultation to start chatting.</p>
          <Button asChild className="bg-royal-600 hover:bg-royal-500">
            <Link href="/lawyers">Book a Lawyer</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-navy-900 dark:text-white">Messages</h2>

      <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-navy-700 lg:flex-row lg:h-[600px]">
        <div className={cn('w-full border-r border-slate-200 lg:w-72 dark:border-navy-700', selectedConv ? 'max-lg:hidden' : '')}>
          <div className="border-b border-slate-200 p-3 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-navy-900 dark:text-white">Conversations</h3>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '540px' }}>
            {conversations.map((conv) => (
              <button
                type="button"
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={cn(
                  'flex w-full items-center gap-3 border-b border-slate-50 p-3 text-left transition hover:bg-slate-50 dark:border-navy-800 dark:hover:bg-navy-800',
                  selectedConv?.id === conv.id && 'bg-royal-50 dark:bg-royal-950/30',
                )}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={conv.lawyerImage || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40&h=40&fit=crop'}
                    alt={conv.lawyerName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">
                    {conv.lawyerName}
                  </p>
                  <p className="truncate text-xs text-slate-500">{conv.lawyerPractice}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={cn('flex flex-1 flex-col', !selectedConv ? 'max-lg:hidden' : '')}>
          {selectedConv ? (
            <>
              <div className="flex items-center gap-3 border-b border-slate-200 p-3 dark:border-navy-700">
                <button
                  type="button"
                  className="lg:hidden"
                  onClick={() => setSelectedConv(null)}
                  aria-label="Back"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={selectedConv.lawyerImage || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=32&h=32&fit=crop'}
                    alt={selectedConv.lawyerName}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">
                    {selectedConv.lawyerName}
                  </p>
                  <p className="text-xs text-slate-500">{selectedConv.lawyerPractice}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '460px' }}>
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-royal-600 border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No messages yet. Send a message to start the conversation.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex',
                        msg.senderType === 'user' ? 'justify-end' : 'justify-start',
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                          msg.senderType === 'user'
                            ? 'bg-royal-600 text-white'
                            : 'bg-slate-100 text-navy-900 dark:bg-navy-800 dark:text-white',
                        )}
                      >
                        <p>{msg.text}</p>
                        <p
                          className={cn(
                            'mt-1 text-right text-xs',
                            msg.senderType === 'user'
                              ? 'text-white/60'
                              : 'text-slate-400',
                          )}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-navy-700">
                <input
                  ref={inputRef}
                  type="text"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-royal-500 focus:ring-2 focus:ring-royal-500/20 disabled:opacity-60 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!msgText.trim() || sending}
                  className="bg-royal-600 hover:bg-royal-500"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
