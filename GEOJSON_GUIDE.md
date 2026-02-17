# GeoJSON Globe Integration Guide

## Overview
This enhanced globe component supports custom GeoJSON data to display accurate country borders, coastlines, and geographical features.

## Usage

### Basic Usage (with texture)
```tsx
import GlobeView from './GlobeViewWithGeoJSON';

<GlobeView 
  hackathons={hackathonData} 
  onSelect={handleSelection}
/>
```

### With Custom GeoJSON
```tsx
<GlobeView 
  hackathons={hackathonData} 
  onSelect={handleSelection}
  geoJsonUrl="https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
/>
```

## Popular GeoJSON Data Sources

### 1. **Natural Earth Data** (Recommended)
High-quality geographical data at various scales:
- Countries (110m): `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson`
- Countries (50m): `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson`
- Land polygons: `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson`

### 2. **World Atlas TopoJSON** (Convert to GeoJSON)
```bash
# Install topojson-client
npm install topojson-client

# In your code:
import * as topojson from 'topojson-client';
const response = await fetch('https://unpkg.com/world-atlas@2/countries-110m.json');
const topology = await response.json();
const geojson = topojson.feature(topology, topology.objects.countries);
```

### 3. **GeoJSON.xyz**
Simple country boundaries:
- `https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson`

### 4. **Custom GeoJSON from geojson.io**
1. Visit https://geojson.io
2. Draw custom shapes or import data
3. Export as GeoJSON
4. Host the file or use inline

## Local GeoJSON Files

### Using a local file
```tsx
// Place GeoJSON in public folder: /public/data/countries.geojson

<GlobeView 
  hackathons={hackathonData} 
  onSelect={handleSelection}
  geoJsonUrl="/data/countries.geojson"
/>
```

### Using imported GeoJSON
```tsx
import countriesData from './data/countries.json';
import { useState, useEffect } from 'react';

function App() {
  const [geoData, setGeoData] = useState(null);
  
  useEffect(() => {
    // Convert imported data to URL
    const blob = new Blob([JSON.stringify(countriesData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    setGeoData(url);
    
    return () => URL.revokeObjectURL(url);
  }, []);
  
  return (
    <GlobeView 
      hackathons={hackathonData} 
      onSelect={handleSelection}
      geoJsonUrl={geoData}
    />
  );
}
```

## GeoJSON Format Requirements

Your GeoJSON must follow this structure:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "United States",
        "ADMIN": "United States of America"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[lng, lat], [lng, lat], ...]]
      }
    }
  ]
}
```

Supported geometry types:
- `Polygon`
- `MultiPolygon`
- `LineString`
- `MultiLineString`

## Features

### Toggle Between Modes
- **Texture Mode**: Uses Earth day texture (default)
- **GeoJSON Mode**: Shows country borders and polygons from your data

Click the "GeoJSON/TEXTURE" button to switch modes.

### Customization

#### Change Border Color
```tsx
// In GeoJsonBorders component, modify:
<lineBasicMaterial 
  color="#a3e635"  // Change this
  transparent 
  opacity={0.4}
/>
```

#### Change Country Fill Colors
```tsx
// In GeoJsonPolygons component, modify the getColor() function:
const getColor = () => {
  if (countryName.includes('United States')) return '#ff0000';
  if (countryName.includes('China')) return '#00ff00';
  return '#0000ff'; // Default color
};
```

#### Adjust Border Thickness
Note: WebGL `linewidth` doesn't work on most systems. For thicker lines, use a custom shader or tube geometry.

## Performance Optimization

For large GeoJSON files (>5MB):

1. **Simplify geometry** using mapshaper:
```bash
npm install -g mapshaper
mapshaper input.json -simplify 10% -o output.json
```

2. **Use lower resolution data** (110m instead of 10m)

3. **Filter features** before rendering:
```tsx
const filteredData = {
  ...geoJsonData,
  features: geoJsonData.features.filter(f => 
    f.properties.continent === 'North America'
  )
};
```

## Example: Download and Use Custom Data

```bash
# Download Natural Earth countries (110m resolution)
curl -o countries.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson

# Place in your project
mv countries.geojson public/data/
```

Then use it:
```tsx
<GlobeView 
  hackathons={hackathonData} 
  onSelect={handleSelection}
  geoJsonUrl="/data/countries.geojson"
/>
```

## Interactive Features

- **Auto-rotation toggle**: Pause/resume globe rotation
- **Mode switcher**: Toggle between texture and GeoJSON visualization
- **Selection system**: Click markers to highlight and display info
- **Zoom-responsive**: Labels and markers scale based on camera distance

## Troubleshooting

### GeoJSON not displaying
1. Check browser console for fetch errors
2. Verify GeoJSON is valid at https://geojson.io
3. Ensure CORS is enabled if loading from external source
4. Check that coordinates are in [longitude, latitude] format

### Performance issues
1. Use simplified geometry (110m or 50m resolution)
2. Limit features to visible regions
3. Reduce particle count in ParticleField component
4. Disable connection arcs for large datasets

### Colors not showing
1. Verify opacity values are > 0
2. Check that materials have `transparent: true`
3. Ensure polygons are properly triangulated
