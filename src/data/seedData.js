import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const adminId = uuidv4();
const financeId = uuidv4();
const teamLeaderId = uuidv4();
const checkingId = uuidv4();
const staffId = uuidv4();

export const seedData = {
  users: [
    {
      id: adminId,
      name: 'Admin User',
      email: 'admin@example.com',
      password: bcrypt.hashSync('password', 10),
      role: 'Admin',
      createdAt: new Date().toISOString()
    },
    {
      id: financeId,
      name: 'Finance Manager',
      email: 'finance@example.com',
      password: bcrypt.hashSync('password', 10),
      role: 'Finance',
      createdAt: new Date().toISOString()
    },
    {
      id: teamLeaderId,
      name: 'Team Leader',
      email: 'teamlead@example.com',
      password: bcrypt.hashSync('password', 10),
      role: 'Team Leader',
      createdAt: new Date().toISOString()
    },
    {
      id: checkingId,
      name: 'QA Checker',
      email: 'checker@example.com',
      password: bcrypt.hashSync('password', 10),
      role: 'Checking',
      createdAt: new Date().toISOString()
    },
    {
      id: staffId,
      name: 'Staff Member',
      email: 'staff@example.com',
      password: bcrypt.hashSync('password', 10),
      role: 'Staff',
      createdAt: new Date().toISOString()
    }
  ],
  bloggers: [
    {
      id: uuidv4(),
      name: 'Emma Johnson',
      email: 'emma@blogger.com',
      category: 'Fashion',
      instagram: '@emmajohnson',
      tiktok: '@emmajohnson',
      youtube: 'Emma Johnson',
      engagement: 8.5,
      followers: 250000,
      status: 'active',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Alex Chen',
      email: 'alex@blogger.com',
      category: 'Technology',
      instagram: '@alexchen',
      tiktok: '@alexchen',
      youtube: 'Alex Chen Tech',
      engagement: 9.2,
      followers: 380000,
      status: 'active',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Sophie Martin',
      email: 'sophie@blogger.com',
      category: 'Beauty',
      instagram: '@sophiemartin',
      tiktok: '@sophiemartin',
      youtube: 'Sophie Beauty',
      engagement: 7.8,
      followers: 420000,
      status: 'active',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Marcus Williams',
      email: 'marcus@blogger.com',
      category: 'Fitness',
      instagram: '@marcuswill',
      tiktok: '@marcuswill',
      youtube: 'Marcus Fitness',
      engagement: 8.9,
      followers: 310000,
      status: 'active',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'Lisa Park',
      email: 'lisa@blogger.com',
      category: 'Food',
      instagram: '@lisakitchen',
      tiktok: '@lisakitchen',
      youtube: 'Lisa Cooking',
      engagement: 8.1,
      followers: 275000,
      status: 'active',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      name: 'David Kumar',
      email: 'david@blogger.com',
      category: 'Travel',
      instagram: '@davidtravel',
      tiktok: '@davidtravel',
      youtube: 'David Adventures',
      engagement: 8.4,
      followers: 290000,
      status: 'active',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  bookings: [
    {
      id: uuidv4(),
      bloggerId: null, // Will be filled
      bloggerName: 'Emma Johnson',
      campaignName: 'Summer Fashion Collection',
      budget: 5000,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Showcase new summer collection on Instagram and TikTok',
      status: 'approved',
      createdBy: teamLeaderId,
      approvedBy: financeId,
      approvedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      bloggerId: null, // Will be filled
      bloggerName: 'Alex Chen',
      campaignName: 'Tech Product Launch',
      budget: 8000,
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Full tech review and unboxing video',
      status: 'approved',
      createdBy: teamLeaderId,
      approvedBy: financeId,
      approvedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      bloggerId: null, // Will be filled
      bloggerName: 'Sophie Martin',
      campaignName: 'Beauty Brand Partnership',
      budget: 6500,
      dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Makeup tutorial and product reviews',
      status: 'pending',
      createdBy: teamLeaderId,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      bloggerId: null, // Will be filled
      bloggerName: 'Marcus Williams',
      campaignName: 'Fitness Equipment Promo',
      budget: 4500,
      dueDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Workout routines using equipment',
      status: 'approved',
      createdBy: teamLeaderId,
      approvedBy: financeId,
      approvedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      bloggerId: null, // Will be filled
      bloggerName: 'Lisa Park',
      campaignName: 'Kitchen Appliance Review',
      budget: 3500,
      dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Recipe development and appliance testing',
      status: 'pending',
      createdBy: teamLeaderId,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      bloggerId: null, // Will be filled
      bloggerName: 'David Kumar',
      campaignName: 'Tourism Board Campaign',
      budget: 7200,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Travel series featuring local destinations',
      status: 'approved',
      createdBy: teamLeaderId,
      approvedBy: financeId,
      approvedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  expenses: [
    {
      id: uuidv4(),
      description: 'Influencer payment - Emma Johnson',
      amount: 5000,
      category: 'Fashion',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingId: null,
      status: 'approved',
      createdBy: financeId,
      approvedBy: financeId,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      description: 'Influencer payment - Alex Chen',
      amount: 8000,
      category: 'Technology',
      date: new Date().toISOString().split('T')[0],
      bookingId: null,
      status: 'approved',
      createdBy: financeId,
      approvedBy: financeId,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      description: 'Influencer payment - Marcus Williams',
      amount: 4500,
      category: 'Fitness',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingId: null,
      status: 'approved',
      createdBy: financeId,
      approvedBy: financeId,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      description: 'Influencer payment - David Kumar',
      amount: 7200,
      category: 'Travel',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingId: null,
      status: 'approved',
      createdBy: financeId,
      approvedBy: financeId,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uuidv4(),
      description: 'Photo editing software subscription',
      amount: 500,
      category: 'Operations',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingId: null,
      status: 'verified',
      createdBy: staffId,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  applications: [
    {
      id: uuidv4(),
      title: 'Q3 Marketing Campaign Budget',
      description: 'Request for increased budget allocation for Q3 influencer campaigns',
      category: 'Budget Request',
      requiredBudget: 50000,
      applicantId: teamLeaderId,
      applicantName: 'Team Leader',
      status: 'approved',
      approvedBy: adminId,
      approvedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: 'New Influencer Category',
      description: 'Proposal to add gaming influencers to our platform',
      category: 'Category Addition',
      requiredBudget: 0,
      applicantId: staffId,
      applicantName: 'Staff Member',
      status: 'pending',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: 'Performance Bonus Request',
      description: 'Team requesting performance bonus based on Q2 results',
      category: 'Bonus',
      requiredBudget: 15000,
      applicantId: teamLeaderId,
      applicantName: 'Team Leader',
      status: 'approved',
      approvedBy: adminId,
      approvedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  budgets: [
    {
      id: uuidv4(),
      category: 'Fashion',
      totalBudget: 50000,
      spent: 5000,
      allocated: true,
      year: 2024,
      quarter: 'Q3'
    },
    {
      id: uuidv4(),
      category: 'Technology',
      totalBudget: 80000,
      spent: 8000,
      allocated: true,
      year: 2024,
      quarter: 'Q3'
    },
    {
      id: uuidv4(),
      category: 'Beauty',
      totalBudget: 45000,
      spent: 0,
      allocated: true,
      year: 2024,
      quarter: 'Q3'
    }
  ]
};

// Update blogger IDs in bookings
export const completeSeedData = (seedDataObj) => {
  const bloggers = seedDataObj.bloggers;
  seedDataObj.bookings.forEach((booking, index) => {
    if (index < bloggers.length) {
      booking.bloggerId = bloggers[index].id;
    }
  });
  return seedDataObj;
};
