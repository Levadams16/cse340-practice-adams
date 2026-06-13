import { Router } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { 
    emailExists, 
    saveUser, 
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../../models/forms/registration.js';
import { requireLogin } from '../../middleware/auth.js';
import { registrationValidation, editValidation } from '../../middleware/validation/forms.js';

const router = Router();

const showRegistrationForm = (req, res) => {
    res.render('forms/registration/form', { title: 'User Registration' });
};

const processRegistration = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('/register');
    }

    const { name, email, password } = req.body;

    try {
        const alreadyExists = await emailExists(email);

        if (alreadyExists) {
            req.flash('warning', 'An account with that email already exists.');
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await saveUser(name, email, hashedPassword);

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');

    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
};

const showAllUsers = async (req, res) => {
    let users = [];

    try {
        users = await getAllUsers();
    } catch (error) {
        console.error('Error retrieving users:', error);
    }

    res.locals.currentUser = req.session && req.session.user ? req.session.user : null;

    res.render('forms/registration/list', {
        title: 'Registered Users',
        users
    });
};

/**
 * Display the edit account form
 * Users can edit their own account, admins can edit any account
 */
const showEditAccountForm = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;

    const targetUser = await getUserById(targetUserId);

    if (!targetUser) {
        req.flash('error', 'User not found.');
        return res.redirect('/register/list');
    }

    // Check permissions: users can edit themselves, admins can edit anyone
    const canEdit = currentUser.id === targetUserId || currentUser.roleName === 'admin';

    if (!canEdit) {
        req.flash('error', 'You do not have permission to edit this account.');
        return res.redirect('/register/list');
    }

    res.render('forms/registration/edit', {
        title: 'Edit Account',
        user: targetUser
    });
};

/**
 * Process account edit form submission
 */
const processEditAccount = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect(`/register/${req.params.id}/edit`);
    }

    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;
    const { name, email } = req.body;

    try {
        const targetUser = await getUserById(targetUserId);

        if (!targetUser) {
            req.flash('error', 'User not found.');
            return res.redirect('/register/list');
        }

        // Check permissions
        const canEdit = currentUser.id === targetUserId || currentUser.roleName === 'admin';

        if (!canEdit) {
            req.flash('error', 'You do not have permission to edit this account.');
            return res.redirect('/register/list');
        }

        // Check if new email already exists (and belongs to different user)
        const emailTaken = await emailExists(email);
        if (emailTaken && targetUser.email !== email) {
            req.flash('error', 'An account with this email already exists.');
            return res.redirect(`/register/${targetUserId}/edit`);
        }

        // Update the user
        await updateUser(targetUserId, name, email);

        // If user edited their own account, update session
        if (currentUser.id === targetUserId) {
            req.session.user.name = name;
            req.session.user.email = email;
        }

        req.flash('success', 'Account updated successfully.');
        res.redirect('/register/list');
    } catch (error) {
        console.error('Error updating account:', error);
        req.flash('error', 'An error occurred while updating the account.');
        res.redirect(`/register/${targetUserId}/edit`);
    }
};

const processDeleteAccount = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;

    if (currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to delete accounts.');
        return res.redirect('/register/list');
    }

    if (currentUser.id === targetUserId) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/register/list');
    }

    try {
        const deleted = await deleteUser(targetUserId);
        if (deleted) {
            req.flash('success', 'User account deleted successfully.');
        } else {
            req.flash('error', 'User not found or already deleted.');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'An error occurred while deleting the account.');
    }

    res.redirect('/register/list');
};

router.get('/', showRegistrationForm);
router.post('/', registrationValidation, processRegistration);
router.get('/list', showAllUsers);

/**
 * GET /register/:id/edit - Display edit account form
 */
router.get('/:id/edit', requireLogin, showEditAccountForm);

/**
 * POST /register/:id/edit - Process account edit
 */
router.post('/:id/edit', requireLogin, editValidation, processEditAccount);

router.post('/:id/delete', requireLogin, processDeleteAccount);

export default router;