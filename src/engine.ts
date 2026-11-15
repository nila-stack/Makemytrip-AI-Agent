// Simulated preference intelligence — a deterministic, explainable scoring function.
// Layer 1: individual preferences · Layer 2: group compatibility · Layer 3: trip constraints.
import { MEMORY, TRAVELLERS, type TripOption, type Traveller } from './data';

export const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');
export const fmtK = (n: number) => '₹' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';

export function costPP(o: TripOption, stayCost = o.stay.cost) {
  return o.transport.cost + stayCost + o.activityCost + o.foodCost;
}

export interface MemberFit {
  t: Traveller;
  score: number; // 0–100
  affordable: boolean;
  viaCompromise: boolean; // affordable only with shared room
  reasons: string[];
  concerns: string[];
  memoryUsed: boolean;
}

export function memberFit(o: TripOption, t: Traveller, useMemory: boolean): MemberFit {
  const cost = costPP(o);
  const reasons: string[] = [];
  const concerns: string[] = [];
  let score = 40;
  let memoryUsed = false;

  const budget = t.budget ?? 0;
  const affordable = cost <= budget;
  const viaCompromise = !affordable && cost - o.sharedRoomSaving <= budget;
  if (affordable) { score += 20; reasons.push(`Within ${fmtK(budget)} budget`); }
  else if (viaCompromise) { score += 8; concerns.push(`Fits ${fmtK(budget)} only with a shared 3-bed room`); }
  else { score -= 25; concerns.push(`${fmt(cost - budget)} over ${fmtK(budget)} budget`); }

  const shared = (t.interests ?? []).filter((i) => o.tags.includes(i));
  score += shared.length * 8;
  if (shared.length) reasons.push(`Likes ${shared.join(', ')}`);

  if (t.transport?.includes(o.transport.mode)) { score += 8; reasons.push(`OK with ${o.transport.label.toLowerCase()}`); }
  else concerns.push(`Prefers ${t.transport?.join('/')}`);

  if (t.stay?.includes(o.stay.type)) score += 6;
  else concerns.push(`Prefers ${t.stay?.join('/')} stays`);

  if (useMemory && MEMORY[t.id]) {
    const m = MEMORY[t.id];
    if (m.items.some((i) => i.value.toLowerCase().includes(o.stay.type))) { score += 6; memoryUsed = true; reasons.push('Matches saved stay preference'); }
    if (m.items.some((i) => i.value.toLowerCase().includes('trek')) && o.activities.some((a) => a.name.toLowerCase().includes('trek'))) {
      score += 6; memoryUsed = true; reasons.push('Has the sunrise trek they saved before');
    }
  }
  return { t, score: Math.max(5, Math.min(98, score)), affordable, viaCompromise, reasons, concerns, memoryUsed };
}

export function rankOptions(options: TripOption[], useMemory: boolean) {
  const members = TRAVELLERS.filter((t) => t.status === 'joined');
  return options
    .map((o) => {
      const fits = members.map((t) => memberFit(o, t, useMemory));
      const groupScore = Math.round(fits.reduce((s, f) => s + f.score, 0) / fits.length);
      const canAfford = fits.filter((f) => f.affordable || f.viaCompromise).length;
      return { o, fits, groupScore, canAfford, cost: costPP(o) };
    })
    .sort((a, b) => b.groupScore - a.groupScore);
}

export type Ranked = ReturnType<typeof rankOptions>[number];
