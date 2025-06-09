import { v4 as uuidv4 } from 'uuid';
import { generateSlug } from '../lib/utils';
import { type Campaign, type CampaignStatus, CAMPAIGN_STATUS, categories, type User, USER_ROLES } from '../lib/types';

// Example users for campaigns
export const exampleUsers: User[] = [
  {
    id: '100',
    email: 'john.doe@example.com',
    role: USER_ROLES.CAMPAIGN_OWNER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '101',
    email: 'jane.smith@example.com',
    role: USER_ROLES.CAMPAIGN_OWNER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '102',
    email: 'robert.johnson@example.com',
    role: USER_ROLES.CAMPAIGN_OWNER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '103',
    email: 'sarah.wilson@example.com',
    role: USER_ROLES.CAMPAIGN_OWNER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '104',
    email: 'michael.brown@example.com',
    role: USER_ROLES.CAMPAIGN_OWNER,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const exampleUserProfiles = [
  {
    id: uuidv4(),
    user_id: exampleUsers[0].id,
    first_name: 'John',
    last_name: 'Doe',
    avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    phone: '+1 555-123-4567',
    date_of_birth: '1985-06-15',
    country: 'United States',
    city: 'San Francisco',
    postal_code: '94105',
    address: '123 Tech Lane',
    bio: 'Passionate about supporting medical causes and healthcare accessibility worldwide.',
    website_url: 'https://johndoe.example.com',
    social_links: {
      twitter: 'https://twitter.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      instagram: 'https://instagram.com/johndoe'
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: true
      }
    }
  },
  {
    id: uuidv4(),
    user_id: exampleUsers[1].id,
    first_name: 'Jane',
    last_name: 'Smith',
    avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    phone: '+1 555-987-6543',
    date_of_birth: '1990-03-22',
    country: 'United States',
    city: 'Boston',
    postal_code: '02108',
    address: '456 Education Avenue',
    bio: 'Education advocate dedicated to creating learning opportunities for underserved communities.',
    website_url: 'https://janesmith.example.com',
    social_links: {
      twitter: 'https://twitter.com/janesmith',
      linkedin: 'https://linkedin.com/in/janesmith',
      facebook: 'https://facebook.com/janesmith'
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: false
      }
    }
  },
  {
    id: uuidv4(),
    user_id: exampleUsers[2].id,
    first_name: 'Robert',
    last_name: 'Johnson',
    avatar_url: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    phone: '+1 555-456-7890',
    date_of_birth: '1978-11-08',
    country: 'United States',
    city: 'Los Angeles',
    postal_code: '90001',
    address: '789 Environmental Drive',
    bio: 'Environmental scientist committed to conservation projects and sustainable initiatives.',
    website_url: 'https://robertjohnson.example.com',
    social_links: {
      twitter: 'https://twitter.com/robertjohnson',
      linkedin: 'https://linkedin.com/in/robertjohnson',
      youtube: 'https://youtube.com/robertjohnson'
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: false,
        push: true
      }
    }
  },
  {
    id: uuidv4(),
    user_id: exampleUsers[3].id,
    first_name: 'Sarah',
    last_name: 'Wilson',
    avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    phone: '+1 555-234-5678',
    date_of_birth: '1982-09-14',
    country: 'United States',
    city: 'New York',
    postal_code: '10001',
    address: '101 Community Blvd',
    bio: 'Community organizer focused on local initiatives that build stronger neighborhoods and support small businesses.',
    website_url: 'https://sarahwilson.example.com',
    social_links: {
      twitter: 'https://twitter.com/sarahwilson',
      instagram: 'https://instagram.com/sarahwilson',
      tiktok: 'https://tiktok.com/@sarahwilson'
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: true
      }
    }
  },
  {
    id: uuidv4(),
    user_id: exampleUsers[4].id,
    first_name: 'Michael',
    last_name: 'Brown',
    avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    phone: '+1 555-876-5432',
    date_of_birth: '1975-05-27',
    country: 'United States',
    city: 'Chicago',
    postal_code: '60601',
    address: '202 Animal Shelter Road',
    bio: 'Animal welfare activist who has helped establish multiple animal rescue organizations across the country.',
    website_url: 'https://michaelbrown.example.com',
    social_links: {
      facebook: 'https://facebook.com/michaelbrown',
      instagram: 'https://instagram.com/michaelbrown',
      youtube: 'https://youtube.com/michaelbrown'
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      notifications: {
        email: true,
        push: false
      }
    }
  }
];

// Example campaigns for the platform
export const campaigns: Campaign[] = [
  {
    id: uuidv4(),
    slug: generateSlug('Medical Equipment for Rural Clinic'),
    title: 'Medical Equipment for Rural Clinic',
    location: 'Guatemala',
    country: 'Guatemala',
    amountRaised: 12500,
    goal: 35000,
    goalAmount: 35000,
    currentAmount: 12500,
    featuredImageUrl: 'https://images.pexels.com/photos/8475547/pexels-photo-8475547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    currency: 'USD',
    description: 'Help us provide essential medical equipment to our rural clinic serving over 5,000 people who otherwise would have no access to healthcare. We need ultrasound machines, basic surgical tools, and diagnostic equipment.',
    status: CAMPAIGN_STATUS.EXAMPLE as CampaignStatus,
    category: categories[0], // Medical
    donorCount: 84,
    daysLeft: 45,
    isUrgent: true,
    isFeatured: true,
    verificationStatus: 'verified',
    viewCount: 1560,
    shareCount: 98,
    tags: ['medical', 'rural', 'equipment'],
    metadata: {
      clinicName: 'San Miguel Rural Clinic',
      population: '5000+'
    },
    beneficiaryInfo: {
      name: 'San Miguel Rural Clinic',
      type: 'healthcare facility',
      beneficiaries: 'Rural community'
    },
    bankDetails: {
      accountName: 'San Miguel Healthcare Initiative',
      accountType: 'Non-profit'
    },
    socialLinks: {
      facebook: 'https://facebook.com/sanmiguelclinic',
      twitter: 'https://twitter.com/sanmiguelclinic'
    },
    updates: [],
    faq: [
      { question: 'What equipment is most urgently needed?', answer: 'Ultrasound machines, basic surgical tools, and diagnostic equipment.' }
    ],
    teamMembers: [],
    expenses: [],
    milestones: [],
    riskFactors: 'Equipment delivery may be delayed due to rural location and transportation challenges.',
    impactStatement: 'Your donation provides healthcare access to thousands of people in remote villages who currently have no medical facilities.',
    targetAudience: 'Medical professionals, humanitarian aid donors, and anyone passionate about global healthcare equity.',
    marketingPlan: '',
    successMetrics: {
      healthcareGoals: 'Establish fully functional clinic serving 5,000+ residents',
      communityImpact: 'Reduce infant mortality by 30% in the first year'
    },
    externalLinks: [],
    pressCoverage: [],
    endorsements: [],
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: exampleUsers[0],
  },
  {
    id: uuidv4(),
    slug: generateSlug('Childrens Cancer Treatment Fund'),
    title: "Children's Cancer Treatment Fund",
    location: 'United States',
    country: 'USA',
    amountRaised: 87000,
    goal: 150000,
    goalAmount: 150000,
    currentAmount: 87000,
    featuredImageUrl: 'https://images.pexels.com/photos/1250452/pexels-photo-1250452.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    currency: 'USD',
    description: 'We are raising funds to help families afford specialized cancer treatments for children aged 3-12 at St. Jude Medical Center. Your donation helps cover costs not covered by insurance.',
    status: CAMPAIGN_STATUS.EXAMPLE as CampaignStatus,
    category: categories[0], // Medical
    donorCount: 352,
    daysLeft: 90,
    isUrgent: false,
    isFeatured: true,
    verificationStatus: 'verified',
    viewCount: 2340,
    shareCount: 178,
    tags: ['medical', 'cancer', 'children', 'treatment'],
    metadata: {
      hospitalName: 'St. Jude Medical Center',
      ageGroup: '3-12'
    },
    beneficiaryInfo: {
      name: 'St. Jude Pediatric Oncology Department',
      type: 'Hospital department',
      beneficiaries: 'Children with cancer'
    },
    bankDetails: {
      accountName: 'St. Jude Children\'s Fund',
      accountType: 'Non-profit'
    },
    socialLinks: {
      facebook: 'https://facebook.com/stjudechildrensfund',
      instagram: 'https://instagram.com/stjudechildrensfund'
    },
    updates: [],
    faq: [
      { question: 'How are families selected?', answer: 'Families are selected based on financial need and medical urgency.' }
    ],
    teamMembers: [],
    expenses: [],
    milestones: [],
    riskFactors: 'Treatment costs may vary based on individual patient needs and duration of care.',
    impactStatement: 'Your donation helps children with cancer receive the specialized treatments they need regardless of their family\'s financial situation.',
    targetAudience: 'Compassionate donors who want to help children fight cancer and support their families during treatment.',
    marketingPlan: '',
    successMetrics: {
      healthcareGoals: 'Provide treatment to 100 children annually',
      financialGoals: 'Relieve financial burden for families of pediatric cancer patients'
    },
    externalLinks: [],
    pressCoverage: [],
    endorsements: [],
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: exampleUsers[1],
  },
  {
    id: uuidv4(),
    slug: generateSlug('Emergency Medical Supplies for Disaster Relief'),
    title: 'Emergency Medical Supplies for Disaster Relief',
    location: 'Philippines',
    country: 'Philippines',
    amountRaised: 28500,
    goal: 45000,
    goalAmount: 45000,
    currentAmount: 28500,
    featuredImageUrl: 'https://images.pexels.com/photos/6647037/pexels-photo-6647037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    videoUrl: 'https://www.youtube.com/watch?v=example3',
    currency: 'USD',
    description: 'Support disaster relief efforts in areas affected by Typhoon Mangkhut. Medical supplies are urgently needed for field hospitals treating injuries and preventing disease outbreaks in devastated communities.',
    status: CAMPAIGN_STATUS.EXAMPLE as CampaignStatus,
    category: categories[0], // Medical
    donorCount: 143,
    daysLeft: 15,
    isUrgent: true,
    isFeatured: true,
    verificationStatus: 'verified',
    viewCount: 3480,
    shareCount: 265,
    tags: ['medical', 'emergency', 'disaster', 'relief', 'typhoon'],
    metadata: {
      disasterName: 'Typhoon Mangkhut',
      disasterDate: '2023-08-15'
    },
    beneficiaryInfo: {
      name: 'Philippine Disaster Relief Foundation',
      type: 'Non-profit organization',
      region: 'Central Philippines'
    },
    bankDetails: {
      accountName: 'Philippine Disaster Relief',
      accountType: 'Emergency Relief Fund'
    },
    socialLinks: {
      facebook: 'https://facebook.com/phildisasterrelief',
      twitter: 'https://twitter.com/phildisasterrelief'
    },
    updates: [],
    faq: [
      { question: 'What supplies are most needed?', answer: 'Medical supplies, antibiotics, wound care, and basic medical equipment.' }
    ],
    teamMembers: [],
    expenses: [],
    milestones: [],
    riskFactors: 'Transportation challenges due to damaged infrastructure may delay supply delivery.',
    impactStatement: 'Your donation provides critical medical supplies to survivors in regions where healthcare facilities were destroyed.',
    targetAudience: 'International humanitarian donors and those concerned about disaster relief efforts.',
    marketingPlan: '',
    successMetrics: {
      medicalGoals: 'Provide medical supplies to 10 field hospitals',
      healthImpact: 'Treat 5,000+ patients in affected areas'
    },
    externalLinks: [],
    pressCoverage: [],
    endorsements: [],
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: exampleUsers[2],
  },

  // Memorial Campaigns (Category index 1)
  {
    id: uuidv4(),
    slug: generateSlug('Memorial Fund for Officer James Wilson'),
    title: 'Memorial Fund for Officer James Wilson',
    location: 'Chicago, IL',
    amountRaised: 36800,
    goal: 75000,
    currentAmount: 36800,
    goalAmount: 75000,
    currency: 'USD',
    featuredImageUrl: 'https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Officer James Wilson gave his life in the line of duty, leaving behind his wife and two young children. This fund will help support his family with living expenses and education costs for his children.',
    status: CAMPAIGN_STATUS.EXAMPLE as CampaignStatus,
    category: categories[1], // Memorial
    donorCount: 431,
    daysLeft: 60,
    isUrgent: false,
    isFeatured: true,
    viewCount: 8721,
    shareCount: 532,
    tags: ['memorial', 'police', 'family support'],
    metadata: {
      approvedBy: 'Chicago Police Department',
      tributeInfo: {
        yearsOfService: 12,
        precinct: 'District 7',
        awards: ['Medal of Honor', 'Lifesaving Award']
      }
    },
    verificationStatus: 'verified',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: exampleUsers[3],
  },
  {
    id: uuidv4(),
    slug: generateSlug('Sarah Johnson Memorial Scholarship'),
    title: 'Sarah Johnson Memorial Scholarship',
    location: 'Boston, MA',
    amountRaised: 22500,
    goal: 50000,
    currentAmount: 22500,
    goalAmount: 50000,
    currency: 'USD',
    featuredImageUrl: 'https://images.pexels.com/photos/733852/pexels-photo-733852.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Sarah was a brilliant physics student who dreamed of changing the world through science. This scholarship will help deserving students pursue STEM degrees at her alma mater.',
    status: CAMPAIGN_STATUS.EXAMPLE as CampaignStatus,
    category: categories[1], // Memorial
    donorCount: 187,
    daysLeft: 120,
    isUrgent: false,
    isFeatured: true,
    viewCount: 5120,
    shareCount: 342,
    tags: ['memorial', 'education', 'scholarship', 'STEM'],
    metadata: {
      approvedBy: 'University Board',
      scholarshipDetails: {
        university: 'MIT',
        department: 'Physics',
        studentsSupported: 5,
        yearlyAmount: 10000
      }
    },
    verificationStatus: 'verified',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: exampleUsers[4],
  },
  {
    id: uuidv4(),
    slug: generateSlug('Build a School in Rural Kenya'),
    title: 'Build a School in Rural Kenya',
    location: 'Nairobi, Kenya',
    amountRaised: 4500,
    goal: 7000,
    currentAmount: 4500,
    goalAmount: 7000,
    currency: 'USD',
    featuredImageUrl: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Help us build a primary school that will serve 400 children in rural Kenya. The community currently has no educational facilities within 20 miles, and this school will transform opportunities for generations to come.',
    isFeatured: false,
    viewCount: 2450,
    shareCount: 178,
    tags: ['education', 'global development', 'infrastructure', 'children'],
    metadata: {
      projectTimeline: '18 months',
      childrenServed: 400,
      localEmploymentCreated: 32,
      communityPartners: ['Local Education Authority', 'Community Leaders']
    },
    verificationStatus: 'verified',
    status: CAMPAIGN_STATUS.EXAMPLE as CampaignStatus,
    category: categories[8], // Community
    donorCount: 32,
    daysLeft: 45,
    isUrgent: false,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: exampleUsers[126],
  },

  // Competition Campaigns (Category index 9)
  {
    id: uuidv4(),
    slug: generateSlug('National High School Robotics Team'),
    title: 'National High School Robotics Team',
    location: 'Houston, TX',
    amountRaised: 21500,
    goal: 45000,
    featuredImageUrl: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Support our high school robotics team as we compete in the national championships. Funds will cover materials, travel expenses, and competition fees for our team of talented young engineers.',
    currency: 'USD',
    goalAmount: 45000,
    currentAmount: 21500,
    isFeatured: false,
    viewCount: 3860,
    shareCount: 217,
    tags: ['robotics', 'education', 'STEM', 'competition'],
    metadata: {
      teamMembers: 18,
      competitionLevel: 'National',
      previousAwards: ['Regional Champions', 'Innovation Award'],
      yearsActive: 5
    },
    verificationStatus: 'verified',
    status: CAMPAIGN_STATUS.EXAMPLE as CampaignStatus,
    category: categories[9], // Competition
    donorCount: 146,
    daysLeft: 30,
    isUrgent: false,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: exampleUsers[127],
  },
  {
    id: uuidv4(),
    slug: generateSlug('Youth Chess Championship Sponsorship'),
    title: 'Youth Chess Championship Sponsorship',
    location: 'New York, NY',
    amountRaised: 8200,
    goal: 15000,
    currentAmount: 8200,
    goalAmount: 15000,
    currency: 'USD',
    featuredImageUrl: 'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Help send talented young chess players from underserved communities to the International Youth Chess Championship. Your donation covers travel, lodging, and entry fees for five exceptional players.',
    isFeatured: false,
    viewCount: 3280,
    shareCount: 176,
    tags: ['chess', 'youth', 'competition', 'education'],
    metadata: {
      playerCount: 5,
      ageRange: '10-17',
      tournamentLocation: 'Vienna, Austria',
      competitionDate: '2024-07-20'
    },
    verificationStatus: 'verified',
    status: CAMPAIGN_STATUS.EXAMPLE as CampaignStatus,
    category: categories[9], // Competition
    donorCount: 75,
    daysLeft: 45,
    isUrgent: false,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: exampleUsers[128],
  },
  {
    id: uuidv4(),
    slug: generateSlug('Paralympic Athlete Training Fund'),
    title: 'Paralympic Athlete Training Fund',
    location: 'Colorado Springs, CO',
    amountRaised: 32500,
    goal: 60000,
    featuredImageUrl: 'https://images.pexels.com/photos/2259959/pexels-photo-2259959.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Support our Paralympic swimming team as they prepare for the upcoming Games. Funds will provide specialized training equipment, coaching staff, and training facility access for these dedicated athletes.',
    currency: 'USD',
    goalAmount: 60000,
    currentAmount: 32500,
    isFeatured: true,
    viewCount: 6840,
    shareCount: 582,
    tags: ['paralympics', 'sports', 'adaptive athletics', 'competition'],
    metadata: {
      athleteCount: 12,
      sportsDisciplines: ['swimming', 'athletics'],
      trainingFacility: 'Olympic Training Center',
      competitionDate: '2024-08-15'
    },
    verificationStatus: 'verified',
    status: CAMPAIGN_STATUS.EXAMPLE as CampaignStatus,
    category: categories[9], // Competition
    donorCount: 287,
    daysLeft: 120,
    isUrgent: false,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: exampleUsers[129],
  },
];