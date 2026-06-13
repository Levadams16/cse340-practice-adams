import express from 'express';
import loginRoutes from './forms/login.js';
import { processLogout, showDashboard } from './forms/login.js';
import { requireLogin } from '../middleware/auth.js';
import contactRoutes from './forms/contact.js';
import registrationRoutes from './forms/registration.js';

const router = express.Router();

import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';

router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

// Add login-specific styles to all login routes
router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/login.css">');
    next();
});

router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});

// Login routes (form and submission)
router.use('/login', loginRoutes);

router.use('/contact', contactRoutes);

// Registration routes
router.use('/register', registrationRoutes);

// Authentication-related routes at root level
router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);

export default router;

router.get('/', (req, res) => {
    res.render('home', { title: 'Welcome Home' });
});

router.get('/about', (req, res) => {
    res.render('about', { title: 'About Me' });
});

router.get('/products', (req, res) => {
    res.render('products', { title: 'Our Products' });
});

router.get('/student', (req, res) => {
    const student = {
        name: 'Levi Adams',
        id: '12345',
        email: 'levi@example.com',
        address: 'Boise, Idaho'
    };
    res.render('student', student);
});