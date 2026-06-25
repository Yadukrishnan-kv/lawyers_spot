'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MessageSquare, Send, ArrowLeft, Search, Paperclip, Check, CheckCheck, User } from 'lucide-react';
import { fetchLawyerConversations, fetchLawyerMessages, sendLawyerMessage, markConversationRead } from '@/lib/user-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Conversation = {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

type ChatMessage = {
  id: number;
  senderId: string;
  senderType: string;
  text: string;
  createdAt: string;
  isRead?: boolean;
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatMessageTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isSameDay(a: string, b: string) {
  const da = new Date(a); const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function LawyerMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await fetchLawyerConversations();
      setConversations(data.conversations ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    const el = bottomRef.current;
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'instant' }), 50);
  }, [selectedConv]);

  useEffect(() => {
    if (!selectedConv) return;
    const id = setInterval(async () => {
      try {
        const data = await fetchLawyerMessages(selectedConv.id);
        const newMsgs = data.messages ?? [];
        const prevLen = messagesRef.current.length;
        if (newMsgs.length > prevLen) {
          const isFromOther = prevLen > 0 && newMsgs[newMsgs.length - 1].senderType !== 'lawyer';
          const el = bottomRef.current;
          if (isFromOther && el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
        }
        setMessages(newMsgs);
      } catch {}
    }, 5000);
    pollRef.current = id;
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedConv]);

  async function selectConversation(conv: Conversation) {
    setSelectedConv(conv);
    setMessagesLoading(true);
    setMessages([]);
    setShowMobileList(false);
    try {
      const data = await fetchLawyerMessages(conv.id);
      setMessages(data.messages ?? []);
      if (conv.unreadCount > 0) {
        await markConversationRead(conv.id, 'lawyer').catch(() => {});
        setConversations((prev) =>
          prev.map((c) => c.id === conv.id ? { ...c, unreadCount: 0 } : c),
        );
      }
    } catch {}
    setMessagesLoading(false);
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }));
    setTimeout(() => inputRef.current?.focus(), 200);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!msgText.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      const data = await sendLawyerMessage(selectedConv.id, msgText.trim());
      const newMsg = data.message as ChatMessage;
      setMessages((prev) => [...prev, { ...newMsg, isRead: false }]);
      setMsgText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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

  function handleBack() {
    setSelectedConv(null);
    setShowMobileList(true);
  }

  const filteredConvs = conversations.filter((c) =>
    c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.userEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
      <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-none bg-white shadow-sm dark:bg-navy-900 sm:rounded-2xl sm:border sm:border-slate-200 dark:sm:border-navy-700">
        {/* Left Panel */}
        <div className={cn(
          'flex w-full flex-col border-r border-slate-200 dark:border-navy-700 sm:w-72 lg:w-80',
          !showMobileList && 'hidden sm:flex',
        )}>
          {/* Header */}
          <div className="border-b border-slate-200 bg-white px-4 py-4 dark:border-navy-700 dark:bg-navy-900">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-navy-900 dark:text-white">Messages</h2>
              {totalUnread > 0 && (
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-royal-600 px-2 text-[11px] font-bold text-white">
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-royal-500 focus:bg-white focus:ring-2 focus:ring-royal-500/20 dark:border-navy-600 dark:bg-navy-800 dark:text-white dark:focus:bg-navy-800"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-800">
                  <MessageSquare className="h-7 w-7 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">No messages yet</p>
                  <p className="mt-1 text-xs text-slate-500">When clients message you, conversations will appear here.</p>
                </div>
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">No conversations match your search.</div>
            ) : (
              filteredConvs.map((conv) => (
                <button
                  type="button"
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={cn(
                    'flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3.5 text-left transition hover:bg-slate-50 dark:border-navy-800 dark:hover:bg-navy-800',
                    selectedConv?.id === conv.id && 'bg-royal-50/60 dark:bg-royal-950/20',
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-royal-100 to-royal-200 text-sm font-bold text-royal-700 dark:from-royal-950/50 dark:to-royal-900/50 dark:text-royal-300">
                      {getInitials(conv.userName)}
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-navy-900" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-navy-900 dark:text-white">
                        {conv.userName}
                      </p>
                      {conv.lastMessageAt && (
                        <span className="shrink-0 text-[11px] text-slate-400">{formatTime(conv.lastMessageAt)}</span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="mt-0.5 truncate text-xs text-slate-400">{conv.lastMessage}</p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-royal-600 px-1.5 text-[10px] font-bold text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className={cn(
          'flex flex-1 flex-col',
          showMobileList && 'hidden sm:flex',
        )}>
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-navy-700 dark:bg-navy-900">
                <button type="button" className="sm:hidden" onClick={handleBack} aria-label="Back">
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-royal-100 to-royal-200 text-sm font-bold text-royal-700 dark:from-royal-950/50 dark:to-royal-900/50 dark:text-royal-300">
                    {getInitials(selectedConv.userName)}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-navy-900" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy-900 dark:text-white">{selectedConv.userName}</p>
                  <p className="text-xs text-emerald-600">Online</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <User className="h-3 w-3" />
                  {selectedConv.userEmail}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto bg-slate-50/50 px-4 py-4 dark:bg-navy-950/50">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="h-6 w-6 animate-spin rounded-full border-3 border-royal-600 border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-800">
                      <MessageSquare className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-navy-900 dark:text-white">No messages yet</p>
                    <p className="mt-1 text-xs text-slate-500">Send a message to reply to this client.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((msg, idx) => {
                      const showDateSep = idx === 0 || !isSameDay(messages[idx - 1].createdAt, msg.createdAt);
                      const isLawyer = msg.senderType === 'lawyer';
                      return (
                        <div key={msg.id}>
                          {showDateSep && (
                            <div className="flex justify-center py-3">
                              <span className="rounded-full bg-slate-200/70 px-3 py-1 text-[11px] font-medium text-slate-500 dark:bg-navy-800 dark:text-slate-400">
                                {formatDateSeparator(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div className={cn('flex', isLawyer ? 'justify-end' : 'justify-start')}>
                            <div className={cn(
                              'group relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%]',
                              isLawyer
                                ? 'rounded-br-md bg-royal-600 text-white'
                                : 'rounded-bl-md border border-slate-200 bg-white text-navy-900 dark:border-navy-700 dark:bg-navy-800 dark:text-white',
                            )}>
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                              <div className={cn(
                                'mt-1 flex items-center justify-end gap-1',
                                isLawyer ? 'text-white/60' : 'text-slate-400',
                              )}>
                                <span className="text-[10px] leading-none">{formatMessageTime(msg.createdAt)}</span>
                                {isLawyer && (
                                  msg.isRead
                                    ? <CheckCheck className="h-3 w-3 text-blue-300" />
                                    : <Check className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* Message Composer */}
              <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-navy-700 dark:bg-navy-900">
                <form onSubmit={handleSend} className="flex items-end gap-2">
                  <div className="relative flex-1">
                    <textarea
                      ref={inputRef}
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      placeholder="Type a message..."
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend(e);
                        }
                      }}
                      className="h-11 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-royal-500 focus:bg-white focus:ring-2 focus:ring-royal-500/20 dark:border-navy-600 dark:bg-navy-800 dark:text-white dark:focus:bg-navy-800"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-navy-800"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!msgText.trim() || sending}
                    className="h-11 w-11 rounded-xl p-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-slate-50/50 dark:bg-navy-950/50">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-navy-800">
                  <MessageSquare className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900 dark:text-white">Client Messages</h3>
                <p className="mt-1 text-sm text-slate-500">Select a conversation to reply to a client.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
