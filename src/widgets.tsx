import { useEffect, useState, type ReactNode } from 'react';
import { HOTELS, ITINERARY, MEMORY, OPTIONS, TRAVELLERS, WEEKENDS, type Traveller } from './data';
import { costPP, fmt, fmtK, rankOptions, type Ranked } from './engine';
import { useStore } from './store';
import { AnimatedNumber, Avatar, AvatarStack, I, J, Photo, Ring } from './ui';

const T = (id: string) => TRAVELLERS.find((t) => t.id === id)!;
const joinedMembers = (ids: string[]) => TRAVELLERS.filter((t) => ids.includes(t.id));
const PHOTO_KEY: Record<string, string> = { chik: 'chikmagalur', coorg: 'coorg', pondy: 'pondicherry' };

/* One card anatomy for every generated UI: label → headline → content → actions */
function Card({ icon, label, title, children, tone, className = '' }: { icon?: ReactNode; label: string; title?: ReactNode; children?: ReactNode; tone?: 'mem' | 'warn'; className?: string }) {
  return (
    <div className={`card gen ${tone ? 'tone-' + tone : ''} ${className}`}>
      <div className="eyebrow">{icon ?? I.spark}<span>{label}</span></div>
      {title && <h4 className="c-title">{title}</h4>}
      {children}
    </div>
  );
}

function CopyBtn({ onCopy }: { onCopy: () => void }) {
  const [done, setDone] = useState(false);
  return <button className={'link-btn' + (done ? ' done' : '')} onClick={() => { onCopy(); setDone(true); setTimeout(() => setDone(false), 1800); }}>{done ? <>{I.check} Copied</> : 'Copy'}</button>;
}
function NudgeBtn({ onNudge }: { onNudge: () => void }) {
  const [sent, setSent] = useState(false);
  return <button className={'mini-btn' + (sent ? ' sent' : '')} disabled={sent} onClick={() => { onNudge(); setSent(true); }}>{sent ? <>{I.check} Sent</> : 'Nudge'}</button>;
}

/* ---------- 02 · Trip brief ---------- */
export function BriefCard() {
  const { s, set, act, step } = useStore();
  const [edit, setEdit] = useState(false);
  const locked = step !== 'brief';
  const tooLow = s.budget < 9000;
  const facts = [
    { i: J.pin, k: 'From', v: 'Bengaluru' },
    { i: J.users, k: 'Group', v: `${s.people}` },
    { i: J.cal, k: 'Days', v: `${s.nights + 1}D/${s.nights}N` },
  ];
  const vibe: Record<string, ReactNode> = { Nature: J.leaf, Food: J.food, 'Some adventure': J.mountain, 'No overnight travel': J.moon, 'Destination: flexible': J.pin };
  return (
    <Card label="Trip brief" title="Here’s what I understood">
      <div className="facts">
        {facts.map((f) => <div key={f.k} className="fact"><span className="f-ic">{f.i}</span><span className="f-v">{f.v}</span><span className="f-k">{f.k}</span></div>)}
        <button className={'fact edit' + (edit ? ' on' : '') + (tooLow ? ' bad' : '')} disabled={locked} onClick={() => setEdit(!edit)} aria-label="Edit budget">
          <span className="f-ic">{J.wallet}</span><span className="f-v">{fmtK(s.budget)}</span><span className="f-k">Each {I.edit}</span>
        </button>
      </div>
      {edit && !locked && <input className="slider" type="range" min={6000} max={25000} step={500} value={s.budget} onChange={(e) => set({ budget: +e.target.value })} aria-label="Budget per person" />}
      {tooLow && !locked && (
        <div className="state warn">
          <span className="st-ic">{I.warn}</span>
          <div><b>Nothing fits {fmtK(s.budget)} for 3 days</b><span>Cheapest real option is ₹10.8K</span>
            <div className="chips"><button className="chip act" onClick={() => set({ nights: 1, budget: 8500 })}>Try 2 days</button><button className="chip act" onClick={() => set({ budget: 11000 })}>Use ₹11K</button></div>
          </div>
        </div>
      )}
      <div className="chips">
        {s.chips.map((c) => (
          <span key={c.id} className={'chip' + (c.hard ? ' hard' : '')}>
            <span className="chip-ic">{c.hard ? I.lock : vibe[c.label] ?? J.heart}</span>{c.label.replace('Destination: flexible', 'Anywhere')}
            {!locked && <button className="chip-x" onClick={() => set({ chips: s.chips.filter((x) => x.id !== c.id) })} aria-label={`Remove ${c.label}`}>{I.x}</button>}
          </span>
        ))}
      </div>
      <div className="divider" />
      <div className="q">When in December?</div>
      <div className="seg-pills">
        {[{ v: 'group', l: 'Group decides' }, ...WEEKENDS.map((w) => ({ v: w.label, l: w.label.replace('Dec ', '') }))].map((o) => (
          <button key={o.v} disabled={locked} className={s.dates === o.v ? 'on' : ''} onClick={() => set({ dates: o.v })}>{o.l}</button>
        ))}
      </div>
      {!locked && <button className="cta" disabled={tooLow} onClick={() => act('createRoom')}>Create Trip Room</button>}
    </Card>
  );
}

/* ---------- 03 · Trip Room ---------- */
export function RoomCard() {
  const { s, act, toast, step } = useStore();
  const joined = s.joined.length;
  return (
    <Card label="Trip Room" title="Dec Escape · Gang of 6">
      <div className="seats">
        {TRAVELLERS.map((t, i) => {
          const inn = s.joined.includes(t.id);
          return (
            <div key={t.id} className={'seat' + (inn ? ' in' : '')} style={{ animationDelay: i * 60 + 'ms' }}>
              {inn ? <Avatar t={t} size={40} /> : <span className="seat-empty" />}
              {inn && <span className="seat-ok">{I.check}</span>}
              <small>{inn ? (t.id === 'you' ? 'You' : t.name) : t.status === 'pending' && joined > 1 ? 'Waiting' : ''}</small>
            </div>
          );
        })}
      </div>
      <div className="progress-bar"><i style={{ width: (joined / 6) * 100 + '%' }} /></div>
      <div className="linkbox">{I.link}<span>mmt.link/trip/dec-gang6</span><CopyBtn onCopy={() => toast('Invite link copied')} /></div>
      {step === 'room' && (
        <>
          <button className="cta wa" onClick={() => act('share')}>{I.whatsapp} Share to WhatsApp</button>
          <p className="hint">Friends reply on WhatsApp. No app needed.</p>
        </>
      )}
    </Card>
  );
}

/* Member contributions — voice note, reel or text */
export function Contribution({ data }: { data: any }) {
  const t = T(data.who);
  const kind = data.type === 'voice' ? 'Voice note' : data.type === 'reel' ? 'Reel' : 'Message';
  return (
    <div className="contrib">
      <Avatar t={t} size={32} />
      <div className="contrib-body">
        <div className="who"><b>{t.name}</b><span className="via">{I.whatsapp} {kind}</span></div>
        {data.type === 'voice' && <div className="voice-note"><span className="play">{I.play}</span><span className="wave">{Array.from({ length: 20 }).map((_, i) => <i key={i} style={{ height: 4 + ((i * 37) % 14) }} />)}</span><span className="dur">0:14</span></div>}
        {data.type === 'reel' && <div className="reel"><Photo k="trek" hue={['#264653', '#8AB17D']} h={64} /><span><span className="insta">{I.insta} Instagram</span>Sunrise trek 🌄</span></div>}
        {data.type === 'text' && <p className="msg">{data.text}</p>}
        <div className="extracted"><span className="ex-l">{I.spark}</span>{data.extracted.map((e: string, i: number) => <span key={e} className="chip tiny pop" style={{ animationDelay: 200 + i * 90 + 'ms' }}>{e}</span>)}</div>
      </div>
    </div>
  );
}

/* ---------- 04 · Group picture ---------- */
export function GroupSummary() {
  const { s, act, toast, step } = useStore();
  const [tab, setTab] = useState<'dates' | 'budget'>('dates');
  const members = joinedMembers(s.joined);
  return (
    <Card label={`Group · ${members.length} of 6 replied`} title={tab === 'dates' ? 'Dec 19–21 works for everyone' : 'Budgets range ₹11K–18K'}>
      <div className="seg">
        <button className={tab === 'dates' ? 'on' : ''} onClick={() => setTab('dates')}>{J.cal} Dates</button>
        <button className={tab === 'budget' ? 'on' : ''} onClick={() => setTab('budget')}>{J.wallet} Budget</button>
      </div>
      {tab === 'dates' ? (
        <div className="cal">
          {WEEKENDS.map((w, wi) => {
            const all = members.every((m) => m.dates?.includes(w.id));
            return (
              <div key={w.id} className={'cal-row' + (all ? ' best' : '')}>
                <span className="cal-label">{w.label}</span>
                <span className="cal-cells">{members.map((m, i) => <span key={m.id} className={'cell ' + (m.dates?.includes(w.id) ? 'y' : 'n')} style={{ animationDelay: (wi * 5 + i) * 30 + 'ms' }} title={m.name}>{m.dates?.includes(w.id) ? <Avatar t={m} size={26} /> : ''}</span>)}</span>
                {all && <span className="cal-ok">{I.check}</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="budgets">
          <div className="b-axis"><span>₹10K</span><span>₹15K</span><span>₹20K</span></div>
          <div className="b-track">{members.map((m) => <span key={m.id} className="b-dot" style={{ left: ((m.budget! - 10000) / 10000) * 100 + '%' }} title={`${m.name} ${fmtK(m.budget!)}`}><Avatar t={m} size={28} /></span>)}<span className="b-zone" style={{ left: '0%', width: '10%' }} /></div>
          <p className="hint">I’ll plan around ₹11K first so nobody is priced out.</p>
        </div>
      )}
      <div className="pills2">
        <div className="p2 good"><span>{I.check}</span><b>Agree</b><small>Nature · daytime travel</small></div>
        <div className="p2 bad"><span>{J.bolt}</span><b>Clash</b><small>Bus vs train · budget</small></div>
      </div>
      <div className="pending-row"><Avatar t={T('dev')} size={28} ring="pending" /><span><b>Dev</b> hasn’t replied. Not counted as a yes.</span><NudgeBtn onNudge={() => toast('Reminder sent to Dev on WhatsApp')} /></div>
      {step === 'summary' && <button className="cta" onClick={() => act('toMemory')}>Find trips for Dec 19–21</button>}
    </Card>
  );
}

/* ---------- 05a · Cross-trip memory ---------- */
const PREF_IC: Record<string, ReactNode> = { Stay: J.home, Location: J.pin, Travel: J.sun, Activities: J.coffee, Pace: J.leaf, Budget: J.wallet };
export function MemoryCard() {
  const { s, act } = useStore();
  const [who, setWho] = useState('meera');
  const m = MEMORY[who];
  return (
    <Card tone="mem" icon={I.brain} label="Myra Memory" title={<>Meera and Kabir have planned with Myra before</>}>
      <div className="seg small">
        {['meera', 'kabir'].map((id) => <button key={id} className={who === id ? 'on' : ''} onClick={() => setWho(id)}><Avatar t={T(id)} size={20} /> {T(id).name}</button>)}
      </div>
      <div className="pref-grid" key={who}>
        {m.items.slice(0, 4).map((i, idx) => <div key={i.value} className="pref" style={{ animationDelay: idx * 60 + 'ms' }}><span className="pref-ic">{PREF_IC[i.cat] ?? J.heart}</span><span>{i.value}</span></div>)}
      </div>
      <div className="privacy-line">{I.lock}<span>Only preferences carry over, never chats. This trip’s rules always win.</span></div>
      {s.memory === 'ask' && (
        <div className="row-btns">
          <button className="cta" onClick={() => act('askMemory')}>Ask them</button>
          <button className="ghost" onClick={() => act('skipMemory')}>Skip</button>
        </div>
      )}
      {s.memory === 'asked' && <div className="status-line"><span className="spin" /> Waiting for Meera and Kabir…</div>}
      {s.memory === 'granted' && <div className="status-line ok"><span className="draw-check">{I.check}</span> Both said yes</div>}
      {s.memory === 'declined' && <div className="status-line">Planning without memory</div>}
    </Card>
  );
}

/* ---------- Loading: Myra's existing "Working on…" pattern, with real steps ---------- */
const STEPS = ['Reading 5 people’s preferences', 'Checking 23 places within 7 hrs', 'Dropping 9 that need overnight travel', 'Pricing Dec 19–21', 'Applying saved preferences', 'Scoring each trip for each person'];
export function Progress({ data }: { data: any }) {
  const steps = data.memory ? STEPS : STEPS.filter((x) => !x.includes('saved'));
  const [n, setN] = useState(0);
  useEffect(() => { if (n >= steps.length) return; const id = setTimeout(() => setN(n + 1), 600); return () => clearTimeout(id); }, [n]);
  const busy = n < steps.length;
  return <StatusCard title={busy ? 'Planning for your group…' : 'Done · 3 trips scored for 5 people'} busy={busy} defaultOpen={busy}
    steps={steps.map((st, i) => ({ label: st, state: i < n ? 's-done' : i === n ? 'now' : 'todo' }))} skeleton={busy} />;
}
export function StatusCard({ title, busy, steps, defaultOpen, skeleton }: { title: string; busy?: boolean; steps: { label: string; state: string }[]; defaultOpen?: boolean; skeleton?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  useEffect(() => { if (!busy && defaultOpen) { const id = setTimeout(() => setOpen(false), 900); return () => clearTimeout(id); } }, [busy]);
  return (
    <div className={'status-card' + (busy ? ' glow-ring' : '')}>
      <button className="sc-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className={'sc-spark' + (busy ? ' spinning' : '')}>{I.spark}</span><b>{title}</b><span className={'sc-chev' + (open ? ' up' : '')}>{I.chev}</span>
      </button>
      <div className={'sc-body' + (open ? ' open' : '')}>
        <ul className="sc-steps">{steps.map((st) => <li key={st.label} className={st.state}><span className="tick">{st.state === 's-done' ? I.check : st.state === 'now' ? <span className="spin" /> : null}</span>{st.label}</li>)}</ul>
      </div>
      {skeleton && <div className="skeleton"><span /><span /></div>}
    </div>
  );
}

/* ---------- 05b · Complete trips ---------- */
export function OptionsCard() {
  const { s, act, openSheet, step } = useStore();
  const ranked = rankOptions(OPTIONS, s.memory === 'granted');
  return (
    <div className="gen-wide">
      <div className="carousel">{ranked.map((r, i) => <OptionTile key={r.o.id} r={r} best={i === 0} i={i} onWhy={() => openSheet('why', r)} />)}</div>
      {step === 'options' && <div className="pad"><button className="cta" onClick={() => act('startVote')}>Send all 3 to a group vote</button></div>}
    </div>
  );
}
function OptionTile({ r, best, i, onWhy }: { r: Ranked; best: boolean; i: number; onWhy: () => void }) {
  const { o } = r;
  const modeIc = o.transport.mode === 'bus' ? J.bus : o.transport.mode === 'train' ? J.train : J.van;
  return (
    <div className={'opt' + (best ? ' glow-ring' : '')} style={{ animationDelay: i * 90 + 'ms' }}>
      <Photo k={PHOTO_KEY[o.id]} hue={o.hue} h={150}>
        {best && <span className="badge best">{I.star} Best fit</span>}
        <div className="opt-over"><div><b>{o.dest}</b><small>{o.region.split(' · ')[1]} away</small></div><Ring value={r.groupScore} /></div>
      </Photo>
      <div className="opt-body">
        <div className="opt-price"><b>{fmt(r.cost)}</b><span>per person</span></div>
        <div className="icon-facts">
          <span>{modeIc}{o.transport.duration.split(',')[0]} by day</span>
          <span>{J.home}{o.stay.type === 'boutique' ? 'Boutique' : 'Homestay'}</span>
          <span>{J.mountain}{o.activities[0].name.split(' ').slice(-2).join(' ')}</span>
        </div>
        <div className="afford">
          <AvatarStack list={r.fits.map((f) => f.t)} size={22} />
          <span className={r.canAfford === 5 ? 'ok' : 'warn'}>{r.canAfford === 5 ? I.check : I.warn} {r.canAfford}/5 can afford</span>
        </div>
        <button className="why" onClick={onWhy}>Why this? {J.arrow}</button>
      </div>
    </div>
  );
}
export function WhySheet({ r }: { r: Ranked }) {
  return (
    <div className="why-sheet">
      <div className="why-head"><Photo k={PHOTO_KEY[r.o.id]} hue={r.o.hue} h={88} label={r.o.dest} /><p className="hint">Scored in 3 layers: each person → the group → this trip’s rules. Simulated scoring.</p></div>
      {r.fits.map((f, i) => (
        <div key={f.t.id} className="why-row" style={{ animationDelay: i * 60 + 'ms' }}>
          <Avatar t={f.t} size={32} />
          <div className="why-body">
            <div className="why-top"><b>{f.t.name}</b><span className="bar"><i style={{ width: f.score + '%' }} /></span><span className="why-n">{f.score}</span></div>
            <div className="why-tags">
              {f.reasons.slice(0, 2).map((x) => <span key={x} className="wt ok">{I.check}{x}</span>)}
              {f.concerns.slice(0, 1).map((x) => <span key={x} className="wt no">{I.warn}{x}</span>)}
              {f.memoryUsed && <span className="wt mem">{I.brain}Saved preference</span>}
            </div>
          </div>
        </div>
      ))}
      <p className="trade">{I.info}<span><b>Trade-off:</b> {r.o.tradeoff}</span></p>
    </div>
  );
}

/* ---------- 06 · Vote ---------- */
export function VoteCard() {
  const { s, set, act, step } = useStore();
  const ranked = rankOptions(OPTIONS, s.memory === 'granted');
  const voters = joinedMembers(s.joined);
  const counts: Record<string, Traveller[]> = {};
  voters.forEach((v) => { const o = v.id === 'you' ? s.myVote : s.votes[v.id]; if (o) (counts[o] ||= []).push(v); });
  const voted = voters.filter((v) => (v.id === 'you' ? s.myVote : s.votes[v.id])).length;
  const done = voted === voters.length;
  return (
    <Card label={`Group vote · ${voted}/${voters.length}`} title={!s.myVote ? 'Where should we go?' : done ? 'Chikmagalur wins 4–1' : 'Votes coming in…'}>
      {ranked.map((r) => {
        const c = counts[r.o.id] || [];
        const lead = done && r.o.id === 'chik';
        return (
          <button key={r.o.id} className={'vote-row' + (s.myVote === r.o.id ? ' mine' : '') + (lead ? ' lead' : '')} disabled={!!s.myVote || step !== 'vote'} onClick={() => { set({ myVote: r.o.id }); act('voted', r.o.id); }}>
            <div className="vote-fill" style={{ width: (c.length / voters.length) * 100 + '%' }} />
            <span className="vote-thumb"><Photo k={PHOTO_KEY[r.o.id]} hue={r.o.hue} h={40} /></span>
            <span className="vote-name">{r.o.dest}<small>{fmtK(r.cost)}</small></span>
            <AvatarStack list={c} size={22} />
            {lead && <span className="crown">{I.check}</span>}
          </button>
        );
      })}
      <p className="hint">{!s.myVote ? 'Tap to vote. Everyone sees the votes.' : 'Dev hasn’t voted, so he isn’t counted.'}</p>
    </Card>
  );
}

export function CompromiseCard() {
  const { s, act } = useStore();
  return (
    <Card tone="warn" icon={J.bolt} label="One clash left" title="Bus or train? Here’s a middle path">
      <div className="clash">
        <div className="cl-side"><Avatar t={T('rohan')} size={36} /><span className="cl-ic">{J.bus}</span><small>Cheapest</small></div>
        <div className="cl-mid"><span className="cl-arrow">{J.arrow}</span></div>
        <div className="cl-pick"><span className="cl-ic big">{J.van}</span><b>Tempo traveller</b><small>{fmt(2100)} each</small></div>
        <div className="cl-mid"><span className="cl-arrow flip">{J.arrow}</span></div>
        <div className="cl-side"><Avatar t={T('meera')} size={36} /><span className="cl-ic">{J.train}</span><small>Daytime</small></div>
      </div>
      <div className="checks">
        <span>{I.check} Daytime, door to door <i>Meera</i></span>
        <span>{I.check} ₹300 cheaper than train <i>Rohan</i></span>
      </div>
      {!s.transportCompromise ? (
        <div className="row-btns"><button className="cta" onClick={() => act('acceptCompromise')}>Propose it</button><button className="ghost" onClick={() => act('keepDiscussing')}>Let them talk</button></div>
      ) : <div className="status-line ok"><span className="draw-check">{I.check}</span> Rohan and Meera agreed</div>}
    </Card>
  );
}

/* ---------- 07 · Shared plan ---------- */
export function useTripCost() {
  const { s } = useStore();
  const o = OPTIONS.find((x) => x.id === (s.chosen || 'chik'))!;
  const h = HOTELS.find((x) => x.id === s.hotelId)!;
  const stay = h.cost + (s.priceChange === 'kept' || s.priceChange === 'shown' ? s.priceBump : 0);
  const pp = costPP(o, stay);
  return { o, h, stay, pp, parts: [
    { k: 'Travel', v: o.transport.cost, c: '#0B1B3F', i: J.van },
    { k: 'Stay', v: stay, c: '#6D4AE0', i: J.home },
    { k: 'Activities', v: o.activityCost, c: '#2F6FE4', i: J.mountain },
    { k: 'Food', v: o.foodCost, c: '#E7A33E', i: J.food },
  ] };
}
export function ItineraryCard() {
  const { openSheet } = useStore();
  const { o, h, pp } = useTripCost();
  return (
    <div className="card gen itin-card">
      <Photo k={PHOTO_KEY[o.id]} hue={o.hue} h={140}>
        <span className="badge lock">{I.lock} Locked by the group</span>
        <div className="opt-over"><div><b>{o.dest}</b><small>Fri 19 to Sun 21 Dec</small></div></div>
      </Photo>
      <div className="itin-sum">
        <div className="itin-cols">
          <div><span className="k">Each</span><b><AnimatedNumber value={pp} format={fmt} /></b></div>
          <div><span className="k">Stay</span><b className="ell">{h.name}</b></div>
        </div>
        <button className="cta" onClick={() => openSheet('itinerary')}>See day-by-day plan</button>
      </div>
    </div>
  );
}
export function ItineraryFull() {
  const { act, step, s } = useStore();
  const { h, pp, parts } = useTripCost();
  const [day, setDay] = useState(0);
  const days = ITINERARY(h.name);
  const icon = (k: string) => (k === 'transport' ? J.van : k === 'stay' ? J.home : k === 'food' ? J.food : J.mountain);
  return (
    <div className="itin-full">
      <div className="seg">{days.map((d, i) => <button key={d.day} className={day === i ? 'on' : ''} onClick={() => setDay(i)}>{d.day}<small>{d.date.split(', ')[0]}</small></button>)}</div>
      <ul className="timeline" key={day}>
        {days[day].items.map((it, i) => (
          <li key={i} className={'tl ' + it.kind} style={{ animationDelay: i * 50 + 'ms' }}>
            <span className="tl-time">{it.time}</span>
            <span className="tl-ic">{icon(it.kind)}</span>
            <div className="tl-body"><b>{it.title}</b>{it.sub && <small>{it.sub}</small>}
              {it.kind === 'stay' && it.title.startsWith('Check in') && <button className="swap" onClick={() => act('swapHotel')}>{I.swap} Replace stay</button>}
            </div>
          </li>
        ))}
      </ul>
      <div className="breakdown">
        <div className="bd-head"><span>Per person</span><b><AnimatedNumber value={pp} format={fmt} /></b></div>
        <div className="stack">{parts.map((p) => <i key={p.k} style={{ flex: p.v, background: p.c }} />)}</div>
        <div className="legend2">{parts.map((p) => <span key={p.k}><i style={{ background: p.c }} />{p.k} <b>{fmtK(p.v)}</b></span>)}</div>
      </div>
      {s.chosen && step !== 'review' && step !== 'done' && <button className="cta" onClick={() => act('toReview')}>Send for group approval</button>}
    </div>
  );
}

/* ---------- Generative UI: stays with cost impact ---------- */
export function HotelsCard() {
  const { s, act, step } = useStore();
  const base = HOTELS[0];
  return (
    <div className="gen-wide">
      <div className="carousel">
        {HOTELS.map((h, i) => {
          const d = h.cost - base.cost;
          const sel = s.hotelId === h.id;
          const key = ['homestay', 'boutique', 'valley', 'resort'][i];
          return (
            <div key={h.id} className={'hotel' + (!h.available ? ' off' : '') + (sel ? ' sel' : '')} style={{ animationDelay: i * 80 + 'ms' }}>
              <Photo k={key} hue={h.hue} h={110}>
                {sel && <span className="badge cur">{I.check} Current</span>}
                {!h.available && <span className="badge sold">Sold out</span>}
                {h.memoryMatch && <span className="badge mem">{I.brain} Meera’s style</span>}
              </Photo>
              <div className="opt-body">
                <b className="h-name">{h.name}</b>
                <div className="icon-facts"><span>{J.pin}{h.dist}</span><span className={h.cancel.startsWith('Free') ? 'good' : 'bad'}>{J.shield}{h.cancel.startsWith('Free') ? 'Free cancellation' : h.available ? 'Non-refundable' : 'Unavailable'}</span></div>
                <div className="impact"><span className="rating">{I.star} {h.rating}</span><span className={'delta ' + (d > 0 ? 'up' : d < 0 ? 'down' : '')}>{d === 0 ? 'Same price' : (d > 0 ? '+' : '−') + fmt(Math.abs(d)) + ' each'}</span></div>
                {h.available ? <button className={sel ? 'ghost sm' : 'cta sm'} disabled={sel || step !== 'hotels'} onClick={() => act('pickHotel', h.id)}>{sel ? 'Selected' : 'Choose'}</button>
                  : <button className="ghost sm" onClick={() => act('soldOut')}>Notify me</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- 08 · Final review ---------- */
export function ReviewCard() {
  const { s, set, act } = useStore();
  const { o, h, pp } = useTripCost();
  const approved = TRAVELLERS.filter((v) => s.approvals[v.id] === 'approved').length;
  if (s.booked) {
    return (
      <div className="card gen done-card">
        <span className="done-ic">{I.check}</span>
        <h4 className="c-title">Payment requests sent</h4>
        <p className="hint">Everyone pays their own share. Dev’s seat is held for 24 hrs.</p>
        <div className="seats tight">{TRAVELLERS.map((t) => <div key={t.id} className="seat in"><Avatar t={t} size={34} ring={s.approvals[t.id] === 'approved' ? 'ok' : 'pending'} /></div>)}</div>
        <p className="fine">Simulated. No real booking made.</p>
      </div>
    );
  }
  return (
    <Card label="Final review" title={`${o.dest} · 19–21 Dec`}>
      <Photo k={PHOTO_KEY[o.id]} hue={o.hue} h={96} />
      <div className="rev-rows">
        <span>{J.van}<b>Tempo traveller</b><small>Day travel both ways</small></span>
        <span>{J.home}<b>{h.name}</b><small>{h.cancel}</small></span>
        <span>{J.mountain}<b>Trek, falls, coffee estate</b><small>Day-wise plan shared</small></span>
      </div>
      {s.priceChange === 'shown' && (
        <div className="state warn">
          <span className="st-ic">{I.warn}</span>
          <div><b>Stay price went up {fmt(s.priceBump)}</b><span>I haven’t changed anything without you.</span>
            <div className="chips"><button className="chip act" onClick={() => set({ priceChange: 'kept' })}>Keep it</button><button className="chip act" onClick={() => set({ priceChange: 'reverted', hotelId: 'h0' })}>Switch back</button></div>
          </div>
        </div>
      )}
      <div className="rev-total"><span>Each</span><b><AnimatedNumber value={pp} format={fmt} /></b><small>Group <AnimatedNumber value={pp * 6} format={fmt} /></small></div>
      <div className="ap-strip">
        {TRAVELLERS.map((t) => <span key={t.id} className={'ap ' + s.approvals[t.id]}><Avatar t={t} size={32} ring={s.approvals[t.id] === 'approved' ? 'ok' : 'pending'} />{s.approvals[t.id] === 'approved' && <i className="ap-ok">{I.check}</i>}</span>)}
        <span className="ap-n">{approved}/6 approved</span>
      </div>
      <button className="cta" disabled={s.priceChange === 'shown' || approved < 5} onClick={() => act('book')}>Continue to booking</button>
    </Card>
  );
}
