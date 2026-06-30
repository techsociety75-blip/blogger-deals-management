import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, checkRole } from '../middleware/auth.js';
import { validateBookingData } from '../utils/validators.js';
import dataStore from '../utils/dataStore.js';

const router = Router();

// List all bookings with filters
router.get('/', authenticate, (req, res) => {
  try {
    const { status, bloggerId, userId } = req.query;
    let bookings = dataStore.get('bookings');

    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }

    if (bloggerId) {
      bookings = bookings.filter(b => b.bloggerId === bloggerId);
    }

    if (userId && (req.user.role === 'Team Leader' || req.user.role === 'Admin')) {
      bookings = bookings.filter(b => b.createdBy === userId);
    }

    // Auto-expire bookings older than 30 days
    bookings = bookings.map(booking => {
      if (booking.status === 'pending') {
        const createdDate = new Date(booking.createdAt);
        const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 30) {
          dataStore.update('bookings', booking.id, { status: 'expired' });
          return { ...booking, status: 'expired' };
        }
      }
      return booking;
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get single booking
router.get('/:id', authenticate, (req, res) => {
  try {
    const booking = dataStore.find('bookings', b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create booking
router.post('/', authenticate, checkRole(['Team Leader', 'Admin']), (req, res) => {
  try {
    const { bloggerId, campaignName, budget, dueDate, description } = req.body;

    const errors = validateBookingData({ bloggerId, campaignName, budget, dueDate });
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const blogger = dataStore.find('bloggers', b => b.id === bloggerId);
    if (!blogger) {
      return res.status(404).json({ error: 'Blogger not found' });
    }

    const booking = {
      id: uuidv4(),
      bloggerId,
      bloggerName: blogger.name,
      campaignName,
      budget,
      dueDate,
      description: description || '',
      status: 'pending',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dataStore.add('bookings', booking);
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking
router.put('/:id', authenticate, checkRole(['Team Leader', 'Admin']), (req, res) => {
  try {
    const booking = dataStore.find('bookings', b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updates = {
      campaignName: req.body.campaignName || booking.campaignName,
      budget: req.body.budget || booking.budget,
      dueDate: req.body.dueDate || booking.dueDate,
      description: req.body.description || booking.description,
      updatedAt: new Date().toISOString()
    };

    const updated = dataStore.update('bookings', req.params.id, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Approve booking
router.post('/:id/approve', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const booking = dataStore.find('bookings', b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updated = dataStore.update('bookings', req.params.id, {
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve booking' });
  }
});

// Reject booking
router.post('/:id/reject', authenticate, checkRole(['Finance', 'Admin']), (req, res) => {
  try {
    const booking = dataStore.find('bookings', b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const { reason } = req.body;
    const updated = dataStore.update('bookings', req.params.id, {
      status: 'rejected',
      rejectionReason: reason || '',
      rejectedBy: req.user.id,
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject booking' });
  }
});

// Check booking status
router.get('/:id/status', authenticate, (req, res) => {
  try {
    const booking = dataStore.find('bookings', b => b.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      id: booking.id,
      status: booking.status,
      bloggerName: booking.bloggerName,
      campaignName: booking.campaignName,
      budget: booking.budget,
      dueDate: booking.dueDate
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking status' });
  }
});

// Delete booking
router.delete('/:id', authenticate, checkRole(['Admin']), (req, res) => {
  try {
    const booking = dataStore.delete('bookings', req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

export default router;
