import { Hackathon } from '../types.ts';

export interface VisibilitySettings {
  tier1Distance: number;
  tier2Distance: number;
  tier3Distance: number;
  maxDistance: number;
  minDistance: number;
}

export class ZoomVisibilityManager {
  private static readonly DEFAULT_SETTINGS: VisibilitySettings = {
    tier1Distance: 10,
    tier2Distance: 6,
    tier3Distance: 4,
    maxDistance: 10,
    minDistance: 2.5,
  };

  static getVisibleHackathons(allHackathons: Hackathon[], cameraDistance: number): Hackathon[] {
    return allHackathons.filter(h => {
      const tier = h.discoveryTier || 3;
      if (tier === 1) return cameraDistance <= 10;
      if (tier === 2) return cameraDistance <= 6;
      return cameraDistance <= 4;
    });
  }

  static getZoomLevelLabel(cameraDistance: number): string {
    if (cameraDistance >= 8) return 'Global View';
    if (cameraDistance >= 6) return 'Continental View';
    if (cameraDistance >= 4) return 'Regional View';
    return 'City View';
  }

  static getVisibilityDescription(cameraDistance: number): string {
    if (cameraDistance <= 4) return 'Showing all nodes';
    if (cameraDistance <= 6) return 'Showing major & regional nodes';
    return 'Showing major global nodes';
  }
}

export function getMarkerScaleForDistance(cameraDistance: number, tier: number): number {
  const baseScale = tier === 1 ? 1.0 : tier === 2 ? 0.8 : 0.6;
  return baseScale * Math.max(0.3, Math.min(1.5, (6.0 / cameraDistance) ** 1.2));
}

export function shouldShowLabels(cameraDistance: number): boolean {
  return cameraDistance < 5;
}