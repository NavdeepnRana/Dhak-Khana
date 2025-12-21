import axios from 'axios';
import { getStatusBadge } from '../utils/statusHelpers';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dakkhana_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerCustomer = async (payload) => {
  const { data } = await api.post('/auth/customers/register', payload);
  return data;
};

export const loginCustomer = async (payload) => {
  if (payload.loginType === 'otp') {
    const { data } = await api.post('/auth/customers/login/otp', payload);
    return data;
  }
  const { data } = await api.post('/auth/customers/login', payload);
  return data;
};

export const sendOTP = async (payload) => {
  const { data } = await api.post('/auth/otp/send', payload);
  return data;
};

export const verifyOTP = async (payload) => {
  const { data } = await api.post('/auth/otp/verify', payload);
  return data;
};

export const fetchProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data.user;
};

export const fetchSiteContent = async () => {
  const { data } = await api.get('/info/all');
  return data;
};

export const fetchRateChart = async () => {
  const { data } = await api.get('/info/rates');
  return data.rateChart;
};

export const fetchCustomerParcels = async () => {
  const { data } = await api.get('/parcels/mine');
  return data;
};

export const fetchAssignedParcels = async (options = {}) => {
  const params = new URLSearchParams();
  if (options.today) params.append('today', 'true');
  if (options.agent) params.append('agent', options.agent);
  if (options.pickupOnly) params.append('pickupOnly', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';
  const { data } = await api.get(`/parcels/assigned${query}`);
  return data;
};

export const createParcel = async (payload) => {
  const { data } = await api.post('/parcels', payload);
  return data; // Returns { message, parcel, trackingId }
};

export const createBookingRequest = async (payload) => {
  const { data } = await api.post('/parcels/request', payload);
  return data; // Returns { message, parcel, trackingId }
};

export const trackParcel = async (trackingId) => {
  const { data } = await api.get(`/parcels/track/${trackingId}`);
  return data.parcel;
};

export const fetchCustomerStats = async () => {
  const { data } = await api.get('/dashboard/customer');
  return data;
};

export const submitFeedback = async (payload) => {
  const { data } = await api.post('/feedback', payload);
  return data;
};

// Admin APIs
export const loginAdmin = async (payload) => {
  const { data } = await api.post('/auth/admin/login', payload);
  return data;
};

export const fetchAllParcels = async () => {
  const { data } = await api.get('/parcels');
  return data;
};

export const fetchAdminStats = async () => {
  const { data } = await api.get('/dashboard/admin');
  return data;
};

export const fetchComplaints = async () => {
  const { data } = await api.get('/feedback/all');
  return data.feedbacks || [];
};

export const updateComplaintStatus = async (id, payload) => {
  const { data } = await api.patch(`/feedback/${id}/status`, payload);
  return data;
};

// Agent APIs
export const loginAgent = async (payload) => {
  const { data } = await api.post('/agents/login', payload);
  return data;
};

export const fetchAllAgents = async () => {
  const { data } = await api.get('/agents');
  return data;
};

export const fetchAgent = async (id) => {
  const { data } = await api.get(`/agents/${id}`);
  return data;
};

export const createAgent = async (payload) => {
  const { data } = await api.post('/agents', payload);
  return data;
};

export const updateAgent = async (id, payload) => {
  const { data } = await api.put(`/agents/${id}`, payload);
  return data;
};

export const deleteAgent = async (id) => {
  const { data } = await api.delete(`/agents/${id}`);
  return data;
};

export const toggleAgentStatus = async (id) => {
  const { data } = await api.patch(`/agents/${id}/toggle-status`);
  return data;
};

export const updateParcelStatus = async (id, status, notes = '', proofUrl = '', pickupOtp = '') => {
  const payload = { status };
  if (notes) payload.notes = notes;
  if (proofUrl) payload.proofUrl = proofUrl;
  if (pickupOtp) payload.pickupOtp = pickupOtp;
  
  const { data } = await api.patch(`/parcels/${id}/status`, payload);
  return data;
};

export const updateParcel = async (id, payload) => {
  const { data } = await api.put(`/parcels/${id}`, payload);
  return data;
};

export const deleteParcel = async (id) => {
  const { data } = await api.delete(`/parcels/${id}`);
  return data;
};

export const cancelBookingRequest = async (id) => {
  const { data } = await api.patch(`/parcels/${id}/cancel`);
  return data;
};

// Post Office Center APIs
export const fetchAllCenters = async () => {
  const { data } = await api.get('/centers');
  return data;
};

export const searchCenters = async (query) => {
  const { data } = await api.get(`/centers/search?q=${encodeURIComponent(query)}`);
  return data;
};

export const createCenter = async (payload) => {
  const { data } = await api.post('/centers', payload);
  return data;
};

export const updateCenter = async (id, payload) => {
  const { data } = await api.put(`/centers/${id}`, payload);
  return data;
};

export const deleteCenter = async (id) => {
  const { data } = await api.delete(`/centers/${id}`);
  return data;
};

export function mapServerParcel(parcel) {
  return {
    id: parcel._id,
    requestId: parcel.requestId,
    trackingId: parcel.trackingId,
    senderName: parcel.senderName,
    receiverName: parcel.receiverName,
    sourceCity: parcel.sourceCity,
    destinationCity: parcel.destinationCity,
    weightKg: parcel.weightKg,
    costInr: parcel.costInr,
    status: parcel.status,
    serviceType: parcel.serviceType,
    packageType: parcel.packageType,
    pickupMode: parcel.pickupMode,
    assignedAgent: parcel.assignedAgent,
    postOfficeCenter: parcel.postOfficeCenter,
    expectedDelivery: parcel.expectedDelivery,
    pickupDate: parcel.pickupDate,
    pickupSlot: parcel.pickupSlot,
    paymentMethod: parcel.paymentMethod,
    createdAt: parcel.createdAt,
    proofUrl: parcel.proofUrl,
    owner: parcel.owner,
    badgeClass: getStatusBadge(parcel.status),
  };
}



