const Parcel = require('../models/Parcel');
const Feedback = require('../models/Feedback');

const statusFilters = (ownerId) => ({
  total: ownerId ? { owner: ownerId } : {},
  pending: ownerId ? { owner: ownerId, status: 'Pending Approval' } : { status: 'Pending Approval' },
  booked: ownerId ? { owner: ownerId, status: 'Booked' } : { status: 'Booked' },
  transit: ownerId ? { owner: ownerId, status: 'In Transit' } : { status: 'In Transit' },
  delivered: ownerId ? { owner: ownerId, status: 'Delivered' } : { status: 'Delivered' },
});

async function getAdminStats(req, res) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [total, pending, booked, transit, outForDelivery, delivered, returned, failed, cancelled, todayBookings, recentParcels, complaints] = await Promise.all([
    Parcel.countDocuments(),
    Parcel.countDocuments({ status: 'Pending Approval' }),
    Parcel.countDocuments({ status: 'Booked' }),
    Parcel.countDocuments({ status: 'In Transit' }),
    Parcel.countDocuments({ status: 'Out for Delivery' }),
    Parcel.countDocuments({ status: 'Delivered' }),
    Parcel.countDocuments({ status: 'Returned' }),
    Parcel.countDocuments({ status: 'Failed Attempt' }),
    Parcel.countDocuments({ status: { $in: ['Cancelled', 'Cancelled by User'] } }),
    Parcel.countDocuments({ createdAt: { $gte: today } }),
    Parcel.find().sort({ createdAt: -1 }).limit(5),
    Feedback.countDocuments(),
  ]);

  res.json({
    totals: { total, pending, booked, transit, outForDelivery, delivered, returned, failed, cancelled, todayBookings, complaints },
    recentParcels,
  });
}

async function getCustomerStats(req, res) {
  const ownerId = req.user.id;
  const filters = statusFilters(ownerId);

  const [total, pending, booked, transit, delivered, recentParcels] = await Promise.all([
    Parcel.countDocuments(filters.total),
    Parcel.countDocuments(filters.pending),
    Parcel.countDocuments(filters.booked),
    Parcel.countDocuments(filters.transit),
    Parcel.countDocuments(filters.delivered),
    Parcel.find({ owner: ownerId }).sort({ createdAt: -1 }).limit(5),
  ]);

  res.json({
    totals: { total, pending, booked, transit, delivered },
    recentParcels,
  });
}

module.exports = { getAdminStats, getCustomerStats };

