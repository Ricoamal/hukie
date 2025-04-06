// Utility function to generate nearby coordinates
function generateNearbyCoordinates(
  centerLat: number, 
  centerLng: number, 
  radiusMiles: number = 3
): [number, number] {
  // Convert miles to degrees (approximate)
  // 1 mile is roughly 0.0144927 degrees
  const radiusDegrees = radiusMiles * 0.0144927;

  // Generate random angle
  const angle = Math.random() * 2 * Math.PI;

  // Calculate new coordinates
  const newLat = centerLat + (Math.sin(angle) * radiusDegrees);
  const newLng = centerLng + (Math.cos(angle) * radiusDegrees);

  return [newLng, newLat]; // Mapbox uses [lng, lat]
}

// Nairobi city center coordinates
const NAIROBI_CENTER: [number, number] = [-1.2921, 36.8219];

export interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  images: string[];
  distance: number;
  coordinates: [number, number];
  gender: 'male' | 'female';
}

export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Emma',
    age: 28,
    location: 'Nairobi',
    bio: 'Adventure seeker and coffee lover',
    interests: ['Hiking', 'Photography', 'Travel'],
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    ],
    distance: 3,
    coordinates: generateNearbyCoordinates(...NAIROBI_CENTER),
    gender: 'female'
  },
  {
    id: '2',
    name: 'Alex',
    age: 32,
    location: 'Nairobi',
    bio: 'Tech enthusiast and startup founder',
    interests: ['Coding', 'Entrepreneurship', 'Fitness'],
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    ],
    distance: 5,
    coordinates: generateNearbyCoordinates(...NAIROBI_CENTER),
    gender: 'male'
  },
  {
    id: '3',
    name: 'Sophia',
    age: 26,
    location: 'Nairobi',
    bio: 'Art curator with a passion for local culture',
    interests: ['Art', 'Museums', 'Cooking'],
    images: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    ],
    distance: 2,
    coordinates: generateNearbyCoordinates(...NAIROBI_CENTER),
    gender: 'female'
  },
  {
    id: '4',
    name: 'Michael',
    age: 35,
    location: 'Nairobi',
    bio: 'Environmental scientist and nature lover',
    interests: ['Conservation', 'Cycling', 'Sustainability'],
    images: [
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    ],
    distance: 7,
    coordinates: generateNearbyCoordinates(...NAIROBI_CENTER),
    gender: 'male'
  },
  {
    id: '5',
    name: 'Olivia',
    age: 29,
    location: 'Nairobi',
    bio: 'Marketing professional and fitness instructor',
    interests: ['Yoga', 'Digital Marketing', 'Wellness'],
    images: [
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    ],
    distance: 8,
    coordinates: generateNearbyCoordinates(...NAIROBI_CENTER),
    gender: 'female'
  },
  {
    id: '6',
    name: 'David',
    age: 33,
    location: 'Nairobi',
    bio: 'Lawyer with a love for music and travel',
    interests: ['Jazz', 'International Law', 'Hiking'],
    images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    ],
    distance: 6,
    coordinates: generateNearbyCoordinates(...NAIROBI_CENTER),
    gender: 'male'
  },
  {
    id: '7',
    name: 'Isabella',
    age: 27,
    location: 'Nairobi',
    bio: 'Graphic designer and creative spirit',
    interests: ['Design', 'Street Art', 'Photography'],
    images: [
      "https://images.unsplash.com/photo-1526510747491-58f928ec870f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    ],
    distance: 4,
    coordinates: generateNearbyCoordinates(...NAIROBI_CENTER),
    gender: 'female'
  },
  {
    id: '8',
    name: 'James',
    age: 30,
    location: 'Nairobi',
    bio: 'Software engineer and tech innovator',
    interests: ['AI', 'Robotics', 'Gaming'],
    images: [
      "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    ],
    distance: 3,
    coordinates: generateNearbyCoordinates(...NAIROBI_CENTER),
    gender: 'male'
  },
  {
    id: '9',
    name: 'Ava',
    age: 25,
    location: 'Nairobi',
    bio: 'Journalist and social media influencer',
    interests: ['Writing', 'Social Media', 'Podcasting'],
    images: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    ],
    distance: 5,
    coordinates: generateNearbyCoordinates(...NAIROBI_CENTER),
    gender: 'female'
  },
  {
    id: '10',
    name: 'Christopher',
    age: 36,
    location: 'Nairobi',
    bio: 'Chef and culinary explorer',
    interests: ['Cooking', 'Food Photography', 'Traveling'],
    images: [
      "https://images.unsplash.com/photo-1508341591423-4347099e1f19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    ],
    distance: 7,
    coordinates: generateNearbyCoordinates(...NAIROBI_CENTER),
    gender: 'male'
  }
];
