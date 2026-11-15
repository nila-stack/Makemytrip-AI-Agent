import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { MEMORY, ROOMS, TRAVELLERS } from './data';
import { StoreCtx, type Msg, type Step, type TripState } from './store';
import { Avatar, AvatarStack, I, Sheet, Typing } from './ui';
import homeImg from './assets/mmt-home.jpg';
import logoImg from './assets/myra-logo.png';
import {
  BriefCard, CompromiseCard, Contribution, GroupSummary, HotelsCard, ItineraryCard, ItineraryFull, MemoryCard,
  OptionsCard, Progress, ReviewCard, RoomCard, StatusCard, VoteCard, WhySheet,
} from './widgets';

const INITIAL: TripState = {
  budget: 15000, dates: 'group', nights: 2, people: 6,
  chips: [
    { id: 'c1', label: 'No overnight travel', hard: true },
    { id: 'c2', label: 'Nature' }, { id: 'c3', label: 'Food' }, { id: 'c4', label: 'Some adventure' },
    { id: 'c5', label: 'Destination: flexible' },
  ],
  joined: ['you'], memory: 'ask', votes: {}, myVote: null, chosen: null, transportCompromise: false,
  hotelId: 'h0', priceBump: 0, priceChange: 'none',
  approvals: Object.fromEntries(TRAVELLERS.map((t) => [t.id, 'pending'])) as TripState['approvals'], booked: false,
};

const INTENT = 'Plan a 3-day trip from Bangalore for six of us in December, under 15K each. No overnight travel. We like nature, food and a bit of adventure.';
const HOTEL_Q = 'Can we find a hotel closer to town without going over budget?';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [screen, setScreen] = useState<'home' | 'chat'>('home');
  const [splash, setSplash] = useState(false);
  const [awayFromBottom, setAway] = useState(false);
  const openMyra = () => { setScreen('chat'); setSplash(true); setTimeout(() => setSplash(false), 1500); };
  const onScroll = () => { const el = scrollRef.current; if (el) setAway(el.scrollHeight - el.scrollTop - el.clientHeight > 160); };
  const toBottom = () => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState<Step>('entry');
  const [s, setS] = useState<TripState>(INITIAL);
  const [sheet, setSheet] = useState<{ name: string; payload?: any } | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [menu, setMenu] = useState(false);
  const [voice, setVoice] = useState<{ phase: 'off' | 'ready' | 'listening' | 'fail'; text: string }>({ phase: 'off', text: '' });
  const voiceUses = useRef(0);
  const idRef = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sRef = useRef(s); sRef.current = s;
  const stepRef = useRef(step); stepRef.current = step;

  const set = useCallback((p: Partial<TripState> | ((s: TripState) => Partial<TripState>)) => {
    setS((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) }));
  }, []);
  const push = (m: Omit<Msg, 'id'>) => setMsgs((prev) => [...prev, { ...m, id: idRef.current++ }]);
  const me = (text: string) => push({ from: 'me', kind: 'text', text });
  const myra = async (kind: string, text?: string, data?: any, wait = 900) => {
    setTyping(true); await sleep(wait); setTyping(false);
    push({ from: 'myra', kind, text, data });
  };
  const toast = (t: string) => { setToastText(t); setTimeout(() => setToastText((x) => (x === t ? null : x)), 2200); };
  const openSheet = (name: string, payload?: any) => setSheet({ name, payload });

  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }));
  }, [msgs, typing]);

  /* ---------------- the scripted (simulated) agent ---------------- */
  const act = async (name: string, p?: any) => {
    switch (name) {
      case 'intent': {
        me(p || INTENT); setStep('brief');
        await myra('status', undefined, { title: 'Trip brief ready', steps: ['Journey goals clear', '6 travellers · 1 hard rule', 'Destination left open'] }, 1100);
        await myra('text', 'Six friends, one rule: **no overnight travel**. Just tell me when.', undefined, 500);
        push({ from: 'myra', kind: 'brief' });
        break;
      }
      case 'createRoom': {
        me('Create a Trip Room and invite friends'); setStep('room');
        await myra('text', 'Your Trip Room is ready. Share it with the gang.');
        push({ from: 'myra', kind: 'room' });
        break;
      }
      case 'share': {
        toast('Shared to “Gang of 6 🏕️” on WhatsApp'); setStep('collecting');
        await sleep(1200);
        push({ from: 'system', kind: 'sys', text: '2 hours later · simulated' });
        const joins = [
          { who: 'rohan', type: 'voice', text: 'Anything under twelve works for me. Bus is totally fine, I just want to do something adventurous.', extracted: ['Budget ≤ ₹12K', 'Bus OK', 'Adventure'] },
          { who: 'meera', type: 'text', text: 'Dec 5 or 19 weekend. No overnight buses please 🙏 Somewhere with good food and a nice stay', extracted: ['Dec 5–7 / 19–21', 'Daytime travel', 'Food', 'Boutique stay'] },
          { who: 'kabir', type: 'reel', text: 'THIS. we need to do this trek 🔥', extracted: ['Wants a sunrise trek', 'Dec 5–7 / 19–21'] },
          { who: 'isha', type: 'text', text: 'I can only do 11k max this month. 12th or 19th. Chill trip pls, not 5am every day 😅', extracted: ['Budget ≤ ₹11K', 'Dec 12–14 / 19–21', 'Relaxed pace'] },
        ];
        for (const j of joins) {
          await sleep(900);
          set((st) => ({ joined: [...st.joined, j.who] }));
          push({ from: 'member', kind: 'contrib', data: j });
        }
        await myra('text', '4 friends replied. Here’s where the group stands.', undefined, 1100);
        push({ from: 'myra', kind: 'summary' }); setStep('summary');
        break;
      }
      case 'toMemory': {
        me('Find trips for Dec 19–21'); setStep('memory');
        await myra('text', 'Before I search, one thing that could help.');
        push({ from: 'myra', kind: 'memory' });
        break;
      }
      case 'askMemory': {
        set({ memory: 'asked' });
        await sleep(1800);
        set({ memory: 'granted' }); toast('Meera & Kabir approved. Preferences only.');
        await sleep(600); act('plan', true);
        break;
      }
      case 'skipMemory': { set({ memory: 'declined' }); act('plan', false); break; }
      case 'plan': {
        setStep('planning');
        push({ from: 'myra', kind: 'progress', data: { memory: p } });
        await sleep((p ? 6 : 5) * 650 + 400);
        await myra('text', '3 complete trips for Dec 19–21. **Chikmagalur fits everyone**, with a shared room for Isha.', undefined, 500);
        push({ from: 'myra', kind: 'options' }); setStep('options');
        break;
      }
      case 'startVote': {
        me('Send all 3 to a group vote'); setStep('vote');
        await myra('text', 'Sent to the Trip Room. Your vote?');
        push({ from: 'myra', kind: 'vote' });
        break;
      }
      case 'voted': {
        const seq: [string, string][] = [['rohan', 'chik'], ['kabir', 'chik'], ['meera', 'coorg'], ['isha', 'chik']];
        for (const [who, o] of seq) { await sleep(800); set((st) => ({ votes: { ...st.votes, [who]: o } })); }
        await sleep(400);
        push({ from: 'member', kind: 'decline', data: { who: 'isha', text: 'Pondy is way over my budget, sorry 🙈' } });
        await myra('text', '**Chikmagalur it is.** One clash to settle first.', undefined, 1100);
        push({ from: 'myra', kind: 'compromise' });
        break;
      }
      case 'acceptCompromise': {
        set({ transportCompromise: true });
        await sleep(1400);
        set({ chosen: 'chik' }); setStep('locked');
        push({ from: 'system', kind: 'sys', text: 'Chikmagalur · Dec 19–21 locked by the group' });
        await myra('text', 'Locked. Everyone sees this same plan.');
        push({ from: 'myra', kind: 'itinerary' });
        break;
      }
      case 'keepDiscussing': toast('Rohan & Meera tagged in the Trip Room'); break;
      case 'swapHotel':
      case 'hotelQ': {
        if (!sRef.current.chosen) { toast('Lock a destination first'); break; }
        setSheet(null);
        me(HOTEL_Q); setStep('hotels');
        await myra('status', undefined, { title: 'Compared 14 stays near town', steps: ['Available Dec 19–21', 'Cost impact per person', 'Meera’s saved “close to town”'] }, 1200);
        await myra('text', '**The Brew House** is 2 km from town, +₹600 each. Still in budget.', undefined, 400);
        push({ from: 'myra', kind: 'hotels' });
        break;
      }
      case 'pickHotel': {
        set({ hotelId: p }); setStep('refined');
        toast('Stay replaced · rest of the plan unchanged');
        await myra('text', 'Swapped. Only the stay changed.');
        push({ from: 'myra', kind: 'itinerary' });
        break;
      }
      case 'soldOut': toast('I’ll tell the Trip Room if Mist Trail opens up'); break;
      case 'swapActivity': toast(`Swapping works the same for “${p}”. This demo shows stays.`); break;
      case 'toReview': {
        setSheet(null);
        me('Send the plan for group approval'); setStep('review');
        const bumped = sRef.current.hotelId === 'h1';
        if (bumped) set({ priceBump: 250, priceChange: 'shown' });
        await myra('text', bumped ? 'Final plan. **One price changed** while you decided.' : 'Final plan, ready for approvals.');
        push({ from: 'myra', kind: 'review' });
        for (const who of ['rohan', 'kabir', 'meera', 'isha']) { await sleep(700); set((st) => ({ approvals: { ...st.approvals, [who]: 'approved' } })); }
        set((st) => ({ approvals: { ...st.approvals, you: 'approved' } }));
        break;
      }
      case 'book': {
        set({ booked: true }); setStep('done');
        await myra('text', 'All set. I’ll remind Dev tomorrow at 10 AM.');
        break;
      }
      case 'rooms': openSheet('rooms'); break;
    }
  };

  const sendText = async (raw: string) => {
    const text = raw.trim(); if (!text) return;
    setInput('');
    const st = stepRef.current;
    if (st === 'entry') return act('intent', text);
    if (/hotel|stay|closer/i.test(text)) return act('hotelQ');
    if (/human|agent|support|person/i.test(text)) { me(text); openSheet('support'); return; }
    if (/approv|book|final/i.test(text) && sRef.current.chosen) return act('toReview');
    me(text);
    await myra('text', 'Noted in the Trip Room. Anything that changes cost comes back to the group.');
  };

  /* ---------------- voice (simulated) ---------------- */
  const voiceTarget = () => (step === 'entry' ? INTENT : step === 'locked' || step === 'refined' ? HOTEL_Q : 'Add a sunset point on day two');
  const startVoice = async () => {
    voiceUses.current += 1;
    const willFail = voiceUses.current === 2; // second attempt demonstrates recovery
    setVoice({ phase: 'ready', text: '' });
    await sleep(800);
    setVoice({ phase: 'listening', text: '' });
    if (willFail) { await sleep(1800); setVoice({ phase: 'fail', text: '' }); return; }
    const words = voiceTarget().split(' ');
    for (let i = 1; i <= words.length; i++) {
      await sleep(90);
      setVoice((v) => (v.phase === 'listening' ? { ...v, text: words.slice(0, i).join(' ') } : v));
    }
    await sleep(500);
    setVoice((v) => { if (v.phase === 'listening') { setTimeout(() => sendText(v.text), 0); } return { phase: 'off', text: '' }; });
  };
  const stopVoice = () => {
    // Interrupt: whatever was heard goes into the text box so the user can correct it before sending.
    setVoice((v) => { if (v.text) setInput(v.text); return { phase: 'off', text: '' }; });
  };

  const quick: string[] =
    step === 'locked' ? [HOTEL_Q, 'Talk to a human'] :
    step === 'refined' ? ['Send the plan for group approval', 'Talk to a human'] :
    step === 'summary' ? ['Nudge Dev on WhatsApp'] : [];
  const onQuick = (q: string) => {
    if (q === HOTEL_Q) return act('hotelQ');
    if (q.startsWith('Send the plan')) return act('toReview');
    if (q === 'Talk to a human') return openSheet('support');
    if (q.startsWith('Nudge')) return toast('Reminder sent to Dev on WhatsApp');
  };

  const ctx = { s, set, step, act, toast, openSheet };
  const roomActive = s.joined.length > 1 || step !== 'entry' && step !== 'brief';

  return (
    <StoreCtx.Provider value={ctx}>
        <div className="phone">
          {screen === 'chat' && <StatusBar />}
          {screen === 'home' ? <Home onOpen={openMyra} /> : (
            <div className="chat">
              <header className="top">
                <button className="circle" onClick={() => setScreen('home')} aria-label="Close">{msgs.length ? I.back : I.x}</button>
                <img className="logo-img" src={logoImg} alt="Myra" />
                <button className="circle" onClick={() => setMenu(!menu)} aria-label="More">•••</button>
                {menu && (
                  <div className="menu" onClick={() => setMenu(false)}>
                    <button onClick={() => openSheet('rooms')}>{I.link} Trip Rooms</button>
                    <button onClick={() => openSheet('support')}>{I.headset} Talk to a human</button>
                    <button onClick={() => openSheet('privacy')}>{I.brain} My travel preferences</button>
                  </div>
                )}
              </header>
              {roomActive && step !== 'entry' && step !== 'brief' && (
                <button className="room-pill" onClick={() => openSheet('rooms')}>
                  <span className="rp-dot" /> <b>Dec Escape · Gang of 6</b>
                  <AvatarStack list={TRAVELLERS.filter((t) => s.joined.includes(t.id))} size={18} />
                  <span className="muted">{s.joined.length}/6</span>{I.chev}
                </button>
              )}

              <div className="scroll" ref={scrollRef} onScroll={onScroll}>
                {msgs.length === 0 ? <Entry onPrompt={() => act('intent')} onRooms={() => openSheet('rooms')} /> : (
                  <div className="thread">
                    {msgs.map((m, i) => <Message key={m.id} m={m} showName={m.from === 'myra' && msgs[i - 1]?.from !== 'myra'} />)}
                    {typing && <Typing />}
                    {step === 'done' && <div className="end-pad" />}
                  </div>
                )}
              </div>

              {quick.length > 0 && !typing && (
                <div className="quick">
                  {quick.map((q) => <button key={q} onClick={() => onQuick(q)}><span>{q}</span><span className="qa">↳</span></button>)}
                </div>
              )}

              <div className={'composer ' + (voice.phase !== 'off' ? 'v-' + voice.phase : '')}>
                {voice.phase === 'off' ? (
                  <>
                    <button className="attach" onClick={() => toast('Attach a photo, screenshot, reel or location')} aria-label="Attach">{I.plus}</button>
                    <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendText(input)} placeholder="Ask Myra anything…" />
                    {input ? (
                      <button className="send" onClick={() => sendText(input)} aria-label="Send">{I.send}</button>
                    ) : (
                      <button className="speak" onClick={startVoice}><Bars /> <span className="sp-t">Speak</span></button>
                    )}
                  </>
                ) : (
                  <div className="voice">
                    <div className="v-label">
                      {voice.phase === 'ready' && 'Myra is getting ready.'}
                      {voice.phase === 'listening' && (voice.text ? <span className="v-live">“{voice.text}”</span> : 'Myra is listening.')}
                      {voice.phase === 'fail' && <span className="v-err">{I.warn} Couldn’t catch that. It sounds noisy around you.</span>}
                    </div>
                    {voice.phase === 'fail' ? (
                      <div className="v-actions">
                        <button className="v-btn" onClick={startVoice}>Try again</button>
                        <button className="v-btn ghost" onClick={() => setVoice({ phase: 'off', text: '' })}>Type instead</button>
                      </div>
                    ) : (
                      <div className="v-pill">
                        <span className="v-wave">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ animationDelay: i * 0.07 + 's' }} />)}</span>
                        <button className="v-stop" onClick={stopVoice}><span className="sq" /> Stop</button>
                      </div>
                    )}
                    {voice.phase === 'listening' && <span className="v-hint">Tap Stop to edit what I heard</span>}
                  </div>
                )}
              </div>

              <Sheet open={sheet?.name === 'why'} onClose={() => setSheet(null)} title="Why this option?" tall>{sheet?.name === 'why' && <WhySheet r={sheet.payload} />}</Sheet>
              <Sheet open={sheet?.name === 'itinerary'} onClose={() => setSheet(null)} title="Chikmagalur · shared plan" tall>{sheet?.name === 'itinerary' && <ItineraryFull />}</Sheet>
              <Sheet open={sheet?.name === 'rooms'} onClose={() => setSheet(null)} title="Your Trip Rooms"><RoomsSheet /></Sheet>
              <Sheet open={sheet?.name === 'support'} onClose={() => setSheet(null)} title="Talk to a person"><SupportSheet onDone={(t) => { setSheet(null); toast(t); }} /></Sheet>
              <Sheet open={sheet?.name === 'privacy'} onClose={() => setSheet(null)} title="My travel preferences"><PrivacySheet onClear={() => { setSheet(null); toast('Saved preferences cleared'); }} /></Sheet>
              <button className={'to-bottom' + (awayFromBottom ? ' show' : '')} style={{ bottom: quick.length > 0 && !typing ? 70 + 56 * quick.length + 34 : 98 }} onClick={toBottom} aria-label="Scroll to latest">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
              </button>
              {toastText && <div className="toast" key={toastText}>{toastText}</div>}
              {splash && (
                <div className="splash">
                  <button className="circle splash-x" onClick={() => setSplash(false)} aria-label="Close">{I.x}</button>
                  <span className="splash-orb"><span className="orb-glow" /><span className="orb-gloss" /><svg viewBox="0 0 24 24" className="splash-star"><path d="M12 3l1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9z" fill="#fff" /><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" fill="#fff" /></svg></span>
                </div>
              )}
            </div>
          )}
        </div>
    </StoreCtx.Provider>
  );
}

function StatusBar() {
  // Matches the iOS status bar captured in the MMT home screenshot
  return (
    <div className="statusbar">
      <span className="sb-time">7:35</span>
      <span className="sb-r">
        <svg width="20" height="13" viewBox="0 0 20 13"><rect x="0" y="9" width="3.4" height="4" rx="1" fill="#111" /><rect x="5.2" y="6.5" width="3.4" height="6.5" rx="1" fill="#111" /><rect x="10.4" y="3.5" width="3.4" height="9.5" rx="1" fill="#111" /><rect x="15.6" y="0" width="3.4" height="13" rx="1" fill="#C7C7CC" /></svg>
        <svg width="18" height="13" viewBox="0 0 18 13"><path d="M9 12.6l2.6-3.1a4 4 0 00-5.2 0z" fill="#111" /><path d="M3.6 6.6a8 8 0 0110.8 0l-1.6 1.9a5.6 5.6 0 00-7.6 0z" fill="#111" /><path d="M.8 3.4a12.2 12.2 0 0116.4 0l-1.6 1.9a9.8 9.8 0 00-13.2 0z" fill="#111" /></svg>
        <span className="sb-bat"><span className="sb-bat-n dark">50</span><span className="sb-bat-fill"><span className="sb-bat-n">50</span></span></span>
      </span>
    </div>
  );
}

function Bars() {
  return <span className="bars">{[6, 12, 16, 10, 14, 8].map((h, i) => <i key={i} style={{ height: h }} />)}</span>;
}

function rich(text?: string): ReactNode {
  if (!text) return null;
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith('**') ? <b key={i}>{part.slice(2, -2)}</b> : part);
}

function Message({ m, showName }: { m: Msg; showName: boolean }) {
  if (m.from === 'me') return <div className="me-row"><div className="me">{m.text}</div></div>;
  if (m.from === 'system') return <div className="sys"><span>{m.text}</span></div>;
  if (m.kind === 'contrib') return <Contribution data={m.data} />;
  if (m.kind === 'decline') {
    const t = TRAVELLERS.find((x) => x.id === m.data.who)!;
    return <div className="decline"><Avatar t={t} size={26} /><span><b>{t.name}</b> declined Pondicherry · “{m.data.text}”</span></div>;
  }
  const body = (() => {
    switch (m.kind) {
      case 'text': return <p className="myra-text">{rich(m.text)}</p>;
      case 'status': return <StatusCard title={m.data.title} steps={m.data.steps.map((l: string) => ({ label: l, state: 's-done' }))} />;
      case 'brief': return <BriefCard />;
      case 'room': return <RoomCard />;
      case 'summary': return <GroupSummary />;
      case 'memory': return <MemoryCard />;
      case 'progress': return <Progress data={m.data} />;
      case 'options': return <OptionsCard />;
      case 'vote': return <VoteCard />;
      case 'compromise': return <CompromiseCard />;
      case 'itinerary': return <ItineraryCard />;
      case 'hotels': return <HotelsCard />;
      case 'review': return <ReviewCard />;
      default: return null;
    }
  })();
  return (
    <div className={'myra-row k-' + m.kind}>
      {showName && <div className="wordmark">Myra<sup>✦</sup></div>}
      {body}
    </div>
  );
}

function Entry({ onPrompt }: { onPrompt: () => void; onRooms: () => void }) {
  const hist = [
    { t: 'Goa Trip Booking', s: 'Goa', time: '07:38 PM' },
    { t: 'Budget Three-Day Trip', s: 'Can you plan a three day trip for six pe…', time: '07:04 PM' },
    { t: 'Hotel Inquiry', s: 'HOTEL HALEZ', time: '05:01 AM' },
  ];
  return (
    <div className="entry">
      <h2 className="hi">Hi, <span className="grad">Nila</span><Sparkles /></h2>
      <p className="lead">I’m Myra, your personal travel assistant.<br />Let’s plan your next trip together.</p>
      <button className="group-card glow-ring" onClick={onPrompt}>
        <span className="gc-icon"><GroupTripIcon /></span>
        <span className="gc-body">
          <span className="gc-new">New</span>
          <b>Plan a trip with friends</b>
          <span>Invite your group. Myra finds dates, budgets and a plan everyone agrees on.</span>
        </span>
        <span className="gc-go">{I.back}</span>
      </button>
      <div className="section-l">{I.clock} RECENT CHAT HISTORY</div>
      {hist.map((h) => (
        <div key={h.t} className="hist">
          <span className="hist-orb"><span className="orb sm" /><span className="hist-badge"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="7" width="14" height="13" rx="2" /><path d="M9 7V4h6v3M9 12h6" /></svg></span></span>
          <div><b>{h.t}</b><span>{h.s}</span></div>
          <span className="hist-time">{h.time}</span>
        </div>
      ))}
    </div>
  );
}

function Sparkles() {
  return <svg className="hi-spark" viewBox="0 0 24 24" width="22" height="22"><defs><linearGradient id="hsg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0B1B3F" /><stop offset="1" stopColor="#3B82F6" /></linearGradient></defs><path d="M9 2l1.6 5.4L16 9l-5.4 1.6L9 16l-1.6-5.4L2 9l5.4-1.6z" fill="url(#hsg)" /><path d="M18 13l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="#3B82F6" /></svg>;
}

/* Isometric line-art in MMT's icon language: navy outline, blue planes, soft shadow */
function GroupTripIcon() {
  return (
    <svg viewBox="0 0 64 64" width="44" height="44" fill="none" stroke="#0B1B3F" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="33" cy="55" rx="22" ry="4" fill="#0B1B3F" opacity=".12" stroke="none" />
      <circle cx="20" cy="18" r="6" fill="#fff" />
      <path d="M9 44c0-8 5-13 11-13s11 5 11 13z" fill="#3B82F6" />
      <circle cx="40" cy="15" r="6.5" fill="#fff" />
      <path d="M28 41c0-9 5.5-14 12-14s12 5 12 14z" fill="#fff" />
      <path d="M40 27c6.5 0 12 5 12 14H40z" fill="#3B82F6" />
      <rect x="30" y="38" width="16" height="15" rx="2.5" fill="#fff" />
      <path d="M30 44h16" /><path d="M35 38v-3h6v3" />
      <path d="M38 38v15" stroke="#3B82F6" />
      <path d="M50 8l1.2 3.3L54.5 12.5l-3.3 1.2L50 17l-1.2-3.3-3.3-1.2 3.3-1.2z" fill="#3B82F6" stroke="none" />
    </svg>
  );
}

function Home({ onOpen }: { onOpen: () => void }) {
  // The real MakeMyTrip home screen, used exactly as it is. Only the two Myra entry points are rebuilt live,
  // so they can animate the way they do in the app.
  const phrases = ['Search destinations, stays and more with Myra', 'Explore your next adventure with Myra'];
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % phrases.length), 3200); return () => clearInterval(id); }, []);
  return (
    <div className="home-real">
      <div className="home-frame">
        <img src={homeImg} alt="MakeMyTrip home screen" draggable={false} />
        <button className="myra-bar" onClick={onOpen} aria-label="Search with Myra">
          <span className="mb-spark"><svg viewBox="0 0 24 24"><defs><linearGradient id="mbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0B1B3F" /><stop offset="1" stopColor="#3B82F6" /></linearGradient></defs><path d="M9 2l1.6 5.4L16 9l-5.4 1.6L9 16l-1.6-5.4L2 9l5.4-1.6z" fill="url(#mbg)" /><path d="M17.5 12l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" fill="#3B82F6" /></svg></span>
          <span className="mb-text">
            {phrases.map((p, k) => <span key={k} className={'mb-line' + (k === i ? ' in' : ' out')}>{p}</span>)}
          </span>
          <span className="mb-mic"><span className="bars">{[7, 12, 16, 12, 7].map((h, k) => <i key={k} style={{ height: h }} />)}</span></span>
        </button>
        <button className="myra-orb" onClick={onOpen} aria-label="Ask Myra">
          <span className="orb-glow" />
          <span className="orb-gloss" />
          <span className="orb-label"><small>Ask</small><b>myra</b><em>✦</em></span>
        </button>
      </div>
    </div>
  );
}

function RoomsSheet() {
  return (
    <div className="rooms">
      {ROOMS.map((r) => (
        <div key={r.id} className={'room-row' + (r.active ? ' on' : '')}>
          <span className="orb sm" />
          <div><b>{r.name}</b><span className="muted small">{r.meta}</span></div>
          {r.active ? <span className="pill">Open</span> : <span className="muted small">View</span>}
        </div>
      ))}
      <p className="muted small">Meera and Kabir are in two of your rooms. Myra uses their saved <b>preferences</b> across rooms only with their permission, never chats.</p>
      <button className="ghost full">+ New Trip Room</button>
    </div>
  );
}

function SupportSheet({ onDone }: { onDone: (t: string) => void }) {
  return (
    <div className="support">
      <p>A travel expert can pick this up <b>with the full Trip Room context</b>, so you won’t have to repeat anything.</p>
      <div className="ctx-chip">{I.link} Sharing: Dec Escape · 6 members · Chikmagalur plan</div>
      <button className="cta" onClick={() => onDone('Callback requested · ~5 min')}>{I.headset} Request a callback · ~5 min</button>
      <button className="ghost full" onClick={() => onDone('Connecting you to an MMT agent…')}>Chat with an MMT agent</button>
      <p className="muted small">Available 24×7. Refunds and cancellations go straight to a person.</p>
    </div>
  );
}

function PrivacySheet({ onClear }: { onClear: () => void }) {
  const mine = MEMORY.meera;
  return (
    <div className="privacy-sheet">
      <p className="muted">What Myra remembers about you across Trip Rooms. Only you can see and edit this.</p>
      <div className="graph">
        {mine.items.slice(0, 4).map((i) => <div key={i.value} className="g-row"><span className="g-cat">{i.cat}</span><span className="g-val">{i.value}</span><button className="chip-x">{I.x}</button></div>)}
      </div>
      <label className="toggle"><input type="checkbox" defaultChecked /> <span>Let Myra use my preferences in other Trip Rooms (asks each time)</span></label>
      <button className="ghost full danger" onClick={onClear}>Clear all saved preferences</button>
    </div>
  );
}
