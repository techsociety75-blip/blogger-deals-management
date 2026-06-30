import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, checkRole } from '../middleware/auth.js';
import dataStore from '../utils/dataStore.js';

const router = Router();

// List applications
router.get('/', authenticate, (req, res) => {
  try {
    const { status, userId } = req.query;
    let applications = dataStore.get('applications');

    if (status) {
      applications = applications.filter(a => a.status === status);
    }

    if (userId) {
      applications = applications.filter(a => a.applicantId === userId);
    }

    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get single application
router.get('/:id', authenticate, (req, res) => {
  try {
    const application = dataStore.find('applications', a => a.id === req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Submit application
router.post('/', authenticate, (req, res) => {
  try {
    const { title, description, category, requiredBudget } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const application = {
      id: uuidv4(),
      title,
      description,
      category: category || 'General',
      requiredBudget: requiredBudget || 0,
      applicantId: req.user.id,
      applicantName: req.user.email,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dataStore.add('applications', application);
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Approve application
router.post('/:id/approve', authenticate, checkRole(['Admin', 'Finance']), (req, res) => {
  try {
    const application = dataStore.find('applications', a => a.id === req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updated = dataStore.update('applications', req.params.id, {
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve application' });
  }
});

// Reject application
router.post('/:id/reject', authenticate, checkRole(['Admin', 'Finance']), (req, res) => {
  try {
    const application = dataStore.find('applications', a => a.id === req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const { reason } = req.body;
    const updated = dataStore.update('applications', req.params.id, {
      status: 'rejected',
      rejectionReason: reason || '',
      rejectedBy: req.user.id,
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject application' });
  }
});

// Delete application
router.delete('/:id', authenticate, (req, res) => {
  try {
    const application = dataStore.find('applications', a => a.id === req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.applicantId !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized to delete this application' });
    }

    dataStore.delete('applications', req.params.id);
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

export default router;
