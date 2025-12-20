import React, { useState } from 'react';
import SiteNavbar from '../components/layout/SiteNavbar';
import SiteFooter from '../components/layout/SiteFooter';
import { submitFeedback } from '../services/api';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  Building2, 
  Users, 
  Code, 
  CheckCircle,
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'post_office',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await submitFeedback(formData);
      setStatus({ 
        type: 'success', 
        message: response.message || 'Thank you for your feedback! We will get back to you within 24-48 hours.' 
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'post_office',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to submit feedback. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const contactCategories = [
    { value: 'post_office', label: 'Post Office Services', icon: Building2, description: 'Questions about postal services, delivery, tracking' },
    { value: 'user_support', label: 'User Support', icon: Users, description: 'Account issues, login problems, technical help' },
    { value: 'developer', label: 'Developer/Technical', icon: Code, description: 'API access, integrations, technical queries' },
    { value: 'feedback', label: 'Feedback & Suggestions', icon: MessageSquare, description: 'Share your thoughts and suggestions' },
  ];

  const offices = [
    {
      name: 'New Delhi GPO',
      address: 'Sansad Marg, New Delhi - 110001',
      phone: '011-23096044',
      email: 'delhi.gpo@dhakkhana.in',
      timings: 'Mon-Sat: 9:00 AM - 8:00 PM',
    },
    {
      name: 'Mumbai GPO',
      address: 'DN Road, Fort, Mumbai - 400001',
      phone: '022-22620067',
      email: 'mumbai.gpo@dhakkhana.in',
      timings: 'Mon-Sat: 9:00 AM - 8:00 PM',
    },
    {
      name: 'Kolkata GPO',
      address: 'BBD Bagh, Kolkata - 700001',
      phone: '033-22313933',
      email: 'kolkata.gpo@dhakkhana.in',
      timings: 'Mon-Sat: 9:00 AM - 8:00 PM',
    },
    {
      name: 'Bengaluru Head Post Office',
      address: 'Raj Bhavan Rd, Bengaluru - 560001',
      phone: '080-22861632',
      email: 'bangalore.hpo@dhakkhana.in',
      timings: 'Mon-Sat: 9:00 AM - 8:00 PM',
    },
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <SiteNavbar />
      <main className="flex-grow-1">
        {/* Hero Section */}
        <section className="bg-danger text-white py-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h1 className="display-4 fw-bold mb-3">Get in Touch</h1>
                <p className="lead mb-0">
                  We're here to help! Reach out to us for any questions, feedback, or support.
                </p>
              </div>
              <div className="col-lg-4 text-end">
                <div className="d-inline-block bg-white bg-opacity-10 rounded-circle p-4">
                  <MessageSquare size={64} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                      <Phone className="text-danger" size={32} />
                    </div>
                    <h5 className="fw-bold">Phone Support</h5>
                    <p className="text-muted mb-2">24/7 Customer Care</p>
                    <a href="tel:+919876543210" className="text-danger text-decoration-none fw-semibold">
                      +91 98765 43210
                    </a>
                    <p className="text-muted small mt-2 mb-0">Toll-free: 1800-123-4567</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                      <Mail className="text-danger" size={32} />
                    </div>
                    <h5 className="fw-bold">Email Support</h5>
                    <p className="text-muted mb-2">We respond within 24 hours</p>
                    <a href="mailto:hello@dhakkhana.in" className="text-danger text-decoration-none fw-semibold">
                      hello@dhakkhana.in
                    </a>
                    <p className="text-muted small mt-2 mb-0">support@dhakkhana.in</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                      <MapPin className="text-danger" size={32} />
                    </div>
                    <h5 className="fw-bold">Head Office</h5>
                    <p className="text-muted mb-2">Visit us at</p>
                    <p className="text-dark small mb-0">
                      Dak Bhavan, Sansad Marg<br />
                      New Delhi - 110001
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Form */}
        <section className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto">
                <div className="text-center mb-5">
                  <h2 className="fw-bold mb-3">Send us a Message</h2>
                  <p className="text-muted">
                    Choose a category and fill out the form below. We'll get back to you as soon as possible.
                  </p>
                </div>

                {/* Category Selection */}
                <div className="row g-3 mb-4">
                  {contactCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.value} className="col-md-6">
                        <label className="d-block">
                          <input
                            type="radio"
                            name="category"
                            value={category.value}
                            checked={formData.category === category.value}
                            onChange={handleChange}
                            className="d-none"
                          />
                          <div
                            className={`card h-100 border-2 cursor-pointer transition-all ${
                              formData.category === category.value
                                ? 'border-danger shadow-sm'
                                : 'border-light'
                            }`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setFormData({ ...formData, category: category.value })}
                          >
                            <div className="card-body p-3">
                              <div className="d-flex align-items-start gap-3">
                                <div
                                  className={`rounded-circle p-2 ${
                                    formData.category === category.value
                                      ? 'bg-danger text-white'
                                      : 'bg-light text-muted'
                                  }`}
                                >
                                  <Icon size={20} />
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="fw-semibold mb-1">{category.label}</h6>
                                  <p className="text-muted small mb-0">{category.description}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>

                {/* Contact Form */}
                <form onSubmit={handleSubmit} className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    {status.message && (
                      <div
                        className={`alert alert-${
                          status.type === 'success' ? 'success' : 'danger'
                        } d-flex align-items-center gap-2`}
                        role="alert"
                      >
                        {status.type === 'success' ? (
                          <CheckCircle size={20} />
                        ) : (
                          <AlertCircle size={20} />
                        )}
                        {status.message}
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Subject <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          placeholder="Brief description of your query"
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Message <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows="6"
                          placeholder="Please provide details about your query, feedback, or issue..."
                        />
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-danger btn-lg w-100"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send size={20} className="me-2" />
                              Send Message
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Office Locations */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">Major Post Offices</h2>
              <p className="text-muted">Visit our offices across India for in-person assistance</p>
            </div>
            <div className="row g-4">
              {offices.map((office, index) => (
                <div key={index} className="col-lg-6">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h5 className="fw-bold text-danger mb-3">{office.name}</h5>
                      <div className="d-flex gap-3 mb-3">
                        <MapPin size={20} className="text-danger mt-1 flex-shrink-0" />
                        <p className="text-muted mb-0 small">{office.address}</p>
                      </div>
                      <div className="d-flex gap-3 mb-3">
                        <Phone size={20} className="text-danger mt-1 flex-shrink-0" />
                        <a href={`tel:${office.phone}`} className="text-decoration-none text-dark small">
                          {office.phone}
                        </a>
                      </div>
                      <div className="d-flex gap-3 mb-3">
                        <Mail size={20} className="text-danger mt-1 flex-shrink-0" />
                        <a href={`mailto:${office.email}`} className="text-decoration-none text-dark small">
                          {office.email}
                        </a>
                      </div>
                      <div className="d-flex gap-3">
                        <Clock size={20} className="text-danger mt-1 flex-shrink-0" />
                        <p className="text-muted mb-0 small">{office.timings}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Media & Additional Info */}
        <section className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h4 className="fw-bold mb-4">Connect With Us</h4>
                    <div className="d-flex gap-3 mb-4 flex-wrap">
                      <a
                        href="https://facebook.com/dhakkhana"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary"
                      >
                        <Facebook size={20} className="me-2" />
                        Facebook
                      </a>
                      <a
                        href="https://twitter.com/dhakkhana"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-info"
                      >
                        <Twitter size={20} className="me-2" />
                        Twitter
                      </a>
                      <a
                        href="https://instagram.com/dhakkhana.official"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-danger"
                      >
                        <Instagram size={20} className="me-2" />
                        Instagram
                      </a>
                      <a
                        href="https://linkedin.com/company/dhakkhana"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary"
                      >
                        <Linkedin size={20} className="me-2" />
                        LinkedIn
                      </a>
                      <a
                        href="https://youtube.com/@dhakkhana"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-danger"
                      >
                        <Youtube size={20} className="me-2" />
                        YouTube
                      </a>
                    </div>

                    <hr className="my-4" />

                    <div className="row g-4">
                      <div className="col-md-6">
                        <h6 className="fw-bold mb-3">Business Hours</h6>
                        <div className="small text-muted">
                          <p className="mb-1"><strong>Customer Support:</strong> 24/7</p>
                          <p className="mb-1"><strong>Post Office:</strong> Mon-Sat, 9:00 AM - 8:00 PM</p>
                          <p className="mb-1"><strong>Sunday:</strong> Closed</p>
                          <p className="mb-0"><strong>Holidays:</strong> As per government calendar</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <h6 className="fw-bold mb-3">Quick Links</h6>
                        <div className="small">
                          <a href="/" className="text-decoration-none text-muted d-block mb-2">
                            Track Parcel
                          </a>
                          <a href="/register" className="text-decoration-none text-muted d-block mb-2">
                            Create Account
                          </a>
                          <a href="/dashboard/customer" className="text-decoration-none text-muted d-block mb-2">
                            My Dashboard
                          </a>
                          <a href="/#services" className="text-decoration-none text-muted d-block mb-2">
                            Our Services
                          </a>
                          <a href="mailto:privacy@dhakkhana.in" className="text-decoration-none text-muted d-block mb-0">
                            Privacy Policy
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

