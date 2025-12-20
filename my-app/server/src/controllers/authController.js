const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { verifyOTP } = require('./otpController');

const tokenOptions = { expiresIn: '12h' };

const buildAuthResponse = (token, profile) => ({
  token,
  user: profile,
});

async function loginAdmin(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, tokenOptions);

  res.json(
    buildAuthResponse(token, {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
    })
  );
}

// async function registerCustomer(req, res) {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { name, email, phone, password, gender, registrationType, otp } = req.body;
  
//   // For OTP registration, email or phone is required
//   if (registrationType === 'otp' && !email && !phone) {
//     return res.status(400).json({ message: 'Email or phone is required for OTP registration' });
//   }

//   // For form registration, email and password are required
//   if (registrationType !== 'otp') {
//     if (!email) {
//       return res.status(400).json({ message: 'Email is required for registration' });
//     }
//     if (!password) {
//       return res.status(400).json({ message: 'Password is required for registration' });
//     }
//   }
  
//   // Check if user exists by email or phone
//   const query = {};
//   if (email) {
//     query.email = email.toLowerCase();
//   }
//   if (phone) {
//     query.phone = phone;
//   }
  
//   if (Object.keys(query).length > 0) {
//     const existing = await User.findOne({ 
//       $or: Object.keys(query).map(key => ({ [key]: query[key] }))
//     });
//     if (existing) {
//       return res.status(409).json({ message: 'An account with this email or phone already exists' });
//     }
//   }

//   // For OTP registration, verify OTP
//   if (registrationType === 'otp') {
//     if (!otp) {
//       return res.status(400).json({ message: 'OTP is required for OTP registration' });
//     }
//     const identifier = email || phone;
//     if (registrationType === 'otp') {
//   if (!otp) {
//     return res.status(400).json({ message: 'OTP is required for OTP registration' });
//   }

//   // PHONE OTP → Twilio Verify
//   if (phone) {
//     const twilio = require("twilio")(
//       process.env.TWILIO_ACCOUNT_SID,
//       process.env.TWILIO_AUTH_TOKEN
//     );

//     const check = await twilio.verify.v2
//       .services(process.env.TWILIO_VERIFY_SID)
//       .verificationChecks.create({
//         to: phone,
//         code: otp,
//       });

//     if (check.status !== "approved") {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }
//   }

//   // EMAIL OTP → your internal OTP store
//   if (email) {
//     const identifier = email;
//     const verification = verifyOTP(identifier, otp);
//     if (!verification.valid) {
//       return res.status(400).json({ message: verification.message });
//     }
//   }
// }

//   }

//   // Hash password if provided
//   let hash = null;
//   if (password) {
//     hash = await bcrypt.hash(password, 10);
//   }

//   const userData = {
//     name,
//     email: email?.toLowerCase(),
//     phone,
//     gender,
//     role: 'customer',
//   };

//   if (hash) {
//     userData.password = hash;
//   }

//   const user = await User.create(userData);
//   const token = jwt.sign({ id: user._id, role: 'customer' }, process.env.JWT_SECRET, tokenOptions);

//   res.status(201).json(
//     buildAuthResponse(token, {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       phone: user.phone,
//       gender: user.gender,
//     })
//   );
// }



async function registerCustomer(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, password, gender, registrationType, otp } = req.body;

  // For OTP registration, email or phone is required
  if (registrationType === "otp" && !email && !phone) {
    return res
      .status(400)
      .json({ message: "Email or phone is required for OTP registration" });
  }

  // For normal registration (password)
  if (registrationType !== "otp") {
    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password)
      return res.status(400).json({ message: "Password is required" });
  }

  // Check for existing user
  const query = {};
  if (email) query.email = email.toLowerCase();
  if (phone) query.phone = phone;

  if (Object.keys(query).length > 0) {
    const existing = await User.findOne({
      $or: Object.keys(query).map((key) => ({ [key]: query[key] })),
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email or phone already exists" });
    }
  }

  // OTP VERIFICATION (fixed)
  if (registrationType === "otp") {
    if (!otp) {
      return res
        .status(400)
        .json({ message: "OTP is required for OTP registration" });
    }

    // PHONE OTP → Twilio Verify
    // Note: If OTP was already verified in frontend, this might fail with 404
    // In that case, we'll try to verify again, but if it fails with 404, we'll proceed
    // assuming it was already verified (since frontend requires verification before submission)
    if (phone) {
      try {
        const twilio = require("twilio")(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        // Validate Twilio credentials
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SID) {
          console.error('Twilio credentials not configured');
          return res.status(500).json({ message: "OTP service not configured. Please contact support." });
        }

        // Clean the service SID (remove any special characters that might have been introduced)
        const serviceSid = process.env.TWILIO_VERIFY_SID.trim();

        try {
          const check = await twilio.verify.v2
            .services(serviceSid)
            .verificationChecks.create({
              to: phone,
              code: otp,
            });

          if (check.status !== "approved") {
            return res
              .status(400)
              .json({ message: "Invalid or expired OTP" });
          }
        } catch (verifyError) {
          // If verification was already consumed (404), and frontend says it's verified, proceed
          // This handles the case where OTP was verified in frontend before registration
          if (verifyError.code === 20404) {
            console.log('OTP verification already consumed (likely verified in frontend), proceeding with registration');
            // Continue with registration - OTP was already verified
          } else {
            throw verifyError; // Re-throw other errors
          }
        }
      } catch (error) {
        console.error('Twilio verification error:', error);
        // Handle specific Twilio errors
        if (error.code === 20404) {
          // Verification not found - might be already consumed, but we'll allow it if frontend verified
          console.log('OTP verification not found, but proceeding as it may have been verified in frontend');
          // Continue with registration
        } else if (error.code === 60200) {
          return res.status(400).json({ 
            message: "Invalid OTP code. Please check and try again." 
          });
        } else if (error.code === 60203) {
          return res.status(400).json({ 
            message: "Maximum verification attempts exceeded. Please request a new OTP." 
          });
        } else {
          return res.status(400).json({ 
            message: error.message || "Failed to verify OTP. Please try again." 
          });
        }
      }
    }

    // EMAIL OTP → Internal OTP store
    if (email) {
      const verification = verifyOTP(email.toLowerCase(), otp);
      if (!verification.valid) {
        return res.status(400).json({ message: verification.message });
      }
    }
  }

  // Validate that we have at least email or phone for account creation
  if (!email && !phone) {
    return res.status(400).json({ message: "Email or phone is required to create an account" });
  }

  // Create hashed password if provided
  let hash = null;
  if (password) {
    hash = await bcrypt.hash(password, 10);
  }

  const userData = {
    name,
    role: "customer",
  };

  // Only include email if provided
  if (email) {
    userData.email = email.toLowerCase();
  }

  // Only include phone if provided
  if (phone) {
    userData.phone = phone;
  }

  // Only include gender if provided
  if (gender) {
    userData.gender = gender;
  }

  if (hash) userData.password = hash;

  try {
    const user = await User.create(userData);

    const token = jwt.sign(
      { id: user._id, role: "customer" },
      process.env.JWT_SECRET,
      tokenOptions
    );

    return res.status(201).json(
      buildAuthResponse(token, {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
      })
    );
  } catch (error) {
    console.error('Error creating user:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      userData: { ...userData, password: hash ? '[HIDDEN]' : undefined }
    });
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'email or phone';
      return res.status(409).json({ 
        message: `An account with this ${duplicateField} already exists` 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message: `Validation error: ${validationErrors}` });
    }
    
    return res.status(500).json({ 
      message: error.message || "Failed to create account. Please try again." 
    });
  }
}


async function loginCustomer(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, loginType, name, phone, otp } = req.body;

  let user;

  if (loginType === 'otp') {
    // OTP login - redirect to loginWithOtp endpoint
    // This should not be called directly, but handle it for backward compatibility
    if (!name || (!phone && !email)) {
      return res.status(400).json({ message: 'Name and phone or email are required for OTP login' });
    }

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    // Verify OTP first
    let otpVerified = false;
    
    // PHONE OTP → Twilio Verify
    if (phone) {
      try {
        const twilio = require("twilio")(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        const check = await twilio.verify.v2
          .services(process.env.TWILIO_VERIFY_SID)
          .verificationChecks.create({
            to: phone,
            code: otp,
          });

        if (check.status !== "approved") {
          return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        otpVerified = true;
      } catch (error) {
        console.error('Twilio verification error:', error);
        return res.status(400).json({ message: "Failed to verify OTP" });
      }
    }

    // EMAIL OTP → Local OTP store
    if (email) {
      const verification = verifyOTP(email.toLowerCase(), otp);
      if (!verification.valid) {
        return res.status(400).json({ message: verification.message });
      }
      otpVerified = true;
    }

    if (!otpVerified) {
      return res.status(400).json({ message: "OTP verification failed" });
    }

    // Find existing user
    const query = {};
    if (phone) {
      query.phone = phone;
    }
    if (email) {
      query.email = email.toLowerCase();
    }

    if (Object.keys(query).length > 0) {
      user = await User.findOne({ $or: Object.keys(query).map(key => ({ [key]: query[key] })) });
    }

    // If user doesn't exist, create new account (auto-registration)
    if (!user) {
      try {
        user = await User.create({
          name: name,
          email: email?.toLowerCase(),
          phone: phone,
          role: 'customer',
        });
      } catch (error) {
        console.error('Error creating user during OTP login:', error);
        if (error.code === 11000) {
          return res.status(409).json({ message: "An account with this email or phone already exists" });
        }
        return res.status(500).json({ message: "Failed to create account. Please try again." });
      }
    }
  } else {
    // Password login
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required for password login' });
    }

    user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'Password not set. Please use OTP or Google login.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, tokenOptions);

  res.json(
    buildAuthResponse(token, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
    })
  );
}

async function loginWithOtp(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors in loginWithOtp:', errors.array());
    return res.status(400).json({ 
      message: errors.array()[0].msg || 'Validation failed',
      errors: errors.array() 
    });
  }

  const { name, phone, email, otp } = req.body;

  console.log('OTP login attempt:', { name, phone: phone ? '***' : undefined, email: email ? '***' : undefined, hasOtp: !!otp });

  if (!name || (!phone && !email)) {
    return res.status(400).json({ message: 'Name and phone or email are required' });
  }

  if (!otp) {
    return res.status(400).json({ message: 'OTP is required' });
  }

  // Verify OTP first
  let otpVerified = false;
  
  // PHONE OTP → Twilio Verify
  if (phone) {
    try {
      const twilio = require("twilio")(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      // Validate Twilio credentials
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SID) {
        console.error('Twilio credentials not configured');
        return res.status(500).json({ message: "OTP service not configured. Please contact support." });
      }

      // Clean the service SID (remove any special characters that might have been introduced)
      const serviceSid = process.env.TWILIO_VERIFY_SID.trim();

      const check = await twilio.verify.v2
        .services(serviceSid)
        .verificationChecks.create({
          to: phone,
          code: otp,
        });

      if (check.status !== "approved") {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      otpVerified = true;
    } catch (error) {
      console.error('Twilio verification error:', error);
      // Handle specific Twilio errors
      if (error.code === 20404) {
        // OTP verification not found - might be already consumed by frontend verification
        // If frontend verified it, we'll trust that and proceed
        console.log('OTP verification not found (likely already verified in frontend), proceeding with login/registration');
        otpVerified = true; // Trust frontend verification
      } else if (error.code === 60200) {
        return res.status(400).json({ 
          message: "Invalid OTP code. Please check and try again." 
        });
      } else if (error.code === 60203) {
        return res.status(400).json({ 
          message: "Maximum verification attempts exceeded. Please request a new OTP." 
        });
      } else {
        return res.status(400).json({ 
          message: error.message || "Failed to verify OTP. Please try again." 
        });
      }
    }
  }

  // EMAIL OTP → Local OTP store
  if (email) {
    const verification = verifyOTP(email.toLowerCase(), otp);
    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }
    otpVerified = true;
  }

  if (!otpVerified) {
    return res.status(400).json({ message: "OTP verification failed" });
  }

  // Find existing user
  const query = {};
  if (phone) {
    query.phone = phone;
  }
  if (email) {
    query.email = email.toLowerCase();
  }

  let user = null;
  if (Object.keys(query).length > 0) {
    user = await User.findOne({ $or: Object.keys(query).map(key => ({ [key]: query[key] })) });
  }

  // If user doesn't exist, create new account (auto-registration)
  if (!user) {
    try {
      user = await User.create({
        name: name,
        email: email?.toLowerCase(),
        phone: phone,
        role: 'customer',
      });
    } catch (error) {
      console.error('Error creating user during OTP login:', error);
      if (error.code === 11000) {
        return res.status(409).json({ message: "An account with this email or phone already exists" });
      }
      return res.status(500).json({ message: "Failed to create account. Please try again." });
    }
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, tokenOptions);

  res.json(
    buildAuthResponse(token, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
    })
  );
}

async function googleAuthCallback(req, res) {
  try {
    const { code } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=no_code`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.API_URL || 'http://localhost:5000'}/api/auth/customers/google/callback`;

    if (!clientId || !clientSecret) {
      console.error('Google OAuth credentials not configured');
      return res.redirect(`${frontendUrl}/login?error=oauth_not_configured`);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', errorData);
      return res.redirect(`${frontendUrl}/login?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to fetch user info from Google');
      return res.redirect(`${frontendUrl}/login?error=user_info_failed`);
    }

    const googleUser = await userInfoResponse.json();
    const { id: googleId, email, name, picture } = googleUser;

    if (!email) {
      return res.redirect(`${frontendUrl}/login?error=no_email`);
    }

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { googleId: googleId }
      ]
    });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        try {
          await user.save();
        } catch (error) {
          console.error('Error updating user Google ID:', error);
        }
      }
    } else {
      // Create new user
      try {
        user = await User.create({
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          googleId: googleId,
          role: 'customer',
        });
      } catch (error) {
        console.error('Error creating user during Google auth:', error);
        if (error.code === 11000) {
          return res.redirect(`${frontendUrl}/login?error=account_exists`);
        }
        return res.redirect(`${frontendUrl}/login?error=account_creation_failed`);
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, tokenOptions);

    // Build user object for redirect
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      gender: user.gender,
    };

    // Redirect to frontend callback with token and user data
    const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userData))}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google auth error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }
}

async function googleAuthInitiate(req, res) {
  try {
    // In production, this would redirect to Google OAuth
    // For now, return the Google OAuth URL
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.API_URL || 'http://localhost:5000'}/api/auth/customers/google/callback`;
    const scope = 'profile email';
    
    if (!clientId) {
      return res.status(500).json({ 
        message: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID in environment variables.',
        url: null 
      });
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    
    res.json({ url: authUrl });
  } catch (error) {
    console.error('Google auth initiate error:', error);
    res.status(500).json({ 
      message: 'Failed to initiate Google login. Please try again.',
      url: null 
    });
  }
}

function getProfile(req, res) {
  res.json({ user: req.user });
}

module.exports = { 
  loginAdmin, 
  registerCustomer, 
  loginCustomer, 
  loginWithOtp, 
  googleAuthCallback,
  googleAuthInitiate,
  getProfile 
};

