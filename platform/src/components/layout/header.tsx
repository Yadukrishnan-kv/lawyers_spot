'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Scale, Menu, X, Search, Languages, ChevronDown } from 'lucide-react';
import { useUserSession } from '@/components/auth/user-session-provider';
import { HeaderAuthMenu } from '@/components/layout/header-auth-menu';
import { MegaNavTriggers, MegaMenuPanel, MobileSeoNav, type MegaMenuId } from '@/components/layout/mega-nav';
import { useCms } from '@/lib/cms/context';
import { cn } from '@/lib/utils';

export function Header() {
  const { siteContent, siteConfig } = useCms();
  const { user, loading: sessionLoading } = useUserSession();
  const { utilityNav, mainNav, languages } = siteContent;

  const utilityLinks = utilityNav.filter((item) => {
    if (item.href === '/lawyer-signup' && user?.role === 'lawyer') return false;
    return true;
  });

  const accountHref = sessionLoading
    ? '/login'
    : user?.role === 'lawyer'
      ? '/lawyer-dashboard'
      : user
        ? '/dashboard'
        : '/login';
  const accountLabel =
    sessionLoading ? 'My Account' : user ? user.name.split(' ')[0] : 'My Account';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<MegaMenuId>(null);

  return (
    <header className="sticky top-0 z-50 overflow-visible bg-white shadow-sm dark:bg-navy-950">
      {/* Top utility bar — LawRato style */}
      <div className="hidden border-b border-slate-200 bg-slate-50/90 dark:border-navy-800 dark:bg-navy-900/90 md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-royal-600 dark:text-slate-400"
              aria-expanded={langOpen}
            >
              <Languages className="h-3.5 w-3.5" />
              Languages
              <ChevronDown className={cn('h-3 w-3 transition', langOpen && 'rotate-180')} />
            </button>
            {langOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-navy-700 dark:bg-navy-800">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className="block w-full px-4 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-navy-700"
                    onClick={() => setLangOpen(false)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
            {utilityLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap font-medium text-slate-600 transition hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
              >
                {item.label}
              </Link>
            ))}
            <HeaderAuthMenu className="ml-2 hidden lg:flex" />
          </nav>
        </div>
      </div>

      {/* Main navigation bar — relative container for full-width mega menu */}
      <div
        className="relative border-b border-slate-200 dark:border-navy-800"
        onMouseLeave={() => setMegaOpen(null)}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 flex-col">
            <span className="font-display text-2xl font-extrabold tracking-tight">
              <span className="text-emerald-600">LAWYER</span>
              <span className="text-royal-600">SPOT</span>
            </span>
            <span className="text-[10px] font-medium tracking-wide text-slate-500 sm:text-xs">
              {siteConfig.tagline}
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-end gap-1 lg:flex">
            <MegaNavTriggers open={megaOpen} setOpen={setMegaOpen} />
            {mainNav.filter((n) => !n.mega).map((item) => {
              const isAccount = item.href === '/dashboard';
              return (
                <Link
                  key={item.href}
                  href={isAccount ? accountHref : item.href}
                  className="whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:text-royal-600 dark:text-slate-200"
                >
                  {isAccount ? accountLabel : item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="ml-2 flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wide text-emerald-600 hover:text-emerald-700"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>

          <button
            className="rounded-lg p-2 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Full-width mega menu — all 3 columns visible */}
        <MegaMenuPanel open={megaOpen} />

        {/* Search bar dropdown */}
        {searchOpen && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 dark:border-navy-800 dark:bg-navy-900">
            <form action="/search" className="mx-auto flex max-w-2xl gap-2">
              <input
                name="q"
                placeholder="Search lawyers, legal topics, IPC sections..."
                className="h-10 flex-1 rounded-lg border border-slate-200 px-4 text-sm dark:border-navy-700 dark:bg-navy-800"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-5 text-sm font-bold uppercase text-white hover:bg-emerald-700"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      <div className={cn('border-t lg:hidden', !mobileOpen && 'hidden')}>
        <nav className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 p-3 dark:border-navy-800 dark:bg-navy-900">
          <p className="px-2 text-[10px] font-bold uppercase text-slate-400">Quick links</p>
          {utilityLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="px-3 py-2">
            <HeaderAuthMenu />
          </div>
        </nav>
        <div className="p-3">
          <p className="px-2 pb-2 text-[10px] font-bold uppercase text-slate-400">Main menu</p>
          <Link
            href="/lawyers"
            className="block rounded-lg px-3 py-2.5 text-sm font-bold uppercase tracking-wide"
            onClick={() => setMobileOpen(false)}
          >
            Find A Lawyer
          </Link>
          <Link
            href="/qa"
            className="block rounded-lg px-3 py-2.5 text-sm font-bold uppercase tracking-wide"
            onClick={() => setMobileOpen(false)}
          >
            Legal Advice
          </Link>
          {mainNav.filter((n) => !n.mega).map((item) => {
            const isAccount = item.href === '/dashboard';
            return (
              <Link
                key={item.href}
                href={isAccount ? accountHref : item.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-bold uppercase tracking-wide"
                onClick={() => setMobileOpen(false)}
              >
                {isAccount ? accountLabel : item.label}
              </Link>
            );
          })}
          <Link
            href="/search"
            className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold uppercase text-emerald-600"
            onClick={() => setMobileOpen(false)}
          >
            <Search className="h-4 w-4" /> Search
          </Link>
        </div>
        <MobileSeoNav onNavigate={() => setMobileOpen(false)} />
      </div>
    </header>
  );
}
