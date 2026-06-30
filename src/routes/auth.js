import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { authenticate } from '../middleware/auth.js';
import dataStore from '../utils/dataStore.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = dataStore.find('users', u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      role: role || 'Staff',
      createdAt: new Date().toISOString()
    };

    dataStore.add('users', user);

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = dataStore.find('users', u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = dataStore.find('users', u => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newToken = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({ token: newToken });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

router.get('/verify', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;
