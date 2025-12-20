const { announcements, offices, rateChart, services } = require('../data/siteContent');

function getServices(req, res) {
  res.json({ services });
}

function getOffices(req, res) {
  res.json({ offices });
}

function getAnnouncements(req, res) {
  res.json({ announcements });
}

function getRateChart(req, res) {
  res.json({ rateChart });
}

function getSiteContent(req, res) {
  res.json({ services, offices, announcements, rateChart });
}

module.exports = { getServices, getOffices, getAnnouncements, getRateChart, getSiteContent };

