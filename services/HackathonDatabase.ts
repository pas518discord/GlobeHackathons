import { Hackathon } from '../types.ts';

export class HackathonDatabaseManager {
  private static readonly STORAGE_KEY = 'hackathon_database_v1';
  private static readonly LAST_SEARCH_KEY = 'hackathon_last_search';
  private static readonly SEARCH_INTERVAL_DAYS = 7;

  static saveHackathons(hackathons: Hackathon[]): void {
    try {
      const data = {
        hackathons,
        timestamp: new Date().toISOString(),
        version: 1
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(this.LAST_SEARCH_KEY, new Date().toISOString());
      console.log(`✅ Saved ${hackathons.length} hackathons to database`);
    } catch (error) {
      console.error('Failed to save hackathons:', error);
    }
  }

  static loadHackathons(): Hackathon[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      const data = JSON.parse(stored);
      return data.hackathons || [];
    } catch (error) {
      console.error('Failed to load hackathons:', error);
      return [];
    }
  }

  static clearDatabase(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.LAST_SEARCH_KEY);
  }

  static getStats() {
    const hackathons = this.loadHackathons();
    const byTier: Record<string, number> = { tier1: 0, tier2: 0, tier3: 0 };
    hackathons.forEach(h => {
      const t = h.discoveryTier || 3;
      if (t === 1) byTier.tier1++;
      else if (t === 2) byTier.tier2++;
      else byTier.tier3++;
    });

    return {
      total: hackathons.length,
      online: hackathons.filter(h => h.locationType === 'Online').length,
      offline: hackathons.filter(h => h.locationType === 'Offline').length,
      active: hackathons.filter(h => h.status === 'ACTIVE' || h.status === 'UPCOMING' || !h.status).length,
      virtual: hackathons.filter(h => h.locationType === 'Online').length,
      byTier
    };
  }
}

export const INITIAL_HACKATHON_DATABASE: Hackathon[] = [
  {
    id: 'hackmit-2025',
    name: 'HackMIT',
    location: 'Cambridge, MA, USA',
    locationType: 'Offline',
    coordinates: { lat: 42.3601, lng: -71.0942 },
    startDate: '2025-09-13',
    endDate: '2025-09-15',
    timePeriod: 'Sep 13 - Sep 15, 2025',
    conductedBy: 'MIT',
    prizeMoney: '$10,000+',
    prizeType: 'Price',
    category: 'General',
    participantCount: 1000,
    url: 'https://hackmit.org',
    relevanceScore: 98,
    discoveryTier: 1,
    status: 'UPCOMING',
    source: 'Vault'
  },
  {
    id: 'ethindia-2025',
    name: 'ETHIndia',
    location: 'Bangalore, India',
    locationType: 'Offline',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    startDate: '2025-12-05',
    endDate: '2025-12-07',
    timePeriod: 'Dec 5 - Dec 7, 2025',
    conductedBy: 'Devfolio',
    prizeMoney: '$50,000',
    prizeType: 'Price',
    category: 'Blockchain & Web3',
    participantCount: 2000,
    url: 'https://ethindia.co',
    relevanceScore: 95,
    discoveryTier: 1,
    status: 'UPCOMING',
    source: 'Vault'
  }
];