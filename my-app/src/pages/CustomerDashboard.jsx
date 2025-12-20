import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TrackParcel from '../components/track/TrackParcel';
import ParcelsTable from '../components/list/ParcelsTable';
import RegisterParcel from '../components/register/RegisterParcel';
import './CustomerDashboard.css';
import {
  fetchCustomerParcels,
  fetchCustomerStats,
  mapServerParcel,
  trackParcel,
  createBookingRequest,
  cancelBookingRequest,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Package,
  Globe,
  Wallet,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  User,
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [trackState, setTrackState] = useState({ result: null, error: null, loading: false });
  const [showBookingForm, setShowBookingForm] = useState(searchParams.get('action') === 'book');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('self-booking');

  const loadData = async () => {
    try {
      const [statRes, parcelRes] = await Promise.all([fetchCustomerStats(), fetchCustomerParcels()]);
      setStats(statRes.totals);
      setParcels(parcelRes.map(mapServerParcel));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTrackParcel = async (trackingId) => {
    setTrackState({ result: null, error: null, loading: true });
    try {
      const parcel = await trackParcel(trackingId);
      setTrackState({ result: parcel, error: null, loading: false });
    } catch (error) {
      setTrackState({ result: null, error: error.response?.data?.message || 'Not found', loading: false });
    }
  };

  const handleBookingSubmit = async (formData, resetForm) => {
    setBookingLoading(true);
    try {
      const response = await createBookingRequest(formData);
      alert(
        `Booking request submitted successfully!\nRequest ID: ${response.requestId}\n\nYour request is pending admin approval. You will receive a tracking ID once approved.`
      );
      resetForm();
      setShowBookingForm(false);
      loadData(); // Refresh the parcels list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit booking request. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelRequest = async (parcelId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) {
      return;
    }

    setBookingLoading(true);
    try {
      await cancelBookingRequest(parcelId);
      alert('Booking request cancelled successfully!');
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking request.');
    } finally {
      setBookingLoading(false);
    }
  };

  const statCards = useMemo(
    () => [
      { label: 'My Bookings', value: stats?.total ?? 0 },
      { label: 'Pending Approval', value: stats?.pending ?? 0 },
      { label: 'In Transit', value: stats?.transit ?? 0 },
      { label: 'Delivered', value: stats?.delivered ?? 0 },
    ],
    [stats]
  );

  const portalCards = [
    { key: 'self-booking', label: 'Self Booking' },
    { key: 'my-bookings', label: 'My Bookings' },
    { key: 'domestic', label: 'Domestic Booking' },
    { key: 'international', label: 'International Booking' },
    { key: 'money-order', label: 'Money Order' },
    { key: 'bulk-booking', label: 'Bulk Booking' },
    { key: 'payment-status', label: 'Payment Status' },
  ];

  const handleSidebarClick = (section) => {
    setActiveSection(section);
    if (section === 'self-booking') {
      setShowBookingForm(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleVisitSite = () => {
    window.open('/', '_blank');
  };

  return (
    <div className="user-shell">
      <header className="user-header">
        <div className="brand">Dak Khana CRM</div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn ghost" onClick={handleVisitSite} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            Visit Site
          </button>
          <button className="btn ghost" onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            Logout
          </button>
          <div className="profile-pill">
            <span className="avatar">{user?.name?.[0] || 'U'}</span>
            <div>
              <div className="strong">{user?.name}</div>
              <div className="muted small">{user?.email}</div>
            </div>
          </div>
        </div>
      </header>
      <div className="crm-bar">
        <span>Official Postal Portal</span>
        <span>Helpdesk: 1800-POST</span>
        <span>Service Hours: 9 AM - 8 PM</span>
      </div>

      <div className="user-body">
        <aside className="user-sidebar">
          <div className="sidebar-title">Navigation</div>
          <nav className="icon-nav">
            <button 
              className={`icon-nav-btn ${activeSection === 'self-booking' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('self-booking')}
              title="Self Booking"
            >
              <Home size={20} />
              <span className="nav-tooltip">Self Booking</span>
            </button>
            <button 
              className={`icon-nav-btn ${activeSection === 'my-bookings' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('my-bookings')}
              title="My Bookings"
            >
              <Package size={20} />
              <span className="nav-tooltip">My Bookings</span>
            </button>
            <button 
              className={`icon-nav-btn ${activeSection === 'domestic' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('domestic')}
              title="Domestic Booking"
            >
              <Package size={20} />
              <span className="nav-tooltip">Domestic Booking</span>
            </button>
            <button 
              className={`icon-nav-btn ${activeSection === 'international' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('international')}
              title="International Booking"
            >
              <Globe size={20} />
              <span className="nav-tooltip">International Booking</span>
            </button>
            <button 
              className={`icon-nav-btn ${activeSection === 'money-order' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('money-order')}
              title="Money Order"
            >
              <Wallet size={20} />
              <span className="nav-tooltip">Money Order</span>
            </button>
            <button 
              className={`icon-nav-btn ${activeSection === 'bulk-booking' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('bulk-booking')}
              title="Bulk Booking"
            >
              <ShoppingCart size={20} />
              <span className="nav-tooltip">Bulk Booking</span>
            </button>
            <button 
              className={`icon-nav-btn ${activeSection === 'payment-status' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('payment-status')}
              title="Payment Status"
            >
              <CreditCard size={20} />
              <span className="nav-tooltip">Payment Status</span>
            </button>
            <button 
              className={`icon-nav-btn ${activeSection === 'complaints' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('complaints')}
              title="Complaints"
            >
              <MessageSquare size={20} />
              <span className="nav-tooltip">Complaints</span>
            </button>
            <button 
              className={`icon-nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => handleSidebarClick('profile')}
              title="Profile"
            >
              <User size={20} />
              <span className="nav-tooltip">Profile</span>
            </button>
          </nav>
        </aside>

        <main className="user-main">
          {activeSection === 'self-booking' && (
            <>
              <section className="card panel">
                <div className="section-head">
                  <div>
                    <p className="eyebrow">At a glance</p>
                    <h2>Booking & payment status</h2>
                  </div>
                  <button className="btn primary" onClick={() => setShowBookingForm(true)}>
                    Start Booking
                  </button>
                </div>
                <div className="card-grid">
                  {statCards.map((card) => (
                    <div className="stat-card" key={card.label}>
                      <div className="eyebrow">{card.label}</div>
                      <h3>{card.value}</h3>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card panel">
                <div className="section-title">Booking & Tracking</div>
                <div className="portal-grid two-col">
                  <div className="panel-tile">
                    <div className="section-title subtle">Track & timeline</div>
                    <TrackParcel
                      onTrack={handleTrackParcel}
                      result={trackState.result}
                      error={trackState.error}
                      isLoading={trackState.loading}
                    />
                  </div>
                  <div className="panel-tile">
                    <div className="section-title subtle">Suggested Services</div>
                    <ul className="plain-list">
                      <li>Speed Post for urgent documents</li>
                      <li>Logistics for bulky shipments</li>
                      <li>Money Order for remittances</li>
                      <li>Bulk Booking for businesses</li>
                    </ul>
                    <div className="action-row">
                      <button className="btn ghost" onClick={() => setShowBookingForm(true)}>
                        View Cart
                      </button>
                      <button className="btn primary" onClick={() => setShowBookingForm(true)}>
                        Complete Booking
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="card panel">
                <div className="section-title maroon">My Bookings & Payments</div>
                <ParcelsTable parcels={parcels} mode="customer" onCancel={handleCancelRequest} />
              </section>

              {showBookingForm && (
                <section className="card panel">
                  <div className="section-title maroon">Book a Postal Article</div>
                  <div className="booking-actions">
                    <button className="btn ghost" onClick={() => setShowBookingForm(false)}>
                      Cancel
                    </button>
                  </div>
                  <RegisterParcel onSubmit={handleBookingSubmit} isLoading={bookingLoading} title="Pickup / Dropoff" />
                </section>
              )}
            </>
          )}

          {activeSection === 'my-bookings' && (
            <section className="card panel">
              <div className="section-title maroon">My Bookings & Payments</div>
              <ParcelsTable parcels={parcels} mode="customer" onCancel={handleCancelRequest} />
            </section>
          )}

          {(activeSection === 'domestic' || activeSection === 'international' || activeSection === 'money-order' || activeSection === 'bulk-booking') && (
            <section className="card panel">
              <div className="section-title maroon">{portalCards.find(c => c.key === activeSection)?.label || 'Booking'}</div>
              <p className="muted">This feature is coming soon. Use Self Booking to create a new parcel booking.</p>
              <button className="btn primary" onClick={() => { setActiveSection('self-booking'); setShowBookingForm(true); }} style={{ marginTop: '12px' }}>
                Start Booking
              </button>
            </section>
          )}

          {activeSection === 'payment-status' && (
            <section className="card panel">
              <div className="section-title maroon">Payment Status</div>
              <div className="card-grid">
                {statCards.map((card) => (
                  <div className="stat-card" key={card.label}>
                    <div className="eyebrow">{card.label}</div>
                    <h3>{card.value}</h3>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === 'complaints' && (
            <section className="card panel">
              <div className="section-title maroon">Complaints</div>
              <p className="muted">To file a complaint, please visit the Contact page or email us at support@dakkhana.in</p>
            </section>
          )}

          {activeSection === 'profile' && (
            <section className="card panel">
              <div className="section-title maroon">Profile</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div className="eyebrow">Name</div>
                  <div className="strong">{user?.name}</div>
                </div>
                <div>
                  <div className="eyebrow">Email</div>
                  <div className="strong">{user?.email}</div>
                </div>
                <div>
                  <div className="eyebrow">Role</div>
                  <div className="strong">{user?.role || 'Customer'}</div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

