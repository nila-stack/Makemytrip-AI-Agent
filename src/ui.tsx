import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Traveller } from './data';

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const I = {
  back: <svg width="22" height="22" viewBox="0 0 24 24" {...P}><path d="M15 18l-6-6 6-6" /></svg>,
  mic: <svg width="22" height="22" viewBox="0 0 24 24" {...P}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>,
  send: <svg width="20" height="20" viewBox="0 0 24 24" {...P}><path d="M5 12h13M13 6l6 6-6 6" /></svg>,
  plus: <svg width="22" height="22" viewBox="0 0 24 24" {...P}><path d="M12 5v14M5 12h14" /></svg>,
  headset: <svg width="20" height="20" viewBox="0 0 24 24" {...P}><path d="M4 14v-2a8 8 0 0116 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></svg>,
  link: <svg width="16" height="16" viewBox="0 0 24 24" {...P}><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" {...P} strokeWidth={3}><path d="M5 12l5 5 9-10" /></svg>,
  x: <svg width="14" height="14" viewBox="0 0 24 24" {...P} strokeWidth={3}><path d="M6 6l12 12M18 6L6 18" /></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
  swap: <svg width="14" height="14" viewBox="0 0 24 24" {...P}><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" /></svg>,
  pin: <svg width="14" height="14" viewBox="0 0 24 24" {...P}><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>,
  edit: <svg width="12" height="12" viewBox="0 0 24 24" {...P}><path d="M4 20h4L19 9l-4-4L4 16v4z" /></svg>,
  chev: <svg width="16" height="16" viewBox="0 0 24 24" {...P}><path d="M6 9l6 6 6-6" /></svg>,
  info: <svg width="14" height="14" viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>,
  lock: <svg width="14" height="14" viewBox="0 0 24 24" {...P}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>,
  brain: <svg width="16" height="16" viewBox="0 0 24 24" {...P}><path d="M12 5a3 3 0 00-5.6-1.5A3 3 0 004 8a3 3 0 00.5 5A3.5 3.5 0 008 19h4V5zM12 5a3 3 0 015.6-1.5A3 3 0 0120 8a3 3 0 01-.5 5A3.5 3.5 0 0116 19h-4" /></svg>,
  warn: <svg width="16" height="16" viewBox="0 0 24 24" {...P}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4M12 17h.01" /></svg>,
  whatsapp: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.4c.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.8-.9c.2-.2.3-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.7-.1 1.3z" /></svg>,
  insta: <svg width="16" height="16" viewBox="0 0 24 24" {...P}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg>,
  play: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z" /></svg>,
  star: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>,
  bus: <svg width="16" height="16" viewBox="0 0 24 24" {...P}><rect x="4" y="3" width="16" height="15" rx="3" /><path d="M4 11h16M8 18v2M16 18v2" /></svg>,
  bed: <svg width="16" height="16" viewBox="0 0 24 24" {...P}><path d="M3 18V7M3 13h18v5M21 13a4 4 0 00-4-4h-6v4" /><circle cx="7" cy="10" r="1.5" /></svg>,
  spark: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" opacity=".7" /></svg>,
  food: <svg width="16" height="16" viewBox="0 0 24 24" {...P}><path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9" /></svg>,
  hike: <svg width="16" height="16" viewBox="0 0 24 24" {...P}><path d="M3 20l6-10 4 6 3-4 5 8z" /></svg>,
};

export function MyraOrb({ size = 32, pulse = false }: { size?: number; pulse?: boolean }) {
  return <span className={'orb' + (pulse ? ' pulse' : '')} style={{ width: size, height: size }} />;
}

const AVATARS = import.meta.glob('./assets/avatars/*.{jpg,png}', { eager: true, import: 'default' }) as Record<string, string>;
const avatarSrc = (id: string) => Object.entries(AVATARS).find(([p]) => p.split('/').pop()!.split('.')[0] === id)?.[1];
export function Avatar({ t, size = 28, ring }: { t: Traveller; size?: number; ring?: 'ok' | 'pending' | 'no' }) {
  const src = avatarSrc(t.id);
  return (
    <span className={'av ' + (ring ? 'ring-' + ring : '') + (src ? ' has-img' : '')} style={{ width: size, height: size, background: src ? '#FBEFE8' : t.color, fontSize: size * 0.42 }} title={t.name}>
      {src ? <img src={src} alt={t.name} /> : (t.id === 'you' ? 'Y' : t.short)}
    </span>
  );
}

export function AvatarStack({ list, size = 24 }: { list: Traveller[]; size?: number }) {
  return <span className="avstack">{list.map((t) => <Avatar key={t.id} t={t} size={size} />)}</span>;
}

export function Sheet({ open, onClose, title, children, tall }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; tall?: boolean }) {
  return (
    <div className={'sheet-wrap' + (open ? ' open' : '')} onClick={onClose}>
      <div className={'sheet' + (tall ? ' tall' : '')} onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        {title && <div className="sheet-title">{title}<button className="icon-btn" onClick={onClose} aria-label="Close">{I.x}</button></div>}
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

export function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  const [flash, setFlash] = useState<'' | 'up' | 'down'>('');
  useEffect(() => {
    const from = prev.current; const to = value; prev.current = value;
    if (from === to) return;
    setFlash(to > from ? 'up' : 'down');
    const start = performance.now(); const dur = 600;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(from + (to - from) * e));
      if (p < 1) raf = requestAnimationFrame(tick); else setTimeout(() => setFlash(''), 700);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={'num ' + (flash ? 'flash-' + flash : '')}>{format(shown)}</span>;
}

export function Typing() {
  return <div className="typing"><MyraOrb size={22} pulse /><span className="dots"><i /><i /><i /></span></div>;
}

export function DestArt({ hue, label, h = 96 }: { hue: [string, string]; label?: string; h?: number }) {
  return (
    <div className="art" style={{ height: h, background: `linear-gradient(160deg, ${hue[1]}, ${hue[0]})` }}>
      <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="art-svg">
        <path d="M0 70 L60 35 L100 60 L160 20 L220 55 L260 38 L300 60 L300 100 L0 100Z" fill="rgba(255,255,255,.18)" />
        <path d="M0 85 L50 62 L110 80 L170 55 L240 78 L300 66 L300 100 L0 100Z" fill="rgba(0,0,0,.18)" />
        <circle cx="245" cy="24" r="10" fill="rgba(255,255,255,.55)" />
      </svg>
      {label && <span className="art-label">{label}</span>}
    </div>
  );
}

/* ---------- photos: any file dropped in assets/photos/<key>.(jpg|png|webp) is used automatically ---------- */
const PHOTO_FILES = import.meta.glob('./assets/photos/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }) as Record<string, string>;
export function photo(key: string): string | undefined {
  const hit = Object.entries(PHOTO_FILES).find(([p]) => p.split('/').pop()!.split('.')[0] === key);
  return hit?.[1];
}
export function Photo({ k, hue, h = 120, label, children }: { k: string; hue: [string, string]; h?: number; label?: string; children?: ReactNode }) {
  const src = photo(k);
  return (
    <div className="photo" style={{ height: h, background: `linear-gradient(160deg, ${hue[1]}, ${hue[0]})` }}>
      {src ? <img src={src} alt={label || k} /> : (
        <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="art-svg">
          <path d="M0 70 L60 35 L100 60 L160 20 L220 55 L260 38 L300 60 L300 100 L0 100Z" fill="rgba(255,255,255,.18)" />
          <path d="M0 85 L50 62 L110 80 L170 55 L240 78 L300 66 L300 100 L0 100Z" fill="rgba(0,0,0,.18)" />
          <circle cx="245" cy="24" r="10" fill="rgba(255,255,255,.55)" />
        </svg>
      )}
      <div className="photo-shade" />
      {label && <span className="photo-label">{label}</span>}
      {children}
    </div>
  );
}

const Q = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const J = {
  users: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M21.5 20a6 6 0 00-4-5.7" /></svg>,
  cal: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>,
  wallet: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M3 7a2 2 0 012-2h13v4" /><rect x="3" y="7" width="18" height="13" rx="2" /><circle cx="16.5" cy="13.5" r="1.2" fill="currentColor" /></svg>,
  pin: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>,
  van: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M3 16V7a2 2 0 012-2h10l5 5v6" /><path d="M3 16h18M14 5v5h6" /><circle cx="7.5" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" /></svg>,
  train: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><rect x="5" y="3" width="14" height="14" rx="3" /><path d="M5 10h14M8 21l2-4M16 21l-2-4" /><circle cx="9" cy="13.5" r=".8" fill="currentColor" /><circle cx="15" cy="13.5" r=".8" fill="currentColor" /></svg>,
  bus: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><rect x="4" y="3" width="16" height="15" rx="3" /><path d="M4 11h16M8 18v2M16 18v2" /></svg>,
  home: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1z" /></svg>,
  mountain: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M2 20l7-12 4 6 3-4 6 10z" /></svg>,
  leaf: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15" /><path d="M5 19l7-7" /></svg>,
  food: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9" /></svg>,
  sun: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>,
  coffee: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M4 8h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5z" /><path d="M17 10h1.5a2.5 2.5 0 010 5H17M8 2v3M12 2v3" /></svg>,
  moon: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" /></svg>,
  bolt: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>,
  heart: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" /></svg>,
  arrow: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  shield: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>,
  beach: <svg width="18" height="18" viewBox="0 0 24 24" {...Q}><path d="M3 20h18M12 20V9M5 9a7 7 0 0114 0z" /></svg>,
};

export function Confetti({ run }: { run: number }) {
  if (!run) return null;
  const colors = ['#2F6FE4', '#5AA9F0', '#F59E0B', '#1E9E6A', '#E5484D', '#BB6BD9'];
  return (
    <div className="confetti" key={run}>
      {Array.from({ length: 36 }).map((_, i) => (
        <i key={i} style={{ left: (i * 37) % 100 + '%', background: colors[i % colors.length], animationDelay: (i % 9) * 0.04 + 's', transform: `rotate(${i * 23}deg)`, ['--x' as any]: ((i * 53) % 120 - 60) + 'px' }} />
      ))}
    </div>
  );
}

export function Ring({ value, size = 44 }: { value: number; size?: number }) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  return (
    <span className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}><circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.35)" strokeWidth="4" fill="none" />
        <circle className="ring-v" cx={size / 2} cy={size / 2} r={r} stroke="#fff" strokeWidth="4" fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} /></svg>
      <b>{value}</b>
    </span>
  );
}
