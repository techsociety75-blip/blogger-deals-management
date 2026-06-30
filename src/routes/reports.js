import { Router } from 'express';
import { authenticate, checkRole } from '../middleware/auth.js';
import dataStore from '../utils/dataStore.js';

const router = Router();

// Spending report
router.get('/spending', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let expenses = dataStore.get('expenses').filter(e => e.status === 'approved');

    if (startDate) {
      expenses = expenses.filter(e => new Date(e.date) >= new Date(startDate));
    }

    if (endDate) {
      expenses = expenses.filter(e => new Date(e.date) <= new Date(endDate));
    }

    const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};

    expenses.forEach(e => {
      if (!byCategory[e.category]) {
        byCategory[e.category] = { amount: 0, count: 0 };
      }
      byCategory[e.category].amount += e.amount;
      byCategory[e.category].count += 1;
    });

    res.json({
      totalSpending,
      expenseCount: expenses.length,
      byCategory,
      expenses: expenses.slice(0, 100)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch spending report' });
  }
});

// Analytics report
router.get('/analytics', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const bookings = dataStore.get('bookings');
    const bloggers = dataStore.get('bloggers');
    const expenses = dataStore.get('expenses');

    const totalBookings = bookings.length;
    const approvedBookings = bookings.filter(b => b.status === 'approved').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const rejectedBookings = bookings.filter(b => b.status === 'rejected').length;

    const averageBudget = approvedBookings > 0
      ? bookings
          .filter(b => b.status === 'approved')
          .reduce((sum, b) => sum + b.budget, 0) / approvedBookings
      : 0;

    const topBloggers = bloggers
      .map(b => {
        const bloggerBookings = bookings.filter(k => k.bloggerId === b.id);
        return {
          id: b.id,
          name: b.name,
          bookingCount: bloggerBookings.length,
          totalBudget: bloggerBookings.reduce((sum, k) => sum + k.budget, 0)
        };
      })
      .sort((a, b) => b.totalBudget - a.totalBudget)
      .slice(0, 10);

    const categoryStats = {};
    bloggers.forEach(b => {
      if (!categoryStats[b.category]) {
        categoryStats[b.category] = { bloggers: 0, bookings: 0, budget: 0 };
      }
      categoryStats[b.category].bloggers += 1;

      const categoryBookings = bookings.filter(k => k.bloggerId === b.id);
      categoryStats[b.category].bookings += categoryBookings.length;
      categoryStats[b.category].budget += categoryBookings.reduce((sum, k) => sum + k.budget, 0);
    });

    res.json({
      bookingStats: {
        total: totalBookings,
        approved: approvedBookings,
        pending: pendingBookings,
        rejected: rejectedBookings
      },
      averageBudget: parseFloat(averageBudget.toFixed(2)),
      topBloggers,
      categoryStats,
      totalExpenses: expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Performance report
router.get('/performance', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const bookings = dataStore.get('bookings');
    const bloggers = dataStore.get('bloggers');

    const performance = bloggers.map(b => {
      const bloggerBookings = bookings.filter(k => k.bloggerId === b.id);
      const approvedCount = bloggerBookings.filter(k => k.status === 'approved').length;
      const completionRate = bloggerBookings.length > 0
        ? (approvedCount / bloggerBookings.length) * 100
        : 0;

      return {
        id: b.id,
        name: b.name,
        followers: b.followers,
        engagement: b.engagement,
        totalBookings: bloggerBookings.length,
        approvedBookings: approvedCount,
        completionRate: parseFloat(completionRate.toFixed(2)),
        totalBudgetHandled: bloggerBookings.reduce((sum, k) => sum + k.budget, 0)
      };
    });

    res.json(performance.sort((a, b) => b.totalBudgetHandled - a.totalBudgetHandled));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance report' });
  }
});

// Monthly summary
router.get('/monthly-summary', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const bookings = dataStore.get('bookings').filter(b => b.status === 'approved');
    const expenses = dataStore.get('expenses').filter(e => e.status === 'approved');

    const monthlyData = {};

    bookings.forEach(b => {
      const month = new Date(b.createdAt).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { bookings: 0, budget: 0, expenses: 0, count: 0 };
      }
      monthlyData[month].bookings += 1;
      monthlyData[month].budget += b.budget;
    });

    expenses.forEach(e => {
      const month = e.date.substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { bookings: 0, budget: 0, expenses: 0, count: 0 };
      }
      monthlyData[month].expenses += e.amount;
      monthlyData[month].count += 1;
    });

    const summary = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        bookings: data.bookings,
        budget: data.budget,
        expenses: data.expenses,
        net: data.budget - data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly summary' });
  }
});

export default router;
