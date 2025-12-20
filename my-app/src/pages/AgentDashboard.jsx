import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  ClipboardList,
  MapPin,
  Menu,
  Package,
  RefreshCcw,
  ShieldCheck,
  Truck,
  XCircle,
  Navigation,
  Upload,
  FileText,
  User,
  LogOut,
  Home,
  Camera,
} from 'lucide-react';
import './AgentDashboard.css';
import { useAuth } from '../context/AuthContext';
import { fetchAssignedParcels, mapServerParcel, updateParcelStatus } from '../services/api';

const AGENT_STATUSES = [
  'Picked Up',
  'Arrived at Hub',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Failed Attempt',
  'Returned',
];

export default function AgentDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeParcel, setActiveParcel] = useState(null);
  const [notes, setNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [activeSection, setActiveSection] = useState('home');
  const [selectedParcel, setSelectedParcel] = useState(null);

  const loadParcels = async () => {
    setLoading(true);
    try {
      // Use agent's fullName or name to fetch assigned parcels
      const agentName = user?.name || user?.fullName;
      const res = await fetchAssignedParcels({ agent: agentName, today: false });
      setParcels(res.map(mapServerParcel));
    } catch (error) {
      console.error('Failed to load assigned parcels', error);
      alert('Could not load assigned parcels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadParcels();
    }
  }, [user]);

  const todayCounts = useMemo(() => {
    const today = new Date();
    const sameDay = (dateString) => {
      if (!dateString) return false;
      const d = new Date(dateString);
      return d.toDateString() === today.toDateString();
    };

    const pickups = parcels.filter((p) => 
      sameDay(p.pickupDate) || ['Pending Approval', 'Booked'].includes(p.status)
    );
    const deliveries = parcels.filter((p) => 
      ['Out for Delivery', 'In Transit', 'Arrived at Hub', 'Picked Up'].includes(p.status)
    );
    return { pickups: pickups.length, deliveries: deliveries.length };
  }, [parcels]);

  const todayPickups = useMemo(() => {
    const today = new Date();
    const sameDay = (dateString) => {
      if (!dateString) return false;
      const d = new Date(dateString);
      return d.toDateString() === today.toDateString();
    };
    return parcels.filter((p) => 
      sameDay(p.pickupDate) || ['Pending Approval', 'Booked'].includes(p.status)
    );
  }, [parcels]);

  const todayDeliveries = useMemo(() => {
    return parcels.filter((p) => 
      ['Out for Delivery', 'In Transit', 'Arrived at Hub', 'Picked Up'].includes(p.status)
    );
  }, [parcels]);

  const handleQuickAction = (parcel, nextStatus, remark) => {
    setActiveParcel(parcel);
    setNotes(remark || '');
    setProofUrl('');
    setOtpCode('');
    handleStatusChange(parcel.id, nextStatus, remark);
  };

  const handleStatusChange = async (parcelId, status, noteOverride) => {
    setUpdating(true);
    try {
      const finalNotes = noteOverride || notes || (otpCode ? `OTP: ${otpCode}` : '');
      await updateParcelStatus(parcelId, status, finalNotes, proofUrl);
      setActiveParcel(null);
      setSelectedParcel(null);
      setNotes('');
      setProofUrl('');
      setOtpCode('');
      setProofFile(null);
      await loadParcels();
      alert('Status updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleNavigate = (address) => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapUrl, '_blank');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to a server and get a URL
      // For now, we'll use a placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setProofFile(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleVisitSite = () => {
    window.open('/', '_blank');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'agent' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="agent-shell">
      <aside className={`agent-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="brand">
            <ShieldCheck size={18} />
            <span>Dak Khana Agent</span>
          </div>
          <button className="icon-btn" onClick={() => setDrawerOpen(false)}>
            <XCircle size={16} />
          </button>
        </div>
        <nav>
          <button 
            className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => { setActiveSection('home'); setDrawerOpen(false); }}
          >
            Home
          </button>
          <button 
            className={`nav-item ${activeSection === 'pickups' ? 'active' : ''}`}
            onClick={() => { setActiveSection('pickups'); setDrawerOpen(false); }}
          >
            Today's Pickups
          </button>
          <button 
            className={`nav-item ${activeSection === 'deliveries' ? 'active' : ''}`}
            onClick={() => { setActiveSection('deliveries'); setDrawerOpen(false); }}
          >
            Today's Deliveries
          </button>
          <button 
            className={`nav-item ${activeSection === 'assigned' ? 'active' : ''}`}
            onClick={() => { setActiveSection('assigned'); setDrawerOpen(false); }}
          >
            Assigned Parcels
          </button>
          <button 
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveSection('profile'); setDrawerOpen(false); }}
          >
            Profile
          </button>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--agent-border)' }}>
          <button className="nav-item" onClick={handleVisitSite}>
            <Home size={14} style={{ marginRight: '8px', display: 'inline' }} />
            Visit Site
          </button>
          <button className="nav-item" onClick={handleLogout}>
            <LogOut size={14} style={{ marginRight: '8px', display: 'inline' }} />
            Logout
          </button>
        </div>
      </aside>

      <div className="agent-main">
        <header className="agent-header">
          <div>
            <p className="eyebrow">Field operations</p>
            <h1>Hi {user?.name}, here are your tasks</h1>
          </div>
          <div className="header-actions">
            <button className="icon-btn ghost" onClick={() => setDrawerOpen(true)}>
              <Menu size={18} />
            </button>
            <button className="btn primary" onClick={loadParcels} disabled={loading}>
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </header>

        {(activeSection === 'home' || activeSection === '') && (
          <>
            <section className="agent-cards">
              <div className="agent-card" onClick={() => setActiveSection('pickups')} style={{ cursor: 'pointer' }}>
                <div className="card-icon bg-maroon">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <p className="eyebrow">Pickup Tasks Assigned</p>
                  <h3>{todayCounts.pickups}</h3>
                </div>
              </div>
              <div className="agent-card" onClick={() => setActiveSection('deliveries')} style={{ cursor: 'pointer' }}>
                <div className="card-icon bg-gold">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="eyebrow">Delivery Tasks Assigned</p>
                  <h3>{todayCounts.deliveries}</h3>
                </div>
              </div>
            </section>

            <section className="card panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Daily Task Summary</p>
                  <h2>Today's Overview</h2>
                </div>
              </div>
              <div className="task-list">
                <div className="task-card">
                  <div className="strong">Total Tasks: {parcels.length}</div>
                  <div className="muted small" style={{ marginTop: '8px' }}>
                    Pickups: {todayCounts.pickups} | Deliveries: {todayCounts.deliveries}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {(activeSection === 'pickups' || activeSection === 'deliveries' || activeSection === 'assigned') && (
          <section className="card panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">
                  {activeSection === 'pickups' ? "Today's Pickups" : 
                   activeSection === 'deliveries' ? "Today's Deliveries" : 
                   'Assigned Parcels'}
                </p>
                <h2>
                  {activeSection === 'pickups' ? 'Pickup Tasks' : 
                   activeSection === 'deliveries' ? 'Delivery Tasks' : 
                   'All Assigned Tasks'}
                </h2>
              </div>
              <div className="muted small">{loading ? 'Loading...' : 
                activeSection === 'pickups' ? `${todayPickups.length} pickups` :
                activeSection === 'deliveries' ? `${todayDeliveries.length} deliveries` :
                `${parcels.length} total tasks`}
              </div>
            </div>
            <div className="task-list">
              {(activeSection === 'pickups' && todayPickups.length === 0) ||
               (activeSection === 'deliveries' && todayDeliveries.length === 0) ||
               (activeSection === 'assigned' && parcels.length === 0) ? (
                <p className="muted">No tasks found.</p>
              ) : null}
              {(activeSection === 'pickups' ? todayPickups : 
                activeSection === 'deliveries' ? todayDeliveries : 
                parcels).map((parcel) => (
                <div key={parcel.id} className="task-card">
                  <div className="task-header">
                    <div className="mono">#{parcel.trackingId || parcel.requestId}</div>
                    <span className="chip secondary">{parcel.serviceType}</span>
                  </div>
                  <div className="task-grid">
                    <div>
                      <p className="strong">Sender</p>
                      <div className="muted small">{parcel.senderName}</div>
                      <div className="muted small">
                        <MapPin size={12} /> {parcel.sourceCity}
                      </div>
                      <button 
                        className="btn ghost" 
                        style={{ marginTop: '4px', padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => handleNavigate(`${parcel.sourceCity}`)}
                      >
                        <Navigation size={12} />
                        Navigate
                      </button>
                    </div>
                    <div>
                      <p className="strong">Recipient</p>
                      <div className="muted small">{parcel.receiverName}</div>
                      <div className="muted small">
                        <MapPin size={12} /> {parcel.destinationCity}
                      </div>
                      <button 
                        className="btn ghost" 
                        style={{ marginTop: '4px', padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => handleNavigate(`${parcel.destinationCity}`)}
                      >
                        <Navigation size={12} />
                        Navigate
                      </button>
                    </div>
                    <div>
                      <p className="strong">Weight</p>
                      <div className="muted small">{parcel.weightKg} kg</div>
                      <div className="muted small">Mode: {parcel.pickupMode || 'Pickup'}</div>
                      {parcel.pickupSlot && <div className="muted small">Slot: {parcel.pickupSlot}</div>}
                    </div>
                    <div>
                      <p className="strong">Status</p>
                      <div className="chip secondary">{parcel.status}</div>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="btn ghost" onClick={() => handleQuickAction(parcel, 'Picked Up')}>
                      <Package size={14} />
                      Mark as Picked Up
                    </button>
                    <button className="btn ghost" onClick={() => handleQuickAction(parcel, 'Delivered')}>
                      <CheckCircle size={14} />
                      Mark as Delivered
                    </button>
                    <button className="btn primary" onClick={() => { setActiveParcel(parcel); setSelectedParcel(parcel); }}>
                      <FileText size={14} />
                      Update Status
                    </button>
                    <button 
                      className="btn ghost" 
                      onClick={() => { setActiveParcel(parcel); setSelectedParcel(parcel); setNotes('Delivery attempt - '); }}
                    >
                      <ClipboardList size={14} />
                      Add Delivery Attempt
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => handleQuickAction(parcel, 'Failed Attempt', 'Customer not available')}
                    >
                      <XCircle size={14} />
                      Customer Not Available
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'profile' && (
          <section className="card panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Profile</p>
                <h2>Agent Information</h2>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <div className="strong">{user?.role || 'Agent'}</div>
              </div>
            </div>
          </section>
        )}
      </div>

      {activeParcel && (
        <div className="modal-backdrop">
          <div className="modal-card narrow">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Update checkpoint</p>
                <h3>{activeParcel.trackingId || activeParcel.requestId}</h3>
              </div>
              <button className="icon-btn" onClick={() => setActiveParcel(null)}>
                <XCircle size={18} />
              </button>
            </div>
            <div className="status-grid">
              {AGENT_STATUSES.map((status) => (
                <button
                  key={status}
                  className={`status-btn ${activeParcel.status === status ? 'active' : ''}`}
                  onClick={() => handleStatusChange(activeParcel.id, status)}
                  disabled={updating}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="form-grid">
              <div className="form-field full">
                <label>Remarks</label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add remarks like: Customer not available, Incorrect address, Delivery rescheduled, etc."
                />
              </div>
              <div className="form-field">
                <label>Delivery OTP</label>
                <input 
                  type="text"
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)} 
                  placeholder="Enter OTP from customer" 
                />
              </div>
              <div className="form-field">
                <label>Proof of Delivery (Upload)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ padding: '8px' }}
                />
                {proofFile && (
                  <div className="muted small" style={{ marginTop: '4px' }}>
                    Selected: {proofFile.name}
                  </div>
                )}
                {proofUrl && !proofFile && (
                  <input 
                    type="text"
                    value={proofUrl} 
                    onChange={(e) => setProofUrl(e.target.value)} 
                    placeholder="Or paste proof URL" 
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn ghost" onClick={() => setActiveParcel(null)} disabled={updating}>
                Close
              </button>
              <button
                className="btn primary"
                onClick={() => handleStatusChange(activeParcel.id, activeParcel.status)}
                disabled={updating}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
