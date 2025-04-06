// Kenya locations with coordinates
export interface KenyaLocation {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  region: string;
}

export const kenyaLocations: KenyaLocation[] = [
  // Major cities
  { name: "Nairobi", coordinates: [36.8219, -1.2921], region: "Nairobi" },
  { name: "Mombasa", coordinates: [39.6682, -4.0435], region: "Coast" },
  { name: "Kisumu", coordinates: [34.7617, -0.1022], region: "Nyanza" },
  { name: "Nakuru", coordinates: [36.0667, -0.3031], region: "Rift Valley" },
  { name: "Eldoret", coordinates: [35.2699, 0.5209], region: "Rift Valley" },
  
  // Nairobi neighborhoods and nearby areas (for closer proximity)
  { name: "Westlands", coordinates: [36.8066, -1.2697], region: "Nairobi" },
  { name: "Karen", coordinates: [36.7062, -1.3192], region: "Nairobi" },
  { name: "Kilimani", coordinates: [36.7957, -1.2864], region: "Nairobi" },
  { name: "Kileleshwa", coordinates: [36.7789, -1.2775], region: "Nairobi" },
  { name: "Lavington", coordinates: [36.7651, -1.2747], region: "Nairobi" },
  { name: "Parklands", coordinates: [36.8149, -1.2602], region: "Nairobi" },
  { name: "Gigiri", coordinates: [36.8021, -1.2311], region: "Nairobi" },
  { name: "Runda", coordinates: [36.8021, -1.2211], region: "Nairobi" },
  { name: "Kitisuru", coordinates: [36.7651, -1.2347], region: "Nairobi" },
  { name: "Langata", coordinates: [36.7426, -1.3364], region: "Nairobi" },
  
  // Other popular areas
  { name: "Diani Beach", coordinates: [39.5903, -4.3223], region: "Coast" },
  { name: "Malindi", coordinates: [40.1169, -3.2175], region: "Coast" },
  { name: "Naivasha", coordinates: [36.4326, -0.7172], region: "Rift Valley" },
  { name: "Nanyuki", coordinates: [37.0742, 0.0172], region: "Central" },
  { name: "Thika", coordinates: [37.0833, -1.0333], region: "Central" }
];

// Default center point (Nairobi)
export const kenyaDefaultCenter: [number, number] = [36.8219, -1.2921];
