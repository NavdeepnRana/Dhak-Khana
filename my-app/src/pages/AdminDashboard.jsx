import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Edit,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Mail,
  BarChart3,
  Shield,
  ClipboardList,
  MapPin,
  FileText,
  Hourglass,
  Home,
  LogOut,
  Users,
} from 'lucide-react';
import './AdminDashboard.css';
import { useAuth } from '../context/AuthContext';
import {
  fetchAllParcels,
  fetchAdminStats,
  fetchComplaints,
  createParcel,
  updateParcelStatus,
  updateParcel,
  deleteParcel,
  mapServerParcel,
  updateComplaintStatus,
  fetchAllAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  toggleAgentStatus,
  fetchAllCenters,
  createCenter,
  updateCenter,
  deleteCenter,
} from '../services/api';
import { STATUS_OPTIONS, getStatusBadge, getStatusIcon } from '../utils/statusHelpers';
import { calculatePrice, getServiceMeta } from '../utils/priceCalculator';
import AdminAgentAreaMap from '../components/maps/AdminAgentAreaMap';
import LocationAutocomplete from '../components/maps/LocationAutocomplete';
import PostOfficeAutocomplete from '../components/maps/PostOfficeAutocomplete';

const emptyForm = {
  senderName: '',
  senderEmail: '',
  senderPhone: '',
  receiverName: '',
  receiverPhone: '',
  sourceCity: '',
  sourcePincode: '',
  destinationCity: '',
  destinationPincode: '',
  serviceType: 'Speed Post',
  packageType: 'Document',
  pickupMode: 'Pickup',
  pickupDate: '',
  pickupSlot: '',
  weightKg: '',
  paymentMethod: 'Cash',
  codAmount: '',
  insurance: false,
  otpDelivery: false,
  notes: '',
  assignedAgent: '',
  postOfficeCenter: '',
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [parcels, setParcels] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [activeSection, setActiveSection] = useState('overview');

  const [showParcelForm, setShowParcelForm] = useState(false);
  const [editingParcel, setEditingParcel] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [centers, setCenters] = useState([]);
  const [centerForm, setCenterForm] = useState({ name: '', code: '', address: '', contact: '', serviceArea: '', city: '', pincode: '' });

  const [statusModal, setStatusModal] = useState(null);
  const [reportFilters, setReportFilters] = useState({ status: 'all', service: 'all', location: '', from: '', to: '' });
  const [pendingDelete, setPendingDelete] = useState(null);
  
  // Agent management state
  const [agents, setAgents] = useState([]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [agentForm, setAgentForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    agentId: '',
    assignedCity: '',
    assignedArea: '',
    postOffice: '',
    hub: '',
    vehicleType: 'Bike',
    licenseNumber: '',
    shiftTime: 'Full Day',
    status: 'Active',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadDashboard();
  }, [user, navigate]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [parcelRes, statsRes, complaintsRes, agentsRes, centersRes] = await Promise.allSettled([
        fetchAllParcels(),
        fetchAdminStats(),
        fetchComplaints(),
        fetchAllAgents(),
        fetchAllCenters(),
      ]);

      if (parcelRes.status === 'fulfilled') {
        setParcels(parcelRes.value.map(mapServerParcel));
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value?.totals || null);
      }
      if (complaintsRes.status === 'fulfilled') {
        setComplaints(complaintsRes.value);
      }
      if (agentsRes.status === 'fulfilled') {
        setAgents(agentsRes.value);
      }
      if (centersRes.status === 'fulfilled') {
        setCenters(centersRes.value);
      }
    } catch (error) {
      console.error('Dashboard load failed', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleCenterChange = (e) => {
    const { name, value } = e.target;
    setCenterForm((prev) => ({ ...prev, [name]: value }));
  };

  const addCenter = async () => {
    if (!centerForm.name || !centerForm.code) {
      alert('Center name and code are required');
      return;
    }
    setSaving(true);
    try {
      const result = await createCenter(centerForm);
      setCenterForm({ name: '', code: '', address: '', contact: '', serviceArea: '', city: '', pincode: '' });
      await loadDashboard();
      alert(result?.message || 'Center added successfully');
    } catch (error) {
      console.error('Error adding center:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to add center. Please check all fields and try again.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const removeCenter = async (id) => {
    if (!window.confirm('Are you sure you want to delete this center?')) {
      return;
    }
    setSaving(true);
    try {
      await deleteCenter(id);
      loadDashboard();
      alert('Center deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete center');
    } finally {
      setSaving(false);
    }
  };

  const openCreateForm = () => {
    setEditingParcel(null);
    setFormData(emptyForm);
    setShowParcelForm(true);
  };

  const openEditForm = (parcel) => {
    setEditingParcel(parcel);
    setFormData({
      senderName: parcel.senderName || '',
      senderEmail: parcel.senderEmail || '',
      senderPhone: parcel.senderPhone || '',
      receiverName: parcel.receiverName || '',
      receiverPhone: parcel.receiverPhone || '',
      sourceCity: parcel.sourceCity || '',
      sourcePincode: parcel.sourcePincode || '',
      destinationCity: parcel.destinationCity || '',
      destinationPincode: parcel.destinationPincode || '',
      serviceType: parcel.serviceType || 'Speed Post',
      packageType: parcel.packageType || 'Document',
      pickupMode: parcel.pickupMode || 'Pickup',
      pickupDate: parcel.pickupDate ? parcel.pickupDate.substring(0, 10) : '',
      pickupSlot: parcel.pickupSlot || '',
      weightKg: parcel.weightKg || '',
      paymentMethod: parcel.paymentMethod || 'Cash',
      codAmount: parcel.codAmount || '',
      insurance: parcel.insurance || false,
      otpDelivery: parcel.otpDelivery || false,
      notes: parcel.notes || '',
      assignedAgent: parcel.assignedAgent || '',
      postOfficeCenter: parcel.postOfficeCenter || '',
    });
    setShowParcelForm(true);
  };

  const handleSaveParcel = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      // Calculate price automatically
      const calculatedPrice = calculatePrice(formData);
      if (!calculatedPrice) {
        alert('Please enter weight to calculate price');
        setSaving(false);
        return;
      }
      
      const payload = {
        ...formData,
        weightKg: Number(formData.weightKg),
        costInr: calculatedPrice,
        codAmount: formData.codAmount ? Number(formData.codAmount) : undefined,
        // Ensure all required fields are present
        senderName: formData.senderName || '',
        receiverName: formData.receiverName || '',
        sourceCity: formData.sourceCity || '',
        destinationCity: formData.destinationCity || '',
      };
      
      if (editingParcel) {
        const result = await updateParcel(editingParcel.id, payload);
        alert(result?.message || 'Shipment updated successfully');
      } else {
        const res = await createParcel(payload);
        alert(
          `Shipment booked successfully!\nRequest ID: ${res.parcel?.requestId || 'N/A'}\nTracking ID: ${
            res.trackingId || 'N/A'
          }\n\nTracking ID has been sent to customer email if provided.`
        );
      }
      setShowParcelForm(false);
      setEditingParcel(null);
      setFormData(emptyForm);
      loadDashboard();
    } catch (error) {
      console.error('Error saving parcel:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to save shipment. Please check all fields and try again.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (parcelId, status, notes = '', proofUrl = '', pickupOtp = '') => {
    if (!parcelId || !status) {
      alert('Missing required information. Please try again.');
      return;
    }
    
    setSaving(true);
    try {
      const result = await updateParcelStatus(parcelId, status, notes, proofUrl, pickupOtp);
      alert(result?.message || 'Status updated successfully!');
      setStatusModal(null);
      await loadDashboard();
    } catch (error) {
      console.error('Error updating status:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      
      let errorMessage = 'Failed to update status. Please try again.';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Error in request setup
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteParcel = async () => {
    if (!pendingDelete) return;
    setSaving(true);
    try {
      await deleteParcel(pendingDelete.id);
      setPendingDelete(null);
      loadDashboard();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete shipment');
    } finally {
      setSaving(false);
    }
  };

  const handleComplaintStatus = async (complaint) => {
    const nextStatus = complaint.status === 'resolved' ? 'in_progress' : 'resolved';
    try {
      await updateComplaintStatus(complaint._id, { status: nextStatus });
      loadDashboard();
    } catch (error) {
      alert('Failed to update complaint');
    }
  };

  // Agent management functions
  const openAgentForm = () => {
    setEditingAgent(null);
    setAgentForm({
      fullName: '',
      mobile: '',
      email: '',
      agentId: '',
      assignedCity: '',
      assignedArea: '',
      postOffice: '',
      hub: '',
      vehicleType: 'Bike',
      licenseNumber: '',
      shiftTime: 'Full Day',
      status: 'Active',
    });
    setShowAgentForm(true);
  };

  const openEditAgentForm = (agent) => {
    setEditingAgent(agent);
    setAgentForm({
      fullName: agent.fullName || '',
      mobile: agent.mobile || '',
      email: agent.email || '',
      agentId: agent.agentId || '',
      assignedCity: agent.assignedCity || '',
      assignedArea: agent.assignedArea || '',
      postOffice: agent.postOffice || '',
      hub: agent.hub || '',
      vehicleType: agent.vehicleType || 'Bike',
      licenseNumber: agent.licenseNumber || '',
      shiftTime: agent.shiftTime || 'Full Day',
      status: agent.status || 'Active',
    });
    setShowAgentForm(true);
  };

  const handleAgentInputChange = (e) => {
    const { name, value } = e.target;
    setAgentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAgent = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = { ...agentForm };
      // Password is always auto-generated, never send it from frontend
      // Backend will auto-generate if not provided

      if (editingAgent) {
        // For editing, don't send password - backend will keep existing password
        await updateAgent(editingAgent._id, payload);
        alert('Agent updated successfully');
      } else {
        // For new agent, backend will auto-generate password
        const res = await createAgent(payload);
        alert(
          `Agent created successfully!\n\nAgent ID: ${res.agent.agentId}\nPassword: ${res.credentials.password}\n\nPlease share these credentials with the agent.`
        );
      }
      setShowAgentForm(false);
      setEditingAgent(null);
      loadDashboard();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save agent');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }
    setSaving(true);
    try {
      await deleteAgent(agentId);
      alert('Agent deleted successfully');
      loadDashboard();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete agent');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAgentStatus = async (agentId) => {
    setSaving(true);
    try {
      await toggleAgentStatus(agentId);
      loadDashboard();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update agent status');
    } finally {
      setSaving(false);
    }
  };

  const filteredParcels = useMemo(() => {
    return parcels.filter((parcel) => {
      const matchesSearch =
        (parcel.requestId && parcel.requestId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (parcel.trackingId && parcel.trackingId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        parcel.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parcel.receiverName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || parcel.status === statusFilter;
      const matchesService = serviceFilter === 'all' || parcel.serviceType === serviceFilter;

      const createdDate = parcel.createdAt ? new Date(parcel.createdAt) : null;
      const afterFrom = dateRange.from ? createdDate >= new Date(dateRange.from) : true;
      const beforeTo = dateRange.to ? createdDate <= new Date(dateRange.to) : true;

      return matchesSearch && matchesStatus && matchesService && afterFrom && beforeTo;
    });
  }, [parcels, searchTerm, statusFilter, serviceFilter, dateRange]);

  const reportRows = useMemo(() => {
    return filteredParcels.filter((parcel) => {
      const matchesStatus = reportFilters.status === 'all' || parcel.status === reportFilters.status;
      const matchesService = reportFilters.service === 'all' || parcel.serviceType === reportFilters.service;
      const matchesLocation =
        !reportFilters.location ||
        parcel.sourceCity?.toLowerCase().includes(reportFilters.location.toLowerCase()) ||
        parcel.destinationCity?.toLowerCase().includes(reportFilters.location.toLowerCase());
      const createdDate = parcel.createdAt ? new Date(parcel.createdAt) : null;
      const afterFrom = reportFilters.from ? createdDate >= new Date(reportFilters.from) : true;
      const beforeTo = reportFilters.to ? createdDate <= new Date(reportFilters.to) : true;
      return matchesStatus && matchesService && matchesLocation && afterFrom && beforeTo;
    });
  }, [filteredParcels, reportFilters]);

  const exportCsv = () => {
    const header = [
      'Parcel ID',
      'Tracking ID',
      'Sender',
      'Receiver',
      'Weight',
      'Service',
      'Status',
      'Pickup Mode',
      'Booking Date',
    ];
    const lines = reportRows.map((p) =>
      [
        p.requestId || '',
        p.trackingId || '',
        p.senderName || '',
        p.receiverName || '',
        p.weightKg || '',
        p.serviceType || '',
        p.status || '',
        p.pickupMode || '',
        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
      ].join(',')
    );
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admin-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const summary = {
    total: stats?.total ?? parcels.length,
    pending: stats?.pending ?? parcels.filter((p) => p.status === 'Pending Approval').length,
    transit: stats?.transit ?? parcels.filter((p) => p.status === 'In Transit').length,
    delivered: stats?.delivered ?? parcels.filter((p) => p.status === 'Delivered').length,
    cancelled:
      stats?.cancelled ?? parcels.filter((p) => ['Cancelled', 'Cancelled by User'].includes(p.status)).length,
    complaints: stats?.complaints ?? complaints.length,
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <Shield size={20} />
          <span>Dak Khana Admin</span>
        </div>
        <nav className="icon-nav">
          {[
            { key: 'overview', label: 'Dashboard', icon: BarChart3 },
            { key: 'parcels', label: 'Parcel Management', icon: Package },
            { key: 'agents', label: 'Delivery Agents', icon: Users },
            { key: 'agent-areas', label: 'Agent Areas', icon: MapPin },
            { key: 'pickup', label: 'Pickup Requests', icon: ClipboardList },
            { key: 'delivery', label: 'Delivery Status', icon: Truck },
            { key: 'reports', label: 'Reports', icon: FileText },
            { key: 'complaints', label: 'Complaints', icon: AlertCircle },
            { key: 'settings', label: 'Settings', icon: MapPin },
          ].map((item) => (
            <button
              key={item.key}
              className={`icon-nav-btn ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => setActiveSection(item.key)}
              title={item.label}
            >
              <item.icon size={20} />
              <span className="nav-tooltip">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="icon-nav-btn" onClick={() => navigate('/')} title="View Site">
            <Home size={20} />
            <span className="nav-tooltip">View Site</span>
          </button>
          <button className="icon-nav-btn danger" onClick={logout} title="Logout">
            <LogOut size={20} />
            <span className="nav-tooltip">Logout</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p className="eyebrow">India Post inspired admin</p>
            <h1>Welcome, {user.name}</h1>
          </div>
          <div className="header-actions">
            <button className="btn ghost" onClick={loadDashboard} disabled={loading}>
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="btn primary" onClick={openCreateForm}>
              <Plus size={16} />
              New Parcel
            </button>
          </div>
        </header>

        {activeSection === 'overview' && (
        <section className="card-grid">
          {[
            { label: 'Total Parcels', value: summary.total, icon: Package },
            { label: 'Pending Verifications', value: summary.pending, icon: Hourglass },
            { label: 'Parcels In Transit', value: summary.transit, icon: Truck },
            { label: 'Delivered Parcels', value: summary.delivered, icon: CheckCircle },
            { label: 'Cancelled Parcels', value: summary.cancelled, icon: XCircle },
            { label: 'Complaints Received', value: summary.complaints, icon: AlertCircle },
          ].map((card) => (
            <div className="stat-card" key={card.label}>
              <div className="stat-icon">
                <card.icon size={20} />
              </div>
              <div>
                <p className="eyebrow">{card.label}</p>
                <h3>{card.value}</h3>
              </div>
            </div>
          ))}
        </section>
        )}

        {activeSection === 'parcels' && (
        <section className="card panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Parcel Management</p>
              <h2>Bookings & approvals</h2>
            </div>
            <div className="filters">
              <div className="input-icon">
                <Search size={16} />
                <input
                  placeholder="Search parcel id / tracking / name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
                <option value="all">All services</option>
                <option>Speed Post</option>
                <option>Registered Post</option>
                <option>Parcel</option>
                <option>Logistics</option>
              </select>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
              />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
              />
            </div>
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Parcel ID</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Weight</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Pickup Mode</th>
                  <th>Booking Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.length === 0 && (
                  <tr>
                    <td colSpan="9" className="empty">
                      {loading ? 'Loading...' : 'No parcels found'}
                    </td>
                  </tr>
                )}
                {filteredParcels.map((parcel) => {
                  const StatusIcon = getStatusIcon(parcel.status);
                  return (
                    <tr key={parcel.id}>
                      <td>
                        <div className="mono">{parcel.requestId || 'N/A'}</div>
                        <small className="muted">Track: {parcel.trackingId || 'Pending'}</small>
                      </td>
                      <td>
                        <div className="strong">{parcel.senderName}</div>
                        <small className="muted">{parcel.sourceCity}</small>
                      </td>
                      <td>
                        <div className="strong">{parcel.receiverName}</div>
                        <small className="muted">{parcel.destinationCity}</small>
                      </td>
                      <td>{parcel.weightKg} kg</td>
                      <td>{parcel.serviceType}</td>
                      <td>
                        <span className={`chip ${getStatusBadge(parcel.status)}`}>
                          <StatusIcon size={14} />
                          {parcel.status}
                        </span>
                      </td>
                      <td>{parcel.pickupMode || 'Pickup'}</td>
                      <td>{parcel.createdAt ? new Date(parcel.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="actions">
                        <button className="icon-btn" title="View / Edit" onClick={() => openEditForm(parcel)}>
                          <Edit size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Update status"
                          onClick={() => setStatusModal(parcel)}
                        >
                          <ClipboardList size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          title="Approve"
                          onClick={() => handleStatusUpdate(parcel.id, 'Booked')}
                          disabled={parcel.status === 'Booked'}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          className="icon-btn danger"
                          title="Reject / Cancel"
                          onClick={() => handleStatusUpdate(parcel.id, 'Cancelled')}
                        >
                          <XCircle size={16} />
                        </button>
                        <button className="icon-btn danger" onClick={() => setPendingDelete(parcel)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {activeSection === 'agents' && (
          <section className="card panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Staff Management</p>
                <h2>Delivery Agents</h2>
              </div>
              <button className="btn primary" onClick={openAgentForm}>
                <Plus size={16} />
                Add Delivery Agent
              </button>
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Agent ID</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Assigned Area</th>
                    <th>Vehicle</th>
                    <th>Shift</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty">
                        {loading ? 'Loading...' : 'No agents found. Add your first delivery agent.'}
                      </td>
                    </tr>
                  )}
                  {agents.map((agent) => (
                    <tr key={agent._id}>
                      <td>
                        <div className="mono">{agent.agentId}</div>
                      </td>
                      <td>
                        <div className="strong">{agent.fullName}</div>
                        {agent.email && <small className="muted">{agent.email}</small>}
                      </td>
                      <td>{agent.mobile}</td>
                      <td>
                        <div>{agent.assignedCity || '-'}</div>
                        {agent.assignedArea && <small className="muted">{agent.assignedArea}</small>}
                      </td>
                      <td>{agent.vehicleType}</td>
                      <td>{agent.shiftTime}</td>
                      <td>
                        <span className={`chip ${agent.status === 'Active' ? 'success' : 'secondary'}`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="icon-btn" title="Edit" onClick={() => openEditAgentForm(agent)}>
                          <Edit size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          title={agent.status === 'Active' ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggleAgentStatus(agent._id)}
                        >
                          {agent.status === 'Active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button className="icon-btn danger" title="Delete" onClick={() => handleDeleteAgent(agent._id)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === 'agent-areas' && (
          <section className="card panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Zone Management</p>
                <h2>Agent Area Assignment</h2>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <AdminAgentAreaMap
                city="Delhi"
                onAreaClick={(area) => {
                  console.log('Area clicked:', area);
                }}
                onAgentAssign={(areaId, agentName) => {
                  console.log('Assigning agent:', agentName, 'to area:', areaId);
                  alert(`Agent ${agentName} assigned to area ${areaId}`);
                }}
              />
            </div>
          </section>
        )}

        {activeSection === 'pickup' && (
        <section className="card panel two-col">
          <div>
            <p className="eyebrow">Pickup Assignment</p>
            <h3>Assign to delivery agent</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Agent Name</label>
                <input
                  name="assignedAgent"
                  placeholder="Agent full name"
                  value={formData.assignedAgent}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-field">
                <label>Pickup Slot</label>
                <input
                  name="pickupSlot"
                  placeholder="e.g. 9-11 AM"
                  value={formData.pickupSlot}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-field">
                <label>Post Office Center</label>
                <PostOfficeAutocomplete
                  name="postOfficeCenter"
                  value={formData.postOfficeCenter}
                  onChange={handleInputChange}
                  placeholder="Search post office (e.g., type 'del' for Delhi)..."
                  className="form-control"
                />
              </div>
              <div className="form-field">
                <label>Pickup Mode</label>
                <select name="pickupMode" value={formData.pickupMode} onChange={handleInputChange}>
                  <option value="Pickup">Pickup</option>
                  <option value="Dropoff">Dropoff</option>
                </select>
              </div>
            </div>
            <p className="muted small">
              Save these fields inside the parcel edit form. Use edit action above to persist.
            </p>
          </div>
          <div>
            <p className="eyebrow">Post Office Centers</p>
            <h3>Manage servicing centers</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Center Name</label>
                <input name="name" value={centerForm.name} onChange={handleCenterChange} placeholder="e.g. Gurgaon West" />
              </div>
              <div className="form-field">
                <label>Code</label>
                <input name="code" value={centerForm.code} onChange={handleCenterChange} placeholder="GW-12" />
              </div>
              <div className="form-field">
                <label>Service Area</label>
                <input name="serviceArea" value={centerForm.serviceArea} onChange={handleCenterChange} placeholder="Locality / PINs" />
              </div>
              <div className="form-field">
                <label>Contact</label>
                <input name="contact" value={centerForm.contact} onChange={handleCenterChange} placeholder="Phone / email" />
              </div>
              <div className="form-field">
                <label>City</label>
                <LocationAutocomplete
                  name="city"
                  value={centerForm.city}
                  onChange={handleCenterChange}
                  placeholder="Enter city"
                  className="form-control"
                />
              </div>
              <div className="form-field">
                <label>Pincode</label>
                <input name="pincode" value={centerForm.pincode} onChange={handleCenterChange} placeholder="e.g. 110001" />
              </div>
              <div className="form-field full">
                <label>Address</label>
                <input name="address" value={centerForm.address} onChange={handleCenterChange} placeholder="Street, city" />
              </div>
            </div>
            <div className="complaint-actions">
              <button className="btn primary" type="button" onClick={addCenter}>
                Add Center
              </button>
            </div>
            <div className="info-card">
              {centers.length === 0 && <p className="muted">No centers added yet.</p>}
              {centers.map((center) => (
                <div key={center._id || center.code} className="center-row">
                  <div>
                    <p className="strong">
                      {center.name} ({center.code})
                    </p>
                    <small className="muted">
                      {center.address} • {center.serviceArea}
                    </small>
                    <div className="muted small">{center.contact}</div>
                  </div>
                  <button className="icon-btn danger" onClick={() => removeCenter(center._id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {activeSection === 'reports' && (
        <section className="card panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Reports</p>
              <h2>Filters & exports</h2>
            </div>
            <div className="filters">
              <select
                value={reportFilters.status}
                onChange={(e) => setReportFilters((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="all">Status: All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={reportFilters.service}
                onChange={(e) => setReportFilters((p) => ({ ...p, service: e.target.value }))}
              >
                <option value="all">Service: All</option>
                <option>Speed Post</option>
                <option>Registered Post</option>
                <option>Parcel</option>
                <option>Logistics</option>
              </select>
              <input
                placeholder="Location filter"
                value={reportFilters.location}
                onChange={(e) => setReportFilters((p) => ({ ...p, location: e.target.value }))}
              />
              <input
                type="date"
                value={reportFilters.from}
                onChange={(e) => setReportFilters((p) => ({ ...p, from: e.target.value }))}
              />
              <input
                type="date"
                value={reportFilters.to}
                onChange={(e) => setReportFilters((p) => ({ ...p, to: e.target.value }))}
              />
              <button className="btn ghost" onClick={exportCsv} disabled={reportRows.length === 0}>
                <FileText size={16} />
                Export CSV
              </button>
            </div>
          </div>
          <div className="table-wrap small">
            <table className="admin-table compact">
              <thead>
                <tr>
                  <th>Parcel</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Weight</th>
                  <th>Service</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty">
                      No rows match filters
                    </td>
                  </tr>
                )}
                {reportRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="strong">{row.trackingId || 'Pending'}</div>
                      <small className="muted">{row.requestId}</small>
                    </td>
                    <td>
                      {row.sourceCity} → {row.destinationCity}
                    </td>
                    <td>{row.status}</td>
                    <td>{row.weightKg} kg</td>
                    <td>{row.serviceType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {activeSection === 'delivery' && (
          <section className="card panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Delivery Status</p>
                <h2>Track delivery status</h2>
              </div>
            </div>
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Parcel ID</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Status</th>
                    <th>Pickup Mode</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParcels.filter(p => p.status !== 'Delivered' && p.status !== 'Cancelled').length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty">
                        No active deliveries
                      </td>
                    </tr>
                  )}
                  {filteredParcels.filter(p => p.status !== 'Delivered' && p.status !== 'Cancelled').map((parcel) => {
                    const StatusIcon = getStatusIcon(parcel.status);
                    return (
                      <tr key={parcel.id}>
                        <td>
                          <div className="mono">{parcel.requestId || 'N/A'}</div>
                          <small className="muted">Track: {parcel.trackingId || 'Pending'}</small>
                        </td>
                        <td>
                          <div className="strong">{parcel.senderName}</div>
                          <small className="muted">{parcel.sourceCity}</small>
                        </td>
                        <td>
                          <div className="strong">{parcel.receiverName}</div>
                          <small className="muted">{parcel.destinationCity}</small>
                        </td>
                        <td>
                          <span className={`chip ${getStatusBadge(parcel.status)}`}>
                            <StatusIcon size={14} />
                            {parcel.status}
                          </span>
                        </td>
                        <td>{parcel.pickupMode || 'Pickup'}</td>
                        <td className="actions">
                          <button className="icon-btn" title="Update status" onClick={() => setStatusModal(parcel)}>
                            <ClipboardList size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === 'settings' && (
          <section className="card panel two-col">
            <div>
              <p className="eyebrow">Post Office Centers</p>
              <h3>Manage servicing centers</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Center Name</label>
                  <input name="name" value={centerForm.name} onChange={handleCenterChange} placeholder="e.g. Gurgaon West" />
                </div>
                <div className="form-field">
                  <label>Code</label>
                  <input name="code" value={centerForm.code} onChange={handleCenterChange} placeholder="GW-12" />
                </div>
                <div className="form-field">
                  <label>Service Area</label>
                  <input name="serviceArea" value={centerForm.serviceArea} onChange={handleCenterChange} placeholder="Locality / PINs" />
                </div>
                <div className="form-field">
                  <label>Contact</label>
                  <input name="contact" value={centerForm.contact} onChange={handleCenterChange} placeholder="Phone / email" />
                </div>
                <div className="form-field full">
                  <label>Address</label>
                  <input name="address" value={centerForm.address} onChange={handleCenterChange} placeholder="Street, city" />
                </div>
              </div>
              <div className="complaint-actions">
                <button className="btn primary" type="button" onClick={addCenter}>
                  Add Center
                </button>
              </div>
              <div className="info-card">
                {centers.length === 0 && <p className="muted">No centers added yet.</p>}
                {centers.map((center) => (
                  <div key={center.code} className="center-row">
                    <div>
                      <p className="strong">
                        {center.name} ({center.code})
                      </p>
                      <small className="muted">
                        {center.address} • {center.serviceArea}
                      </small>
                      <div className="muted small">{center.contact}</div>
                    </div>
                    <button className="icon-btn danger" onClick={() => removeCenter(center.code)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'complaints' && (
          <section className="card panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Complaints</p>
                <h2>Customer complaints & replies</h2>
              </div>
            </div>
            <div className="complaints">
              {complaints.length === 0 && <p className="muted">No complaints yet.</p>}
              {complaints.map((c) => (
                <div key={c._id} className="complaint-card">
                  <div className="complaint-header">
                    <div>
                      <p className="strong">{c.subject}</p>
                      <small className="muted">
                        {c.name} • {c.email} • {new Date(c.createdAt).toLocaleString()}
                      </small>
                    </div>
                    <span className={`chip ${c.status === 'resolved' ? 'bg-success' : 'bg-warning'}`}>
                      {c.status || 'new'}
                    </span>
                  </div>
                  <p className="muted">{c.message}</p>
                  <div className="complaint-actions">
                    <button className="btn ghost" onClick={() => handleComplaintStatus(c)}>
                      {c.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
                    </button>
                    <a className="btn ghost" href={`mailto:${c.email}?subject=Re: ${c.subject}`}>
                      <Mail size={14} />
                      Reply via email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {showParcelForm && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Parcel form</p>
                <h3>{editingParcel ? 'Edit parcel' : 'Book new parcel'}</h3>
              </div>
              <button className="icon-btn" onClick={() => setShowParcelForm(false)}>
                <XCircle size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveParcel} className="form-grid two-col">
                <div className="section-title">Sender Information</div>
                <div className="section-title">Receiver Information</div>

              <div className="form-field">
                <label>Sender Name</label>
                <input name="senderName" value={formData.senderName} onChange={handleInputChange} required />
              </div>
              <div className="form-field">
                <label>Receiver Name</label>
                <input name="receiverName" value={formData.receiverName} onChange={handleInputChange} required />
              </div>

              <div className="form-field">
                <label>Sender Email</label>
                <input
                  type="email"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>Receiver Phone</label>
                <input name="receiverPhone" value={formData.receiverPhone} onChange={handleInputChange} required />
              </div>

              <div className="form-field">
                <label>Sender Phone</label>
                <input name="senderPhone" value={formData.senderPhone} onChange={handleInputChange} required />
              </div>
              <div className="form-field">
                <label>Pickup Mode</label>
                <select name="pickupMode" value={formData.pickupMode} onChange={handleInputChange}>
                  <option value="Pickup">Pickup</option>
                  <option value="Dropoff">Dropoff</option>
                </select>
              </div>

              <div className="section-title">Parcel Details</div>
              <div className="section-title">Assignment</div>

              <div className="form-field">
                <label>Source City</label>
                <LocationAutocomplete
                  name="sourceCity"
                  value={formData.sourceCity}
                  onChange={handleInputChange}
                  placeholder="Enter source city"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-field">
                <label>Source Pincode</label>
                <input
                  name="sourcePincode"
                  value={formData.sourcePincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 110001"
                />
              </div>

              <div className="form-field">
                <label>Destination City</label>
                <LocationAutocomplete
                  name="destinationCity"
                  value={formData.destinationCity}
                  onChange={handleInputChange}
                  placeholder="Enter destination city"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-field">
                <label>Destination Pincode</label>
                <input
                  name="destinationPincode"
                  value={formData.destinationPincode}
                  onChange={handleInputChange}
                  placeholder="e.g. 400001"
                />
              </div>

              <div className="form-field">
                <label>Assigned Agent</label>
                <select
                  name="assignedAgent"
                  value={formData.assignedAgent}
                  onChange={handleInputChange}
                >
                  <option value="">Select Agent</option>
                  {agents.filter(a => a.status === 'Active').map((agent) => (
                    <option key={agent._id} value={agent.fullName}>
                      {agent.fullName} ({agent.agentId}) - {agent.assignedCity || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Post Office Center</label>
                <PostOfficeAutocomplete
                  name="postOfficeCenter"
                  value={formData.postOfficeCenter}
                  onChange={handleInputChange}
                  placeholder="Search post office (e.g., type 'del' for Delhi)..."
                  className="form-control"
                />
                <small className="muted">Type to search and select from available centers</small>
              </div>

              <div className="form-field">
                <label>Service Type</label>
                <select name="serviceType" value={formData.serviceType} onChange={handleInputChange}>
                  <option>Speed Post</option>
                  <option>Registered Post</option>
                  <option>Parcel</option>
                  <option>Logistics</option>
                </select>
              </div>
              <div className="form-field">
                <label>Pickup Slot</label>
                <input
                  name="pickupSlot"
                  placeholder="9-11 AM"
                  value={formData.pickupSlot}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-field">
                <label>Package Type</label>
                <select name="packageType" value={formData.packageType} onChange={handleInputChange}>
                  <option>Document</option>
                  <option>Box</option>
                  <option>Fragile</option>
                  <option>High Value</option>
                </select>
              </div>
              <div className="form-field">
                <label>Pickup Date</label>
                <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleInputChange} />
              </div>

              <div className="form-field">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  name="weightKg"
                  value={formData.weightKg}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-field">
                <label>COD Amount (₹) - Optional</label>
                <input
                  type="number"
                  min="0"
                  name="codAmount"
                  value={formData.codAmount}
                  onChange={handleInputChange}
                  placeholder="Enter COD amount if applicable"
                />
              </div>

              <div className="form-field">
                <label>Optional Services</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="insurance"
                      checked={formData.insurance}
                      onChange={handleInputChange}
                    />
                    <span>Insurance (1% of parcel value)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="otpDelivery"
                      checked={formData.otpDelivery}
                      onChange={handleInputChange}
                    />
                    <span>OTP Delivery (₹20 extra)</span>
                  </label>
                </div>
              </div>

              {/* Price Display - Read Only */}
              {calculatePrice(formData) && (
                <div className="form-field full">
                  <div style={{ background: '#f9e5e8', padding: '12px', borderRadius: '8px', border: '1px solid #f2c7ce' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <strong style={{ color: '#7a0f1c' }}>Total Price</strong>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7a0f1c', marginBottom: '4px' }}>
                      ₹{calculatePrice(formData)}
                    </div>
                    <small style={{ color: '#6b7280' }}>
                      Includes: Base + Weight + Zone + Optional services
                    </small>
                  </div>
                </div>
              )}

              <div className="form-field">
                <label>Payment Method</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Net Banking</option>
                </select>
              </div>
              <div className="form-field full">
                <label>Notes</label>
                <textarea
                  rows="3"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Special instructions"
                />
              </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn ghost" type="button" onClick={() => setShowParcelForm(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn primary" type="submit" onClick={handleSaveParcel} disabled={saving}>
                {saving ? 'Saving...' : editingParcel ? 'Update Parcel' : 'Book Parcel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {statusModal && (
        <div className="modal-backdrop">
          <div className="modal-card narrow">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Update status</p>
                <h3>{statusModal.trackingId || statusModal.requestId}</h3>
              </div>
              <button className="icon-btn" onClick={() => setStatusModal(null)}>
                <XCircle size={18} />
              </button>
            </div>
            <div className="status-grid">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  className={`status-btn ${statusModal.status === status ? 'active' : ''}`}
                  onClick={() => handleStatusUpdate(statusModal.id, status)}
                  disabled={saving}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="modal-backdrop">
          <div className="modal-card narrow">
            <div className="modal-header">
              <h3>Delete parcel</h3>
              <button className="icon-btn" onClick={() => setPendingDelete(null)}>
                <XCircle size={18} />
              </button>
            </div>
            <p className="muted">
              Are you sure you want to delete parcel {pendingDelete.trackingId || pendingDelete.requestId}?
            </p>
            <div className="modal-footer">
              <button className="btn ghost" onClick={() => setPendingDelete(null)} disabled={saving}>
                Cancel
              </button>
              <button className="btn danger" onClick={handleDeleteParcel} disabled={saving}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAgentForm && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Delivery Agent</p>
                <h3>{editingAgent ? 'Edit Agent' : 'Add New Delivery Agent'}</h3>
              </div>
              <button className="icon-btn" onClick={() => setShowAgentForm(false)}>
                <XCircle size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveAgent} className="form-grid two-col">
                <div className="section-title">Basic Details</div>
                <div className="section-title">Work Details</div>

                <div className="form-field">
                  <label>Full Name *</label>
                  <input
                    name="fullName"
                    value={agentForm.fullName}
                    onChange={handleAgentInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Assigned City</label>
                  <input
                    name="assignedCity"
                    value={agentForm.assignedCity}
                    onChange={handleAgentInputChange}
                    placeholder="e.g. Delhi"
                  />
                </div>

                <div className="form-field">
                  <label>Mobile Number *</label>
                  <input
                    name="mobile"
                    value={agentForm.mobile}
                    onChange={handleAgentInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Assigned Area</label>
                  <input
                    name="assignedArea"
                    value={agentForm.assignedArea}
                    onChange={handleAgentInputChange}
                    placeholder="e.g. Connaught Place"
                  />
                </div>

                <div className="form-field">
                  <label>Email ID *</label>
                  <input
                    type="email"
                    name="email"
                    value={agentForm.email}
                    onChange={handleAgentInputChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Post Office / Hub</label>
                  <input
                    name="postOffice"
                    value={agentForm.postOffice}
                    onChange={handleAgentInputChange}
                    placeholder="Post office name"
                  />
                </div>

                <div className="form-field">
                  {/* <label>Agent ID {!editingAgent && '(Auto-generated if empty)'}</label> */}
                  {/* <input
                    name="agentId"
                    value={agentForm.agentId}
                    onChange={handleAgentInputChange}
                    placeholder="Leave empty for auto-generation"
                    disabled={!!editingAgent}
                  /> */}
                </div>
                {/* <div className="form-field">
                  <label>Hub</label>
                  <input
                    name="hub"
                    value={agentForm.hub}
                    onChange={handleAgentInputChange}
                    placeholder="Hub name"
                  />
                </div> */}

                {!editingAgent && (
                  <div className="form-field full">
                    <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                      <small style={{ color: '#0369a1', fontWeight: '600' }}>
                        ℹ️ Password will be auto-generated and shown after agent creation
                      </small>
                    </div>
                  </div>
                )}

                <div className="form-field">
                  <label>Vehicle Type</label>
                  <select name="vehicleType" value={agentForm.vehicleType} onChange={handleAgentInputChange}>
                    <option>Bike</option>
                    <option>Cycle</option>
                    <option>Van</option>
                    <option>Car</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="section-title">Additional Information</div>
                <div className="section-title">Account Settings</div>

                <div className="form-field">
                  <label>License Number</label>
                  <input
                    name="licenseNumber"
                    value={agentForm.licenseNumber}
                    onChange={handleAgentInputChange}
                    placeholder="Optional"
                  />
                </div>
                <div className="form-field">
                  <label>Shift Time</label>
                  <select name="shiftTime" value={agentForm.shiftTime} onChange={handleAgentInputChange}>
                    <option>Morning</option>
                    <option>Evening</option>
                    <option>Full Day</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select name="status" value={agentForm.status} onChange={handleAgentInputChange}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn ghost" type="button" onClick={() => setShowAgentForm(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn primary" type="submit" onClick={handleSaveAgent} disabled={saving}>
                {saving ? 'Saving...' : editingAgent ? 'Update Agent' : 'Create Agent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
