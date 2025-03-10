import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type City = 'Phnom Penh' | 'Siem Reap' | 'Sihanoukville';
type CityDistricts = {
  [K in City]: string[];
};

const CITIES: CityDistricts = {
  'Phnom Penh': [
    'Chamkarmon', 'Daun Penh', 'Tuol Kork', 'Sen Sok', 'Mean Chey'
  ],
  'Siem Reap': [
    'Sala Kamreuk', 'Svay Dangkum', 'Kouk Chak', 'Siem Reap'
  ],
  'Sihanoukville': [
    'Sangkat 1', 'Sangkat 2', 'Sangkat 3', 'Sangkat 4'
  ]
};

const AMENITIES = [
  'Air Conditioning',
  'WiFi',
  'Kitchen',
  'Washing Machine',
  'TV',
  'Parking',
  'Security',
  'Balcony',
  'Swimming Pool',
  'Gym',
  'Elevator',
  'Hot Water',
  '24/7 Security',
  'CCTV'
];

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Condo', 'Studio'];

interface User {
  email: string;
  password: string;
  full_name: string;
  role: 'owner' | 'tenant';
}

const UNSPLASH_IMAGES = [
  // Apartments
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', // Modern apartment
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', // Luxury apartment
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', // Cozy apartment
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00', // Modern living room
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9', // Contemporary apartment
  'https://images.unsplash.com/photo-1598928636135-d146006ff4be', // Bright apartment
  // Houses
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233', // Modern house
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', // Luxury house
  'https://images.unsplash.com/photo-1576941089067-2de3c901e126', // Traditional house
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750', // Modern villa
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', // Single family home
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', // Luxury villa
  // Rooms
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af', // Bedroom
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c', // Living room
  'https://images.unsplash.com/photo-1540518614846-7eded433c457', // Master bedroom
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0', // Modern bedroom
  // Interiors
  'https://images.unsplash.com/photo-1554995207-c18c203602cb', // Kitchen
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a', // Bathroom
  'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92', // Modern kitchen
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14', // Luxury bathroom
];

function getRandomImages(count: number = 3): string[] {
  const shuffled = [...UNSPLASH_IMAGES].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);
  // Add quality and size parameters to the URLs
  return selected.map(url => `${url}?auto=format&fit=crop&w=800&q=80`);
}

async function seedUsers() {
  // Create sample owners
  const owners: User[] = [
    {
      email: 'owner1@example.com',
      password: 'password123',
      full_name: 'John Owner',
      role: 'owner',
    },
    {
      email: 'owner2@example.com',
      password: 'password123',
      full_name: 'Jane Owner',
      role: 'owner',
    }
  ];

  // Create sample tenants
  const tenants: User[] = [
    {
      email: 'tenant1@example.com',
      password: 'password123',
      full_name: 'Alice Tenant',
      role: 'tenant',
    },
    {
      email: 'tenant2@example.com',
      password: 'password123',
      full_name: 'Bob Tenant',
      role: 'tenant',
    }
  ];

  const users = [...owners, ...tenants];
  const createdOwners: { id: string }[] = [];
  
  for (const user of users) {
    try {
      // First, check if user exists
      const { data: existingUsers } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', user.email)
        .single();

      if (existingUsers) {
        if (user.role === 'owner') {
          createdOwners.push({ id: existingUsers.id });
        }
        console.log(`✅ Using existing user: ${user.email}`);
        continue;
      }

      // If user doesn't exist, create them
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        }
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError);
        continue;
      }

      if (!authData.user) {
        console.error(`No user data returned for ${user.email}`);
        continue;
      }

      // Then, create the user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          subscription_tier: user.role === 'owner' ? 'free' : null,
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError);
        continue;
      }

      if (user.role === 'owner') {
        createdOwners.push({ id: authData.user.id });
      }

      console.log(`✅ Created user: ${user.email}`);
    } catch (error) {
      console.error(`Error processing user ${user.email}:`, error);
    }
  }

  if (createdOwners.length === 0) {
    // If no owners were found or created, try to get existing owners from the database
    const { data: existingOwners } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'owner');

    if (existingOwners && existingOwners.length > 0) {
      createdOwners.push(...existingOwners);
      console.log('✅ Using existing owners from database');
    }
  }

  return createdOwners;
}

function generateRandomPrice(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function seedProperties(owners: { id: string }[]) {
  const properties = [];
  const totalProperties = 50; // Increased from 20 to 50 properties

  const propertyDescriptions = [
    'Stunning %type% with modern amenities and beautiful city views.',
    'Spacious %type% in a prime location, perfect for families or professionals.',
    'Charming %type% with traditional design elements and modern comforts.',
    'Luxurious %type% featuring high-end finishes and premium amenities.',
    'Cozy %type% in a peaceful neighborhood, ideal for comfortable living.',
    'Contemporary %type% with smart home features and stylish design.',
    'Elegant %type% offering the perfect blend of comfort and luxury.',
    'Modern %type% with excellent facilities and convenient location.'
  ];

  for (let i = 0; i < totalProperties; i++) {
    const city = Object.keys(CITIES)[Math.floor(Math.random() * Object.keys(CITIES).length)] as City;
    const district = CITIES[city][Math.floor(Math.random() * CITIES[city].length)];
    const propertyType = PROPERTY_TYPES[Math.floor(Math.random() * PROPERTY_TYPES.length)];
    const owner = owners[Math.floor(Math.random() * owners.length)];
    
    // More varied pricing based on property type and city
    const baseRate = propertyType === 'Villa' ? generateRandomPrice(150, 300) :
                    propertyType === 'House' ? generateRandomPrice(100, 200) :
                    propertyType === 'Condo' ? generateRandomPrice(80, 150) :
                    generateRandomPrice(30, 100);
    
    const weeklyRate = Math.floor(baseRate * 6.5); // Slightly better weekly discount
    const monthlyRate = Math.floor(baseRate * 26); // Better monthly discount

    // Select random description and replace placeholder
    const descriptionTemplate = propertyDescriptions[Math.floor(Math.random() * propertyDescriptions.length)];
    const description = descriptionTemplate.replace('%type%', propertyType.toLowerCase());

    const property = {
      name: `${propertyType} in ${district}`,
      description,
      address: `${Math.floor(Math.random() * 100) + 1} Street ${Math.floor(Math.random() * 100) + 1}, ${district}, ${city}`,
      city,
      country: 'Cambodia',
      images: getRandomImages(Math.floor(Math.random() * 2) + 3), // 3-4 images per property
      amenities: getRandomItems(AMENITIES, Math.floor(Math.random() * 8) + 4),
      daily_rate: baseRate,
      weekly_rate: weeklyRate,
      monthly_rate: monthlyRate,
      status: 'available',
      owner_id: owner.id,
      property_type: propertyType,
      bedrooms: Math.floor(Math.random() * 4) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      square_meters: Math.floor(Math.random() * 150) + 50,
    };

    const { error } = await supabase
      .from('properties')
      .insert(property);

    if (error) {
      console.error(`Error creating property ${property.name}:`, error);
      continue;
    }

    console.log(`✅ Created property: ${property.name}`);
    properties.push(property);
  }

  return properties;
}

async function main() {
  try {
    console.log('🌱 Starting seed...');
    
    console.log('Creating users...');
    const owners = await seedUsers();
    
    if (owners.length === 0) {
      throw new Error('No owners were created. Cannot proceed with property creation.');
    }

    console.log('Creating properties...');
    await seedProperties(owners);
    
    console.log('✅ Seed completed!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main(); 