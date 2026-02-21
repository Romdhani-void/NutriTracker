const express = require('express');
const crypto = require('crypto');
const User = require('./user.model');
const { sendTokenEmail } = require('./email.service');

const router = express.Router();

// ─── POST /users/register ────────────────────────────────────────────────────
// Creates or retrieves a user, sends a login token to their email.
router.post('/register', async (req, res) => {
  try {
    const { email, displayName } = req.body;

    if (!email || !displayName) {
      return res.status(400).json({ error: 'email and displayName are required.' });
    }

    // Generate a 6-digit numeric token
    const token = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(
      Date.now() + parseInt(process.env.TOKEN_EXPIRY_MINUTES, 10) * 60 * 1000
    );

    // Upsert user — create if new, update token if existing
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        email: email.toLowerCase().trim(),
        displayName: displayName.trim(),
        token,
        tokenExpiresAt: expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendTokenEmail(user.email, token, user.displayName);

    return res.status(200).json({
      message: `Token sent to ${user.email}. It expires in ${process.env.TOKEN_EXPIRY_MINUTES} minutes.`,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ error: 'Failed to register user.' });
  }
});

// ─── POST /users/verify-token ─────────────────────────────────────────────────
// Verifies the 6-digit token and marks the user as authenticated.
router.post('/verify-token', async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'email and token are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.token !== token) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    if (new Date() > user.tokenExpiresAt) {
      return res.status(401).json({ error: 'Token has expired. Please request a new one.' });
    }

    // Clear the token after successful verification
    user.token = null;
    user.tokenExpiresAt = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      message: 'Token verified. Welcome!',
      user: {
        email: user.email,
        displayName: user.displayName,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('[verify-token]', err);
    return res.status(500).json({ error: 'Token verification failed.' });
  }
});

// ─── GET /users/:email ────────────────────────────────────────────────────────
// Retrieves public user info by email (used by other services).
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.params.email.toLowerCase().trim(),
    }).select('-token -tokenExpiresAt');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error('[get-user]', err);
    return res.status(500).json({ error: 'Failed to retrieve user.' });
  }
});

module.exports = router;
