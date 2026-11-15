import { createContext, useContext } from 'react';

export type Step =
  | 'entry' | 'brief' | 'room' | 'collecting' | 'summary' | 'memory' | 'planning' | 'options'
  | 'vote' | 'locked' | 'hotels' | 'refined' | 'review' | 'done';

export interface Msg {
  id: number;
  from: 'me' | 'myra' | 'member' | 'system';
  kind: string;
  text?: string;
  data?: any;
}

export interface TripState {
  budget: number;
  dates: string; // weekend label or 'group'
  nights: number;
  people: number;
  chips: { id: string; label: string; hard?: boolean }[];
  joined: string[]; // member ids that have joined
  memory: 'ask' | 'asked' | 'granted' | 'declined';
  votes: Record<string, string | null>; // member -> option id
  myVote: string | null;
  chosen: string | null;
  transportCompromise: boolean;
  hotelId: string;
  priceBump: number; // simulated price change on stay (pp)
  priceChange: 'none' | 'shown' | 'kept' | 'reverted';
  approvals: Record<string, 'approved' | 'pending'>;
  booked: boolean;
}

export interface Ctx {
  s: TripState;
  set: (p: Partial<TripState> | ((s: TripState) => Partial<TripState>)) => void;
  step: Step;
  act: (name: string, payload?: any) => void;
  toast: (t: string) => void;
  openSheet: (name: string, payload?: any) => void;
}

export const StoreCtx = createContext<Ctx>(null as unknown as Ctx);
export const useStore = () => useContext(StoreCtx);
