import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, checkRole } from '../middleware/auth.js';
import dataStore from '../utils/dataStore.js';

const router = Router();

// Get budget overview
router.get('/budget', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const bookings = dataStore.get('bookings');
    const expenses = dataStore.get('expenses');

    const totalBudget = bookings
      .filter(b => b.status === 'approved')
      .reduce((sum, b) => sum + b.budget, 0);

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = totalBudget - totalSpent;
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    res.json({
      totalBudget,
      totalSpent,
      remaining,
      utilization: utilization.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// Get budget by category
router.get('/budget/category', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const bookings = dataStore.get('bookings').filter(b => b.status === 'approved');
    const bloggers = dataStore.get('bloggers');

    const categoryBudget = {};
    bookings.forEach(booking => {
      const blogger = bloggers.find(b => b.id === booking.bloggerId);
      if (blogger) {
        if (!categoryBudget[blogger.category]) {
          categoryBudget[blogger.category] = { budget: 0, spent: 0 };
        }
        categoryBudget[blogger.category].budget += booking.budget;
      }
    });

    const expenses = dataStore.get('expenses');
    expenses.forEach(expense => {
      if (categoryBudget[expense.category]) {
        categoryBudget[expense.category].spent += expense.amount;
      }
    });

    res.json(categoryBudget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget by category' });
  }
});

// List expenses
router.get('/expenses', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const { category, status } = req.query;
    let expenses = dataStore.get('expenses');

    if (category) {
      expenses = expenses.filter(e => e.category === category);
    }

    if (status) {
      expenses = expenses.filter(e => e.status === status);
    }

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create expense
router.post('/expenses', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const { description, amount, category, date, bookingId } = req.body;

    if (!description || !amount || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expense = {
      id: uuidv4(),
      description,
      amount: parseFloat(amount),
      category,
      date: date || new Date().toISOString().split('T')[0],
      bookingId: bookingId || null,
      status: 'verified',
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    dataStore.add('expenses', expense);
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Approve expense
router.post('/expenses/:id/approve', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const expense = dataStore.find('expenses', e => e.id === req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updated = dataStore.update('expenses', req.params.id, {
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve expense' });
  }
});

// Reject expense
router.post('/expenses/:id/reject', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const expense = dataStore.find('expenses', e => e.id === req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updated = dataStore.update('expenses', req.params.id, {
      status: 'rejected',
      rejectedBy: req.user.id,
      rejectedAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject expense' });
  }
});

// Delete expense
router.delete('/expenses/:id', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const expense = dataStore.delete('expenses', req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Get cash flow report
router.get('/cash-flow', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const bookings = dataStore.get('bookings').filter(b => b.status === 'approved');
    const expenses = dataStore.get('expenses').filter(e => e.status === 'approved');

    const monthlyFlow = {};

    bookings.forEach(b => {
      const month = new Date(b.createdAt).toISOString().substring(0, 7);
      if (!monthlyFlow[month]) monthlyFlow[month] = { income: 0, expense: 0 };
      monthlyFlow[month].income += b.budget;
    });

    expenses.forEach(e => {
      const month = e.date.substring(0, 7);
      if (!monthlyFlow[month]) monthlyFlow[month] = { income: 0, expense: 0 };
      monthlyFlow[month].expense += e.amount;
    });

    const result = Object.entries(monthlyFlow)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cash flow' });
  }
});

// Get pending approvals
router.get('/pending-approvals', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const bookings = dataStore.get('bookings').filter(b => b.status === 'pending');
    const expenses = dataStore.get('expenses').filter(e => e.status === 'verified');

    res.json({
      pendingBookings: bookings,
      pendingExpenses: expenses,
      totalPending: bookings.length + expenses.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
});

export default router;
