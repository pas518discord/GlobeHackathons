# 🌍 Hackathon Globe with Persistent Database

## Overview

This system creates a **persistent, searchable database** of global hackathons that:
- ✅ **Searches once** and saves all data
- ✅ **Never searches again** after initial load
- ✅ **Stores in browser** (localStorage) - data persists across sessions
- ✅ **Zoom-based visibility** - shows more hackathons as you zoom in
- ✅ **Smart date filtering** - only shows open/upcoming hackathons

---

## 🗄️ How the Database Works

### First Time Load
```
User opens app
  ↓
Check localStorage for saved hackathons
  ↓
If empty: Load INITIAL_HACKATHON_DATABASE
  ↓
Save to localStorage
  ↓
Display on globe
```

### Subsequent Loads
```
User opens app
  ↓
Load hackathons from localStorage
  ↓
Display immediately (no searching!)
  ↓
Data persists across sessions
```

---

## 📊 Current Database

The system comes pre-loaded with **40+ hackathons** from around the world:

### By Region:
- **North America**: 12 hackathons (USA, Canada)
- **Europe**: 6 hackathons (UK, Finland, Switzerland, Spain, Slovakia)
- **Asia**: 6 hackathons (India, Singapore, Japan, Korea, Hong Kong, Thailand)
- **South America**: 2 hackathons (Brazil, Argentina)
- **Oceania**: 2 hackathons (Australia)
- **Africa**: 2 hackathons (Kenya, South Africa)
- **Virtual**: 1 global online hackathon

### By Tier (Zoom Level):
- **Tier 1** (Major - Always visible): 15 hackathons
  - HackMIT, PennApps, Cal Hacks, TreeHacks, etc.
- **Tier 2** (Medium - Visible at medium zoom): 15 hackathons
  - HackUTD, HackGT, regional events
- **Tier 3** (Small - Only when zoomed in): 10 hackathons
  - Local university hackathons

---

## 🔍 Zoom-Based Visibility System

### How It Works

The globe uses **intelligent zoom-based filtering** to prevent overcrowding:

| Camera Distance | Zoom Level | What's Visible |
|----------------|-----------|----------------|
| 10+ | Global View | Nothing (too far) |
| 6-10 | Continental | Tier 1 only (15 major hackathons) |
| 4-6 | Regional | Tier 1 + 2 (30 hackathons) |
| 2.5-4 | City View | All tiers (40+ hackathons) |

### Visual Example:
```
Zoomed Out (Distance: 8)
├── 🔴 HackMIT (Tier 1) ✓ VISIBLE
├── 🔴 PennApps (Tier 1) ✓ VISIBLE
├── ⚪ HackUTD (Tier 2) ✗ HIDDEN
└── ⚪ Local Hack (Tier 3) ✗ HIDDEN

Medium Zoom (Distance: 5)
├── 🔴 HackMIT (Tier 1) ✓ VISIBLE
├── 🔴 PennApps (Tier 1) ✓ VISIBLE
├── 🟡 HackUTD (Tier 2) ✓ VISIBLE
└── ⚪ Local Hack (Tier 3) ✗ HIDDEN

Zoomed In (Distance: 3)
├── 🔴 HackMIT (Tier 1) ✓ VISIBLE
├── 🔴 PennApps (Tier 1) ✓ VISIBLE
├── 🟡 HackUTD (Tier 2) ✓ VISIBLE
└── 🟢 Local Hack (Tier 3) ✓ VISIBLE
```

---

## 📅 Date-Based Filtering

### Automatic Filtering
The system automatically hides hackathons that have ended:

```typescript
// Only shows hackathons where endDate >= today
getActiveHackathons() {
  return hackathons.filter(h => 
    new Date(h.endDate) >= new Date()
  );
}
```

### Example:
```
Today: March 14, 2025

HackMIT (Mar 14-30, 2025) ✓ VISIBLE
  - End date: Mar 30, 2025
  - Status: Open, ongoing

TreeHacks (Feb 14-16, 2025) ✗ HIDDEN
  - End date: Feb 16, 2025
  - Status: Already ended
```

---

## 💾 Files Structure

```
your-project/
├── src/
│   ├── HackathonDatabase.ts          ← Database manager + initial data
│   ├── ZoomBasedVisibility.ts        ← Zoom logic
│   ├── GlobeViewWithDatabase.tsx     ← Main component
│   └── types.ts
```

### 1. HackathonDatabase.ts
**Purpose**: Manages persistent storage

**Key Functions**:
```typescript
// Save to localStorage
HackathonDatabaseManager.saveHackathons(hackathons)

// Load from localStorage
HackathonDatabaseManager.loadHackathons()

// Get only active (not ended) hackathons
HackathonDatabaseManager.getActiveHackathons()

// Get statistics
HackathonDatabaseManager.getStats()

// Clear database
HackathonDatabaseManager.clearDatabase()
```

**Contains**: 40+ pre-loaded hackathons in `INITIAL_HACKATHON_DATABASE`

### 2. ZoomBasedVisibility.ts
**Purpose**: Controls which hackathons are visible at different zoom levels

**Key Functions**:
```typescript
// Get visible hackathons based on camera distance
ZoomVisibilityManager.getVisibleHackathons(all, cameraDistance)

// Get zoom level name
ZoomVisibilityManager.getZoomLevelLabel(distance)

// Get description of what's visible
ZoomVisibilityManager.getVisibilityDescription(distance)
```

### 3. GlobeViewWithDatabase.tsx
**Purpose**: Main React component that ties everything together

**Features**:
- Loads database on mount
- Updates visible hackathons on zoom
- Displays stats panel
- Handles user interactions

---

## 🎮 User Interface

### Stats Panel (Top Right)
Shows real-time information:
- **Total in Database**: All hackathons stored
- **Visible Now**: How many you can currently see
- **Hidden**: How many are hidden due to zoom
- **Zoom Level**: Current view (Global/Continental/Regional/City)
- **Active**: Hackathons that haven't ended yet
- **Tier Distribution**: Bar charts showing T1/T2/T3

### Control Panel (Bottom Left)
- **⏸ PAUSE / ▶ ROTATE**: Toggle auto-rotation
- **🔄 RELOAD DB**: Reload initial database
- **🗑️ CLEAR DB**: Delete all stored data
- **✕ CLEAR**: Deselect hackathon

---

## 📝 How to Add More Hackathons

### Option 1: Manually Add to Database

Edit `HackathonDatabase.ts` and add to `INITIAL_HACKATHON_DATABASE`:

```typescript
{
  id: 'my-hackathon-2025',
  name: 'My Hackathon',
  location: 'San Francisco, CA, USA',
  coordinates: { lat: 37.7749, lng: -122.4194 },
  startDate: '2025-06-15',
  endDate: '2025-06-17',
  registrationUrl: 'https://myhackathon.com',
  tags: ['AI', 'Web3'],
  isVirtual: false,
  discoveryTier: 1, // 1=major, 2=medium, 3=small
  lastUpdated: new Date().toISOString()
}
```

### Option 2: Add Programmatically

```typescript
import { HackathonDatabaseManager } from './HackathonDatabase';

const newHackathon = {
  id: 'unique-id',
  name: 'New Hackathon',
  // ... other fields
};

HackathonDatabaseManager.addOrUpdateHackathon(newHackathon);
```

---

## 🔧 Customization

### Change Zoom Thresholds

Edit `ZoomBasedVisibility.ts`:

```typescript
private static readonly DEFAULT_SETTINGS: VisibilitySettings = {
  tier1Distance: 10,  // Show major hackathons
  tier2Distance: 6,   // Show medium hackathons
  tier3Distance: 4,   // Show small hackathons
  maxDistance: 10,
  minDistance: 2.5,
};
```

### Change Marker Sizes

Edit the `markerBaseSize` in `HackathonMarker` component:

```typescript
const markerBaseSize = 0.02; // Smaller = 0.01, Larger = 0.04
```

### Change Colors

Replace color codes in the components:
- `#f4a259` - Orange (primary)
- `#a3e635` - Lime green (accent)
- `#2c1808` - Brown (background)

---

## 📊 Database Statistics

### View Stats in Console

```typescript
import { HackathonDatabaseManager } from './HackathonDatabase';

const stats = HackathonDatabaseManager.getStats();
console.log(stats);

// Output:
// {
//   total: 40,
//   active: 35,
//   byContinent: { 'North America': 12, 'Europe': 6, ... },
//   byTier: { tier1: 15, tier2: 15, tier3: 10 },
//   virtual: 1,
//   inPerson: 39
// }
```

---

## 🚀 Usage Example

```typescript
import GlobeViewWithDatabase from './GlobeViewWithDatabase';

function App() {
  const handleSelect = (hackathon) => {
    console.log('Selected:', hackathon);
    // Navigate to hackathon page
    // Show modal
    // etc.
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GlobeViewWithDatabase onSelect={handleSelect} />
    </div>
  );
}
```

---

## 💡 Key Features Summary

### ✅ What This System Does

1. **No Repeated Searches**
   - Loads data once
   - Saves to localStorage
   - Persists across sessions

2. **Smart Visibility**
   - Shows 15 hackathons when zoomed out
   - Shows 30 when medium zoom
   - Shows all 40+ when zoomed in

3. **Date Awareness**
   - Automatically filters out past hackathons
   - Only shows open/upcoming events

4. **Persistent Storage**
   - Data survives page refresh
   - No need to reload

5. **Real-time Stats**
   - See exactly what's visible
   - Track database status
   - Monitor zoom level

---

## 🐛 Troubleshooting

### Database Not Loading
```typescript
// Check if data exists
const hackathons = HackathonDatabaseManager.loadHackathons();
console.log('Loaded:', hackathons.length);

// If 0, reload:
HackathonDatabaseManager.saveHackathons(INITIAL_HACKATHON_DATABASE);
```

### Too Many/Few Hackathons Visible
Adjust zoom thresholds in `ZoomBasedVisibility.ts`

### Clear Everything and Start Fresh
Click "🗑️ CLEAR DB" button or:
```typescript
HackathonDatabaseManager.clearDatabase();
window.location.reload();
```

---

## 📈 Future Enhancements

Possible additions:
- [ ] Import from external API
- [ ] Export database as JSON
- [ ] Filter by date range
- [ ] Filter by tags/categories
- [ ] Search functionality
- [ ] User-submitted hackathons
- [ ] Sync across devices

---

## ✨ Summary

**You now have**:
- 🗄️ Persistent database with 40+ hackathons
- 🔍 Zoom-based smart filtering
- 📅 Automatic date filtering
- 💾 Browser storage (never search again!)
- 📊 Real-time statistics
- 🎮 Easy management controls

**The system**:
- ✅ Searches ONCE on first load
- ✅ Saves everything to localStorage
- ✅ Shows/hides based on zoom
- ✅ Filters by date automatically
- ✅ Persists across sessions
