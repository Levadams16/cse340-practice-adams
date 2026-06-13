import express from 'express';
import loginRoutes from './forms/login.js';
import { processLogout, showDashboard } from './forms/login.js';
import { requireLogin } from '../middleware/auth.js';
import contactRoutes from './forms/contact.js';
import registrationRoutes from './forms/registration.js';
import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';

const router = express.Router();

router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/login.css">');
    next();
});

router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});

router.use('/login', loginRoutes);
router.use('/contact', contactRoutes);
router.use('/register', registrationRoutes);

router.get('/logout', processLogout);
router.get('/dashboard', requireLogin, showDashboard);

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

export default router;