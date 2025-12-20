const Feedback = require('../models/Feedback');
const nodemailer = require('nodemailer');

// Create feedback and send email notification
async function createFeedback(req, res) {
  try {
    const { name, email, phone, category, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !category || !subject || !message) {
      return res.status(400).json({ 
        message: 'Name, email, category, subject, and message are required' 
      });
    }

    // Create feedback in database
    const feedback = await Feedback.create({
      name,
      email,
      phone: phone || undefined,
      category,
      subject,
      message,
      status: 'new',
    });

    // Send email notification
    try {
      await sendFeedbackEmail(feedback);
    } catch (emailError) {
      console.error('Failed to send feedback email:', emailError);
      // Don't fail the request if email fails, feedback is still saved
    }

    res.status(201).json({
      message: 'Thank you for your feedback! We will get back to you within 24-48 hours.',
      feedback: {
        id: feedback._id,
        category: feedback.category,
        subject: feedback.subject,
      },
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ 
      message: 'Failed to submit feedback. Please try again later.' 
    });
  }
}

// Send feedback email to admin
async function sendFeedbackEmail(feedback) {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email not configured. Feedback saved but email not sent.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const categoryLabels = {
    post_office: 'Post Office Services',
    user_support: 'User Support',
    developer: 'Developer/Technical',
    feedback: 'Feedback & Suggestions',
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'navdeeprana444@gmail.com',
    subject: `[Dhakkhana Feedback] ${feedback.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">New Feedback Received</h2>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border: 1px solid #dee2e6; border-top: none;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Category:</td>
              <td style="padding: 8px 0;">${categoryLabels[feedback.category] || feedback.category}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Name:</td>
              <td style="padding: 8px 0;">${feedback.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${feedback.email}">${feedback.email}</a></td>
            </tr>
            ${feedback.phone ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;"><a href="tel:${feedback.phone}">${feedback.phone}</a></td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
              <td style="padding: 8px 0;">${feedback.subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 8px 0; white-space: pre-wrap;">${feedback.message}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
              <td style="padding: 8px 0;">${new Date(feedback.createdAt).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Feedback ID:</td>
              <td style="padding: 8px 0;">${feedback._id}</td>
            </tr>
          </table>
        </div>
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 0 0 8px 8px; border: 1px solid #dee2e6; border-top: none; text-align: center;">
          <p style="margin: 0; color: #6c757d; font-size: 12px;">
            This is an automated notification from Dhakkhana Contact Form
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Feedback email sent to navdeeprana444@gmail.com for feedback ID: ${feedback._id}`);
}

// Get all feedback (admin only - optional for future use)
async function getAllFeedback(req, res) {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ feedbacks });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
}

// Update feedback status (admin only - optional for future use)
async function updateFeedbackStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status, adminNotes },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({ message: 'Feedback updated successfully', feedback });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Failed to update feedback' });
  }
}

module.exports = {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus,
};

