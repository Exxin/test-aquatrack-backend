import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  loginUserSchema,
  // loginWithGoogleOAuthSchema,
  registerUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validation/auth.js';

import {
  loginUserController,
  registerUserController,
  requestResetEmailController,
  resetPasswordController,
  logoutUserController,
  refreshUserSessionController,
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { env } from "../utils/env.js";

const router = Router();

const client_id = env("GOOGLE_AUTH_CLIENT_ID");
const redirect_uri = env("GOOGLE_AUTH_REDIRECT_URI");
const scope = 'email profile';
const response_type = 'code';
const access_type = 'offline';
const include_granted_scopes = 'true';

router.get('/auth/google', (req, res) => {
  const authURL = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${client_id}&` +
    `redirect_uri=${redirect_uri}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=${response_type}&` +
    `access_type=${access_type}&` +
    `include_granted_scopes=${include_granted_scopes}`;

  res.redirect(authURL);
});

router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);
router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);

router.post(
  '/send-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);
router.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);

router.post('/refresh-access-token', ctrlWrapper(refreshUserSessionController));

router.post('/logout', ctrlWrapper(logoutUserController));

export default router;
