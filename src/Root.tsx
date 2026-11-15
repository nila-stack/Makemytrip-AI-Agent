import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import App from './App';
import mmtLogo from './assets/mmt-logo.png';

const PHONE_W = 390, PHONE_H = 844, RING = 10;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isMobileView = () => new URLSearchParams(location.search).get('view') === 'mobile' || window.innerWidth < 760;

export default function Root() {
  const [runKey, setRunKey] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mobile, setMobile] = useState(isMobileView());
  const [scale, setScale] = useState(1);
  const stopRef = useRef(false);

  useEffect(() => {
    const fit = () => {
      setMobile(isMobileView());
      const avail = window.innerHeight - 112; // breathing room top and bottom
      setScale(Math.min(1, Math.max(0.6, avail / (PHONE_H + RING * 2))));
    };
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);

  const restart = () => { stopRef.current = true; setPlaying(false); setRunKey((k) => k + 1); };

  const play = async () => {
    if (playing) { restart(); return; }
    stopRef.current = false; setPlaying(true); setRunKey((k) => k + 1);
    await sleep(900);
    try { await runWalkthrough(() => stopRef.current); } catch { /* stopped */ }
    setPlaying(false);
  };

  const phone = <App key={runKey} />;
  if (mobile) return <div className="stage mobile">{phone}{playing && <div className="tap-shield" />}</div>;

  return (
    <div className="stage">
      <QrCorner />
      <aside className="side-note">
        <img className="mmt-logo" src={mmtLogo} alt="MakeMyTrip" />
        <span className="kicker">Myra</span>
        <h1>Introducing<br /><em>Trip Rooms.</em></h1>
        <p className="tagline">Great trips come together here</p>
        <p className="desc">Myra Trip Rooms brings group travel planning into one shared space. Bring everyone’s preferences together, discover personalised travel options, resolve differences and build your itinerary, while Myra takes care of the coordination.</p>
        <div className="side-btns">
          <button className={'btn-play' + (playing ? ' on' : '')} onClick={play} aria-pressed={playing}>
            {playing ? <><span className="eq"><i /><i /><i /></span> Stop walkthrough</> : <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5l13 7.5-13 7.5z" /></svg> Play walkthrough</>}
            {playing && <span className="btn-progress" />}
          </button>
          <button className="btn-restart" onClick={restart}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8" /><path d="M3 3v5h5" /></svg> Restart experience
          </button>
        </div>
      </aside>
      <div className="phone-slot" style={{ width: (PHONE_W + RING * 2) * scale, height: (PHONE_H + RING * 2) * scale }}>
        <div className="phone-scale" style={{ transform: `scale(${scale})` }}>
          {phone}
          {playing && <div className="tap-shield" title="Walkthrough playing" />}
        </div>
      </div>
      <div className="side-spacer" />
    </div>
  );
}

function QrCorner() {
  const [svg, setSvg] = useState('');
  const url = (() => { const u = new URL(location.href); u.search = '?view=mobile'; u.hash = ''; return u.toString(); })();
  useEffect(() => { QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0B1B3F', light: '#FFFFFF' } }).then(setSvg); }, [url]);
  return (
    <div className="qr-corner">
      <div className="qr-box" dangerouslySetInnerHTML={{ __html: svg }} aria-label="QR code to open the mobile experience" role="img" />
      <div className="qr-text">
        <b>EXPERIENCE ON YOUR PHONE</b>
        <span>Scan with your camera</span>
        <a href={url} target="_blank" rel="noreferrer">Open mobile view ↗</a>
      </div>
    </div>
  );
}

/* ---------- Auto walkthrough: drives the real UI by tapping it, with a visible tap marker ---------- */
async function runWalkthrough(stopped: () => boolean) {
  const root = () => document.querySelector('.phone') as HTMLElement;
  const wait = async (ms: number) => { const end = Date.now() + ms; while (Date.now() < end) { if (stopped()) throw 0; await sleep(80); } };
  const find = (sel: string, text?: string, nth = 0): HTMLElement | null => {
    const all = Array.from(root().querySelectorAll<HTMLElement>(sel)).filter((el) => !text || el.textContent?.trim().startsWith(text));
    return all[nth] ?? null;
  };
  const tap = async (sel: string, text?: string, nth = 0) => {
    let el: HTMLElement | null = null;
    for (let i = 0; i < 60 && !(el = find(sel, text, nth)); i++) await wait(100);
    if (!el) return;
    const sc = el.closest('.scroll') as HTMLElement | null;
    if (sc) {
      const er = el.getBoundingClientRect(), sr = sc.getBoundingClientRect();
      const delta = (er.top + er.height / 2) - (sr.top + sr.height / 2);
      if (Math.abs(delta) > 40) { sc.scrollBy({ top: delta / (sr.width / sc.offsetWidth), behavior: 'smooth' }); await wait(650); }
    }
    const pr = root().getBoundingClientRect(), r = el.getBoundingClientRect();
    const s = pr.width / root().offsetWidth;
    const dot = document.createElement('span'); dot.className = 'tap-dot';
    dot.style.left = (r.left + r.width / 2 - pr.left) / s + 'px'; dot.style.top = (r.top + r.height / 2 - pr.top) / s + 'px';
    root().appendChild(dot); await wait(380); el.click(); setTimeout(() => dot.remove(), 600);
  };
  const scrollChat = async (to: 'bottom' | number) => {
    const sc = root().querySelector('.scroll') as HTMLElement | null; if (!sc) return;
    sc.scrollTo({ top: to === 'bottom' ? sc.scrollHeight : sc.scrollTop + to, behavior: 'smooth' }); await wait(700);
  };

  await wait(1200);
  await tap('.myra-orb'); await wait(2200);
  await tap('.group-card'); await wait(3200);
  await tap('.fact.edit'); await wait(900); await tap('.fact.edit'); await wait(500);
  await tap('.seg-pills button'); await wait(700);
  await tap('.cta', 'Create Trip Room'); await wait(2400);
  await tap('.link-btn'); await wait(1200);
  await tap('.cta.wa'); await wait(8200);
  await tap('.thread .seg button', 'Budget'); await wait(1800);
  await tap('.thread .seg button', 'Dates'); await wait(900);
  await tap('.cta', 'Find trips'); await wait(2600);
  await tap('.thread .seg.small button', 'Kabir'); await wait(1400);
  await tap('.cta', 'Ask them'); await wait(7000);
  await tap('.why'); await wait(3000);
  await tap('.sheet-wrap.open .icon-btn'); await wait(700);
  await tap('.cta', 'Send all 3'); await wait(2400);
  await tap('.vote-row'); await wait(6500);
  await tap('.cta', 'Propose it'); await wait(3800);
  await tap('.cta', 'See day-by-day plan'); await wait(2000);
  await tap('.sheet-wrap.open .seg button', 'Day 2'); await wait(1600);
  await tap('.sheet-wrap.open .seg button', 'Day 1'); await wait(900);
  await tap('.sheet-wrap.open .swap'); await wait(3800);
  await tap('.hotel .cta', 'Choose'); await wait(2800);
  await tap('.quick button', 'Send the plan'); await wait(6000);
  await tap('.chip.act', 'Keep it'); await wait(1300);
  await tap('.cta', 'Continue to booking'); await wait(2500);
  await scrollChat('bottom'); await wait(2500);
}
