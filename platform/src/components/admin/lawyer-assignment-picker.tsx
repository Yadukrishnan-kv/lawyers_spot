'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ChevronDown, Search, X, Users, Check } from 'lucide-react';

type Lawyer = { id: string; name: string; practice?: string };

type Props = {
  articleSlug: string;
  allLawyers: Lawyer[];
  initialSelected?: string[];
  onChange?: (lawyerIds: string[]) => void;
};

const primary = '#6259ca';
const border = '#d1d5db';
const borderLight = '#e9ecef';
const text = '#282f53';
const muted = '#9ca3af';
const gray = '#6c757d';
const bg = '#fff';
const bgAlt = '#f8f9fa';

export function LawyerAssignmentPicker({ articleSlug, allLawyers, initialSelected = [], onChange }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelected(new Set(initialSelected));
  }, [initialSelected]);

  function updatePosition() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }

  useEffect(() => {
    if (!open) { setDropdownPos(null); return; }
    updatePosition();
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onScroll() { updatePosition(); }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const filtered = allLawyers.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.name.toLowerCase().includes(q) || (l.practice && l.practice.toLowerCase().includes(q));
  });

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setMessage('');
  }, []);

  const removeSelected = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setMessage('');
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/articles/lawyers/${encodeURIComponent(articleSlug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lawyerIds: [...selected] }),
      });
      if (!res.ok) throw new Error('Failed');
      setMessage('Saved');
      onChange?.([...selected]);
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setMessage('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [articleSlug, selected, onChange]);

  const selectedLawyers = allLawyers.filter((l) => selected.has(l.id));
  const hasChanges = JSON.stringify([...selected].sort()) !== JSON.stringify([...initialSelected].sort());

  const triggerBtnStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '5px 10px',
    fontSize: 13,
    fontWeight: 500,
    color: '#495057',
    background: bg,
    border: `1px solid ${open ? primary : border}`,
    borderRadius: '0.375rem',
    cursor: saving ? 'not-allowed' : 'pointer',
    boxShadow: open ? `0 0 0 2px rgba(98,89,202,0.15)` : 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    textAlign: 'left',
    opacity: saving ? 0.6 : 1,
  };

  return (
    <div style={{ position: 'relative', minWidth: 180 }}>
      {/* Trigger */}
      <button ref={triggerRef} type="button" onClick={() => setOpen(!open)} disabled={saving} style={triggerBtnStyle}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Users style={{ width: 14, height: 14, flexShrink: 0, color: gray }} />
          {selectedLawyers.length === 0 ? (
            <span style={{ color: muted }}>Assign lawyers</span>
          ) : (
            <span>{selectedLawyers.length} lawyer{selectedLawyers.length !== 1 ? 's' : ''}</span>
          )}
        </span>
        <ChevronDown style={{ width: 14, height: 14, flexShrink: 0, color: gray, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {/* Selected badges */}
      {selectedLawyers.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {selectedLawyers.map((l) => (
            <span key={l.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontSize: 11, fontWeight: 500, color: primary, background: 'rgba(98,89,202,0.08)', border: '1px solid rgba(98,89,202,0.18)', borderRadius: 9999, lineHeight: '1.4', whiteSpace: 'nowrap' }}>
              {l.name}
              <button type="button" onClick={() => removeSelected(l.id)} style={{ display: 'inline-flex', alignItems: 'center', padding: 0, border: 'none', background: 'none', color: primary, cursor: 'pointer', opacity: 0.6, lineHeight: 1 }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown — fixed positioned so it escapes table overflow */}
      {open && dropdownPos && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 9999,
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: '0.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderBottom: `1px solid ${borderLight}`, background: bgAlt }}>
            <Search style={{ width: 14, height: 14, color: muted, flexShrink: 0 }} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search lawyers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: '4px 0', fontSize: 13, border: 'none', background: 'transparent', outline: 'none', color: text }}
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, padding: 0, border: 'none', background: borderLight, borderRadius: '50%', color: gray, cursor: 'pointer', lineHeight: 1 }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 220, overflowY: 'auto', overflowX: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: muted }}>No lawyers found</div>
            ) : (
              filtered.map((l) => {
                const checked = selected.has(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => toggle(l.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      borderBottom: '1px solid #f3f4f6',
                      background: checked ? 'rgba(98,89,202,0.06)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = '#f5f3ff'; }}
                    onMouseLeave={(e) => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${checked ? primary : border}`, borderRadius: 3, background: checked ? primary : bg, transition: 'all 0.15s' }}>
                      {checked && <Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} />}
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</span>
                      {l.practice && <span style={{ fontSize: 11, color: muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.practice}</span>}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {hasChanges && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, padding: '8px 10px', borderTop: `1px solid ${borderLight}`, background: bgAlt }}>
              <button
                type="button"
                onClick={() => { setSelected(new Set(initialSelected)); setOpen(false); setMessage(''); }}
                disabled={saving}
                style={{ padding: '4px 14px', fontSize: 12, fontWeight: 600, borderRadius: '0.25rem', cursor: saving ? 'not-allowed' : 'pointer', border: `1px solid ${border}`, background: bg, color: gray, opacity: saving ? 0.6 : 1 }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                style={{ padding: '4px 14px', fontSize: 12, fontWeight: 600, borderRadius: '0.25rem', cursor: saving ? 'not-allowed' : 'pointer', border: `1px solid ${primary}`, background: primary, color: '#fff', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status message */}
      {message && (
        <div style={{ marginTop: 4, fontSize: 11, fontWeight: 500, color: message === 'Saved' ? '#16a34a' : '#dc2626' }}>
          {message}
        </div>
      )}
    </div>
  );
}
