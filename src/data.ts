// All data is fictional and simulated for the prototype. Not live MakeMyTrip inventory.

export type Interest = 'nature' | 'food' | 'adventure' | 'relaxed' | 'beach' | 'culture';
export type Transport = 'bus' | 'train' | 'tempo' | 'flight';
export type StayType = 'homestay' | 'boutique' | 'resort' | 'hostel';

export interface Traveller {
  id: string;
  name: string;
  short: string;
  color: string;
  role?: 'coordinator';
  status: 'joined' | 'pending';
  via?: string; // how they contributed
  budget?: number; // per person, ₹
  dates?: string[]; // weekends available
  transport?: Transport[];
  stay?: StayType[];
  interests?: Interest[];
  mustHave?: string[];
  flexible?: string[];
  returning?: boolean; // has a Myra preference profile from another room
}

export const WEEKENDS = [
  { id: 'd1', label: 'Dec 5–7' },
  { id: 'd2', label: 'Dec 12–14' },
  { id: 'd3', label: 'Dec 19–21' },
];

export const TRAVELLERS: Traveller[] = [
  {
    id: 'you', name: 'Nila', short: 'N', color: '#0B6BFF', role: 'coordinator', status: 'joined',
    budget: 15000, dates: ['d1', 'd2', 'd3'], transport: ['tempo', 'train', 'bus'], stay: ['homestay', 'boutique'],
    interests: ['nature', 'food', 'adventure'], mustHave: ['No overnight travel'], flexible: ['Destination'],
  },
  {
    id: 'rohan', name: 'Rohan', short: 'R', color: '#F2994A', status: 'joined', via: 'Voice note',
    budget: 12000, dates: ['d2', 'd3'], transport: ['bus'], stay: ['homestay', 'hostel'],
    interests: ['adventure', 'nature'], mustHave: ['Under ₹12K'], flexible: ['Stay type'],
  },
  {
    id: 'meera', name: 'Meera', short: 'M', color: '#BB6BD9', status: 'joined', via: 'Trip Room link', returning: true,
    budget: 18000, dates: ['d1', 'd3'], transport: ['train', 'tempo'], stay: ['boutique'],
    interests: ['food', 'nature', 'relaxed'], mustHave: ['Daytime travel'], flexible: ['Activities'],
  },
  {
    id: 'kabir', name: 'Kabir', short: 'K', color: '#27AE60', status: 'joined', via: 'Instagram reel', returning: true,
    budget: 15000, dates: ['d1', 'd3'], transport: ['tempo', 'bus', 'train'], stay: ['homestay', 'hostel', 'boutique'],
    interests: ['adventure', 'nature'], mustHave: ['One proper trek'], flexible: ['Budget'],
  },
  {
    id: 'isha', name: 'Isha', short: 'I', color: '#EB5757', status: 'joined', via: 'WhatsApp text',
    budget: 11000, dates: ['d2', 'd3'], transport: ['train', 'tempo'], stay: ['homestay'],
    interests: ['relaxed', 'food'], mustHave: ['Under ₹11K'], flexible: ['Dates'],
  },
  { id: 'dev', name: 'Dev', short: 'D', color: '#828282', status: 'pending' },
];

// Cross-trip memory — preferences saved (with consent) from another Trip Room.
export const MEMORY: Record<string, { room: string; items: { cat: string; value: string }[]; rejected: string[] }> = {
  meera: {
    room: 'Goa · Office gang (Oct)',
    items: [
      { cat: 'Stay', value: 'Boutique stays' },
      { cat: 'Location', value: 'Close to town' },
      { cat: 'Travel', value: 'Daytime only' },
      { cat: 'Activities', value: 'Food trails, cafés' },
      { cat: 'Pace', value: 'Relaxed mornings' },
    ],
    rejected: ['Hostel dorms', 'Overnight buses'],
  },
  kabir: {
    room: 'Goa · Office gang (Oct)',
    items: [
      { cat: 'Activities', value: 'Sunrise treks' },
      { cat: 'Pace', value: 'Packed days' },
      { cat: 'Budget', value: 'Flexible ±15%' },
    ],
    rejected: ['Resort-only stays'],
  },
};

export const ROOMS = [
  { id: 'r1', name: 'Dec Escape · Gang of 6', meta: '6 members · planning', active: true },
  { id: 'r2', name: 'Goa · Office gang', meta: '5 members · booked in Oct', active: false },
  { id: 'r3', name: 'Family · Ooty', meta: '4 members · idea stage', active: false },
];

export interface TripOption {
  id: string;
  dest: string;
  region: string;
  tagline: string;
  hue: [string, string];
  transport: { mode: Transport; label: string; duration: string; cost: number };
  stay: { name: string; type: StayType; cost: number; note: string };
  activities: { name: string; tag: Interest }[];
  activityCost: number;
  foodCost: number;
  tags: Interest[];
  tradeoff: string;
  sharedRoomSaving: number; // saving pp if member picks shared 3-bed room
}

export const OPTIONS: TripOption[] = [
  {
    id: 'chik', dest: 'Chikmagalur', region: 'Karnataka · 245 km', tagline: 'Coffee hills, a sunrise trek, slow evenings',
    hue: ['#2E7D5B', '#9BD67E'],
    transport: { mode: 'tempo', label: 'Private tempo traveller', duration: '5h, daytime', cost: 2100 },
    stay: { name: 'Ridge Estate Homestay', type: 'homestay', cost: 4800, note: 'Coffee estate · 18 km from town' },
    activities: [
      { name: 'Mullayanagiri sunrise trek', tag: 'adventure' },
      { name: 'Coffee estate walk', tag: 'nature' },
      { name: 'Hebbe Falls jeep ride', tag: 'adventure' },
      { name: 'Town food trail', tag: 'food' },
    ],
    activityCost: 2600, foodCost: 2400, tags: ['nature', 'adventure', 'food', 'relaxed'],
    tradeoff: 'Stay is 18 km out of town. Great views, fewer café options at night.',
    sharedRoomSaving: 1100,
  },
  {
    id: 'coorg', dest: 'Coorg', region: 'Karnataka · 265 km', tagline: 'Boutique stay in town, waterfalls, food',
    hue: ['#1F5E7A', '#7CC6C9'],
    transport: { mode: 'bus', label: 'KSRTC Airavat (day bus)', duration: '6h, daytime', cost: 1300 },
    stay: { name: 'Madikeri Boutique Rooms', type: 'boutique', cost: 6600, note: 'Boutique · 1 km from town' },
    activities: [
      { name: 'Abbey Falls', tag: 'nature' },
      { name: 'Raja’s Seat sunset', tag: 'relaxed' },
      { name: 'Coorg pork & coffee trail', tag: 'food' },
      { name: 'Kopatty hill hike', tag: 'adventure' },
    ],
    activityCost: 2200, foodCost: 2800, tags: ['nature', 'food', 'relaxed', 'adventure'],
    tradeoff: 'Bus is cheapest but 6 hours each way; boutique stay pushes cost up.',
    sharedRoomSaving: 1600,
  },
  {
    id: 'pondy', dest: 'Pondicherry', region: 'Puducherry · 310 km', tagline: 'Beach, French Quarter, first scuba dive',
    hue: ['#C2410C', '#FDBA74'],
    transport: { mode: 'train', label: 'Day train + cab', duration: '6.5h, daytime', cost: 1900 },
    stay: { name: 'White Town Guesthouse', type: 'boutique', cost: 5200, note: 'Heritage · walk to beach' },
    activities: [
      { name: 'Intro scuba dive', tag: 'adventure' },
      { name: 'French Quarter walk', tag: 'culture' },
      { name: 'Café hopping', tag: 'food' },
      { name: 'Paradise Beach', tag: 'beach' },
    ],
    activityCost: 4800, foodCost: 3200, tags: ['food', 'adventure', 'beach', 'culture'],
    tradeoff: 'Scuba makes it memorable but pricey, over 2 people’s budgets.',
    sharedRoomSaving: 1200,
  },
];

export interface Hotel {
  id: string; name: string; type: string; dist: string; distKm: number; cost: number; rating: number; reviews: number;
  cancel: string; available: boolean; memoryMatch?: string; hue: [string, string];
}

export const HOTELS: Hotel[] = [
  { id: 'h0', name: 'Ridge Estate Homestay', type: 'Homestay', dist: '18 km from town', distKm: 18, cost: 4800, rating: 4.5, reviews: 412, cancel: 'Free cancellation till Dec 16', available: true, hue: ['#2E7D5B', '#9BD67E'] },
  { id: 'h1', name: 'The Brew House', type: 'Boutique', dist: '2 km from town', distKm: 2, cost: 5400, rating: 4.6, reviews: 286, cancel: 'Free cancellation till Dec 17', available: true, memoryMatch: 'Matches Meera’s saved “boutique, close to town”', hue: ['#7C4A2D', '#E7B98A'] },
  { id: 'h2', name: 'Kalasa Valley Stay', type: 'Homestay', dist: '9 km from town', distKm: 9, cost: 4500, rating: 4.2, reviews: 158, cancel: 'Non-refundable', available: true, hue: ['#3D6B4F', '#B7D3A8'] },
  { id: 'h3', name: 'Mist Trail Resort', type: 'Resort', dist: '4 km from town', distKm: 4, cost: 5200, rating: 4.7, reviews: 903, cancel: 'Unavailable', available: false, hue: ['#4B5563', '#CBD5E1'] },
];

export const ITINERARY = (stayName: string) => [
  {
    day: 'Day 1', date: 'Fri, Dec 19', items: [
      { time: '6:30 AM', title: 'Depart Bengaluru', sub: 'Private tempo traveller · pickup at Hebbal', kind: 'transport' },
      { time: '11:45 AM', title: `Check in · ${stayName}`, sub: 'Rooms ready from 12 PM', kind: 'stay' },
      { time: '1:00 PM', title: 'Lunch · Town Canteen', sub: 'Local thali, ₹250 avg', kind: 'food' },
      { time: '4:00 PM', title: 'Coffee estate walk', sub: '2 hrs · guided', kind: 'activity' },
      { time: '8:00 PM', title: 'Bonfire dinner', sub: 'At the stay', kind: 'food' },
    ],
  },
  {
    day: 'Day 2', date: 'Sat, Dec 20', items: [
      { time: '5:15 AM', title: 'Mullayanagiri sunrise trek', sub: 'Kabir’s must-have · moderate, 3 hrs', kind: 'activity' },
      { time: '10:00 AM', title: 'Brunch + rest', sub: 'Relaxed block for Isha & Meera', kind: 'food' },
      { time: '2:00 PM', title: 'Hebbe Falls jeep ride', sub: '4×4 · 2.5 hrs', kind: 'activity' },
      { time: '7:00 PM', title: 'Town food trail', sub: '3 stops · Meera’s pick', kind: 'food' },
    ],
  },
  {
    day: 'Day 3', date: 'Sun, Dec 21', items: [
      { time: '8:00 AM', title: 'Hirekolale Lake', sub: 'Easy walk, breakfast picnic', kind: 'activity' },
      { time: '11:00 AM', title: 'Check out', sub: '', kind: 'stay' },
      { time: '12:00 PM', title: 'Depart for Bengaluru', sub: 'Back by ~5:30 PM · no overnight', kind: 'transport' },
    ],
  },
];
