export type LocationType = 'Online' | 'Offline' | 'Hybrid';
export type PrizeType = 'Price' | 'Non-price';

export interface Hackathon {
  id: string;
  name: string;
  locationType: LocationType;
  location: string;
  coordinates?: { lat: number; lng: number };
  timePeriod: string; // e.g., "March 16 - April 25"
  startDate: string; // ISO format for comparison
  endDate: string; // ISO format for comparison
  conductedBy: string;
  prizeMoney: string;
  prizeType: PrizeType;
  category: string;
  participantCount: number;
  url: string;
  relevanceScore: number;
  sources?: { title: string; url: string }[];
  status?: 'UPCOMING' | 'ACTIVE' | 'ENDED';
}

export interface UserPreferences {
  knowledgeScope: string[];
  currentLocation: string;
  preferredCategories: string[];
  minPrize: number;
  lastUpdated?: string;
}

export const HACKATHON_CATEGORIES = [
  'Web Development',
  'Mobile Apps',
  'AI & Machine Learning',
  'Blockchain & Web3',
  'Cybersecurity',
  'IoT & Hardware',
  'Game Dev',
  'Data Science',
  'Sustainability'
];