import { Router } from 'express';
import { authenticate, checkRole } from '../middleware/auth.js';
import dataStore from '../utils/dataStore.js';

const router = Router();

// Dashboard statistics
router.get('/dashboard/stats', authenticate, checkRole(['Admin']), (req, res) => {
  try {
    const users = dataStore.get('users');
    const bloggers = dataStore.get('bloggers');
    const bookings = dataStore.get('bookings');
    const expenses = dataStore.get('expenses');

    const totalUsers = users.length;
    const totalBloggers = bloggers.length;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const approvedBookings = bookings.filter(b => b.status === 'approved').length;
    const totalBudget = bookings.reduce((sum, b) => sum + b.budget, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const usersByRole = {};
    users.forEach(u => {
      usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;
    });

    res.json({
      totalUsers,
      totalBloggers,
      totalBookings,
      pendingBookings,
      approvedBookings,
      totalBudget,
      totalSpent,
      usersByRole
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// List all users
router.get('/users', authenticate, checkRole(['Admin']), (req, res) => {
  try {
    const { role } = req.query;
    let users = dataStore.get('users');

    if (role) {
      users = users.filter(u => u.role === role);
    }

    // Remove passwords from response
    users = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/users/:id', authenticate, checkRole(['Admin']), (req, res) => {
  try {
    const user = dataStore.find('users', u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user role
router.put('/users/:id', authenticate, checkRole(['Admin']), (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['Admin', 'Finance', 'Team Leader', 'Checking', 'Staff'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = dataStore.find('users', u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = dataStore.update('users', req.params.id, { role });
    const { password, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', authenticate, checkRole(['Admin']), (req, res) => {
  try {
    const user = dataStore.delete('users', req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Activity log
router.get('/activity-log', authenticate, checkRole(['Admin']), (req, res) => {
  try {
    const bookings = dataStore.get('bookings');
    const activities = bookings
      .map(b => ({
        id: b.id,
        type: `Booking ${b.status}`,
        description: `${b.bloggerName} - ${b.campaignName}`,
        timestamp: b.updatedAt || b.createdAt
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

export default router;
