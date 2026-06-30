import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

import { logger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import dataStore from './utils/dataStore.js';
import { seedData, completeSeedData } from './data/seedData.js';

import authRoutes from './routes/auth.js';
import bloggerRoutes from './routes/bloggers.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import financeRoutes from './routes/finance.js';
import applicationRoutes from './routes/applications.js';
import reportRoutes from './routes/reports.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Initialize data store and seed if empty
const initializeApp = async () => {
  await dataStore.load();

  // Seed data if empty
  if (dataStore.get('users').length === 0) {
    const completedSeed = completeSeedData(JSON.parse(JSON.stringify(seedData)));

    completedSeed.users.forEach(user => dataStore.add('users', user));
    completedSeed.bloggers.forEach(blogger => dataStore.add('bloggers', blogger));
    completedSeed.bookings.forEach(booking => dataStore.add('bookings', booking));
    completedSeed.expenses.forEach(expense => dataStore.add('expenses', expense));
    completedSeed.applications.forEach(app => dataStore.add('applications', app));
    completedSeed.budgets.forEach(budget => dataStore.add('budgets', budget));

    console.log('Database seeded with initial data');
  }
};

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/bloggers', bloggerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/reports', reportRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  await initializeApp();
  console.log(`Server running on port ${PORT}`);
  console.log(`Demo credentials: admin@example.com / password`);
});

export default app;
