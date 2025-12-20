const crypto = require('crypto');

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// OTP expiration time (5 minutes)
const OTP_EXPIRY = 5 * 60 * 1000;

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Store OTP with expiration
function storeOTP(identifier, otp) {
  const expiresAt = Date.now() + OTP_EXPIRY;
  otpStore.set(identifier, { otp, expiresAt });
  
  // Clean up expired OTPs
  setTimeout(() => {
    otpStore.delete(identifier);
  }, OTP_EXPIRY);
}

// Verify OTP (with option to consume or just check)
function verifyOTP(identifier, otp, consume = true) {
  const stored = otpStore.get(identifier);
  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(identifier);
    return { valid: false, message: 'OTP expired' };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  // Mark as verified but don't delete yet (allow one more use for registration)
  if (!consume) {
    // Just check, don't consume - used for frontend verification
    return { valid: true, message: 'OTP verified successfully' };
  }
  
  // OTP verified and consumed, remove it
  otpStore.delete(identifier);
  return { valid: true, message: 'OTP verified successfully' };
}

// Send OTP via email (using nodemailer)
// async function sendOTPEmail(email, otp) {
//   try {
//     // For development/testing: send to navdeeprana444@gmail.com
//     // const testEmail = process.env.TEST_EMAIL || 'navdeeprana444@gmail.com';
//     // const actualEmail = process.env.NODE_ENV === 'production' ? email : testEmail;
//     // const actualEmail = email;

    
//     // Check if email service is configured
//     const emailUser = process.env.EMAIL_USER;
//     const emailPass = process.env.EMAIL_PASS;
    
//     // Always log OTP to console for development
//     console.log(`\n=== OTP EMAIL ===`);
//     console.log(`Requested for: ${email}`);
//     console.log(`Sending to: ${actualEmail}`);
//     console.log(`OTP Code: ${otp}`);
//     console.log(`================\n`);
    
//     // if (!emailUser || !emailPass) {
//     //   return { success: true, message: `OTP sent to ${actualEmail} (check console for OTP code)` };
//     // }
    
//     // Try to use nodemailer if available
//     let nodemailer;
//     try {
//       nodemailer = require('nodemailer');
//     } catch (err) {
//       console.log('Nodemailer not installed. Install with: npm install nodemailer');
//       return { success: true, message: `OTP sent to ${actualEmail} (check console for OTP code)` };
//     }
    
//     const emailService = process.env.EMAIL_SERVICE || 'gmail';
    
//     const transporter = nodemailer.createTransport({
//       service: emailService,
//       auth: {
//         user: emailUser,
//         pass: emailPass,
//       },
//     });
    
//     const mailOptions = {
//       from: emailUser,
//       to: actualEmail,
//       subject: 'Your Dhakkhana OTP Code',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #dc3545;">Dhakkhana OTP Verification</h2>
//           <p>Your OTP code for Dhakkhana account verification is:</p>
//           <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #dc3545; letter-spacing: 5px; margin: 20px 0;">
//             ${otp}
//           </div>
//           <p style="color: #6c757d; font-size: 12px;">This OTP will expire in 5 minutes. Do not share this code with anyone.</p>
//           <p style="color: #6c757d; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
//         </div>
//       `,
//     };
    
//     await transporter.sendMail(mailOptions);
//     return { success: true, message: `OTP sent to ${actualEmail}` };
//   } catch (error) {
//     console.error('Email sending error:', error);
//     // Fallback: Log to console
//     console.log(`\n=== OTP EMAIL (Fallback) ===`);
//     console.log(`To: ${email}`);
//     console.log(`OTP: ${otp}`);
//     console.log(`===========================\n`);
//     return { success: true, message: `OTP generated (check console for code: ${otp})` };
//   }
// }

async function sendOTPEmail(email, otp) {
  try {
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // send to actual user
      subject: "Your OTP Code",
      html: `
        <h2>Your Dhakkhana OTP</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { success: true, message: `OTP sent to ${email}` };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, message: "Failed to send OTP email" };
  }
}

// Send OTP via SMS (placeholder - integrate with Twilio or similar)
// async function sendOTPSMS(phone, otp) {
//   try {
//     console.log(`\n=== OTP SMS ===`);
//     console.log(`To: ${phone}`);
//     console.log(`OTP: ${otp}`);
//     console.log(`==============\n`);
    
//     // TODO: Integrate with SMS service
//     // const twilio = require('twilio');
//     // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
//     // await client.messages.create({
//     //   body: `Your Dhakkhana OTP code is: ${otp}. Valid for 5 minutes.`,
//     //   from: process.env.TWILIO_PHONE_NUMBER,
//     //   to: phone
//     // });
    
//     return { success: true, message: 'OTP sent to phone (check console for development)' };
//   } catch (error) {
//     console.error('SMS sending error:', error);
//     return { success: false, message: 'Failed to send SMS' };
//   }
// }

async function sendOTPSMS(phone, otp) {
  try {
    const twilio = require("twilio")(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Using Verify API (no phone number required)
    const verification = await twilio.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: phone,
        channel: "sms",
      });

    return { success: true, message: `OTP sent to ${phone}` };
  } catch (error) {
    console.error("SMS sending error:", error);
    return { success: false, message: "Failed to send SMS" };
  }
}




// Send OTP endpoint
async function sendOTP(req, res) {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone number is required" });
    }

    let result;

    // EMAIL OTP → use your internal OTP
    if (email) {
      const otp = generateOTP();
      storeOTP(email, otp);
      result = await sendOTPEmail(email, otp);
    }

    // PHONE OTP → Twilio Verify (no custom OTP)
    if (phone) {
      result = await sendOTPSMS(phone);
    }

    if (result.success) {
      return res.json({
        message: result.message,
      });
    }

    return res.status(500).json({ message: "Failed to send OTP" });

  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}



// Verify OTP endpoint
// async function verifyOTPEndpoint(req, res) {
//   try {
//     const { email, phone, otp } = req.body;
    
//     if (!otp) {
//       return res.status(400).json({ message: 'OTP is required' });
//     }
    
//     if (!email && !phone) {
//       return res.status(400).json({ message: 'Email or phone number is required' });
//     }
    
//     const identifier = email || phone;
//     // const verification = verifyOTP(identifier, otp);
    
//     if (verification.valid) {
//       res.json({ message: verification.message, verified: true });
//     } else {
//       res.status(400).json({ message: verification.message, verified: false });
//     }
//   } catch (error) {
//     console.error('Verify OTP error:', error);
//     res.status(500).json({ message: 'Failed to verify OTP' });
//   }
// }


async function verifyOTPEndpoint(req, res) {
  try {
    const { phone, otp, email } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    // PHONE: Twilio Verify
    if (phone) {
      try {
        const twilio = require("twilio")(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        // Validate Twilio credentials
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SID) {
          console.error('Twilio credentials not configured');
          return res.status(500).json({ verified: false, message: "OTP service not configured. Please contact support." });
        }

        // Clean the service SID (remove any special characters that might have been introduced)
        const serviceSid = process.env.TWILIO_VERIFY_SID.trim();

        const check = await twilio.verify.v2
          .services(serviceSid)
          .verificationChecks.create({
            to: phone,
            code: otp,
          });

        if (check.status === "approved") {
          return res.json({ verified: true, message: "OTP verified!" });
        } else {
          return res.status(400).json({ verified: false, message: "Invalid OTP" });
        }
      } catch (error) {
        console.error('Twilio verification error:', error);
        // Handle specific Twilio errors
        if (error.code === 20404) {
          return res.status(400).json({ 
            verified: false,
            message: "OTP verification not found. Please request a new OTP." 
          });
        }
        if (error.code === 60200) {
          return res.status(400).json({ 
            verified: false,
            message: "Invalid OTP code. Please check and try again." 
          });
        }
        if (error.code === 60203) {
          return res.status(400).json({ 
            verified: false,
            message: "Maximum verification attempts exceeded. Please request a new OTP." 
          });
        }
        return res.status(400).json({ 
          verified: false,
          message: error.message || "Failed to verify OTP. Please try again." 
        });
      }
    }

    // EMAIL: Local OTP
    if (email) {
      // Don't consume OTP during frontend verification - allow it to be used for registration
      const verification = verifyOTP(email.toLowerCase(), otp, false);
      if (!verification.valid) {
        return res.status(400).json({ verified: false, message: verification.message });
      }
      return res.json({ verified: true, message: "OTP verified!" });
    }

    return res.status(400).json({ message: "Email or phone is required" });

  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
}



module.exports = {
  sendOTP,
  verifyOTPEndpoint,
  verifyOTP, // Export for use in auth controller
};

