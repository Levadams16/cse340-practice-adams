import express from 'express';
const router = express.Router();

import { facultyListPage, facultyDetailPage } from './faculty/faculty.js';

router.get('/faculty', facultyListPage);
router.get('/faculty/:facultyId', facultyDetailPage);

export default router;