import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, checkRole } from '../middleware/auth.js';
import { validateBloggerData } from '../utils/validators.js';
import dataStore from '../utils/dataStore.js';

const router = Router();

// List all bloggers with filters
router.get('/', authenticate, (req, res) => {
  try {
    const { category, status, search } = req.query;
    let bloggers = dataStore.get('bloggers');

    if (category) {
      bloggers = bloggers.filter(b => b.category === category);
    }

    if (status) {
      bloggers = bloggers.filter(b => b.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      bloggers = bloggers.filter(
        b => b.name.toLowerCase().includes(searchLower) || b.email.toLowerCase().includes(searchLower)
      );
    }

    res.json(bloggers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bloggers' });
  }
});

// Get single blogger
router.get('/:id', authenticate, (req, res) => {
  try {
    const blogger = dataStore.find('bloggers', b => b.id === req.params.id);
    if (!blogger) {
      return res.status(404).json({ error: 'Blogger not found' });
    }
    res.json(blogger);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogger' });
  }
});

// Create blogger
router.post('/', authenticate, checkRole(['Admin', 'Team Leader']), (req, res) => {
  try {
    const { name, email, category, instagram, tiktok, youtube, engagement, followers } = req.body;

    const errors = validateBloggerData({ name, email, category });
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const existingBlogger = dataStore.find('bloggers', b => b.email === email);
    if (existingBlogger) {
      return res.status(400).json({ error: 'Blogger email already exists' });
    }

    const blogger = {
      id: uuidv4(),
      name,
      email,
      category,
      instagram: instagram || '',
      tiktok: tiktok || '',
      youtube: youtube || '',
      engagement: engagement || 0,
      followers: followers || 0,
      status: 'active',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    dataStore.add('bloggers', blogger);
    res.status(201).json(blogger);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blogger' });
  }
});

// Update blogger
router.put('/:id', authenticate, checkRole(['Admin', 'Team Leader']), (req, res) => {
  try {
    const blogger = dataStore.find('bloggers', b => b.id === req.params.id);
    if (!blogger) {
      return res.status(404).json({ error: 'Blogger not found' });
    }

    const updates = {
      name: req.body.name || blogger.name,
      email: req.body.email || blogger.email,
      category: req.body.category || blogger.category,
      instagram: req.body.instagram || blogger.instagram,
      tiktok: req.body.tiktok || blogger.tiktok,
      youtube: req.body.youtube || blogger.youtube,
      engagement: req.body.engagement || blogger.engagement,
      followers: req.body.followers || blogger.followers,
      status: req.body.status || blogger.status
    };

    const updated = dataStore.update('bloggers', req.params.id, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blogger' });
  }
});

// Delete blogger
router.delete('/:id', authenticate, checkRole(['Admin']), (req, res) => {
  try {
    const blogger = dataStore.delete('bloggers', req.params.id);
    if (!blogger) {
      return res.status(404).json({ error: 'Blogger not found' });
    }
    res.json({ message: 'Blogger deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blogger' });
  }
});

// Get blogger statistics
router.get('/:id/stats', authenticate, (req, res) => {
  try {
    const blogger = dataStore.find('bloggers', b => b.id === req.params.id);
    if (!blogger) {
      return res.status(404).json({ error: 'Blogger not found' });
    }

    const bookings = dataStore.findAll('bookings', b => b.bloggerId === req.params.id);
    const totalBookings = bookings.length;
    const approvedBookings = bookings.filter(b => b.status === 'approved').length;
    const totalBudget = bookings.reduce((sum, b) => sum + b.budget, 0);

    res.json({
      id: blogger.id,
      name: blogger.name,
      totalBookings,
      approvedBookings,
      totalBudget,
      followers: blogger.followers,
      engagement: blogger.engagement
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogger stats' });
  }
});

export default router;
