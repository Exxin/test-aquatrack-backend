// src/routers/index.js

import { Router } from 'express';

import waterRouter from './water.js';
import usersRouter from './users.js';
import authRouter from './auth.js';
// import getGoogleAuthUrl from '../controllers/auth.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/water', waterRouter);
// router.use('/get-oauth-url', getGoogleAuthUrl);


export default router;
