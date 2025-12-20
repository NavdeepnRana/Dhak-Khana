const services = [
  {
    id: 'speed-post',
    title: 'Speed Post',
    description: 'Nationwide express service with end-to-end online tracking and doorstep pickup.',
    icon: 'zap',
    turnaround: '1-3 days',
    basePrice: 60,
    pricePerKg: 40,
    maxWeight: 35,
    weightUnit: 'kg',
  },
  {
    id: 'registered-post',
    title: 'Registered Post',
    description: 'Secure delivery with recipient signature, legal admissibility, and indemnity coverage.',
    icon: 'shield',
    turnaround: '3-5 days',
    basePrice: 45,
    pricePerKg: 25,
    maxWeight: 4,
    weightUnit: 'kg',
  },
  {
    id: 'parcel',
    title: 'Insured Parcel',
    description: 'Ship gifts, merchandise, or samples with optional insurance up to ₹5 lakh.',
    icon: 'package',
    turnaround: '4-7 days',
    basePrice: 70,
    pricePerKg: 50,
    maxWeight: 20,
    weightUnit: 'kg',
  },
  {
    id: 'export-ems',
    title: 'Export EMS',
    description: 'Express Mail Service for international shipments with customs clearance support.',
    icon: 'package',
    turnaround: '5-10 days',
    basePrice: 500,
    pricePerKg: 200,
    maxWeight: 30,
    weightUnit: 'kg',
  },
  {
    id: 'airmail',
    title: 'Airmail',
    description: 'International airmail service for documents and small parcels worldwide.',
    icon: 'package',
    turnaround: '7-15 days',
    basePrice: 300,
    pricePerKg: 150,
    maxWeight: 2,
    weightUnit: 'kg',
  },
  {
    id: 'savings',
    title: 'Savings & Investments',
    description: 'Recurring deposits, NSC, KVP, PPF, Sukanya Samriddhi, and senior citizen schemes.',
    icon: 'wallet',
    turnaround: 'Same day',
  },
  {
    id: 'insurance',
    title: 'Postal Life Insurance',
    description: 'PLI & RPLI plans with low premiums, high bonuses, and government guarantee.',
    icon: 'umbrella',
    turnaround: 'Policy issuance in 5 days',
  },
  {
    id: 'philately',
    title: 'Philately Store',
    description: 'Buy commemorative stamps, first-day covers, and postal heritage collectibles.',
    icon: 'stamp',
    turnaround: 'Shipping within 48 hours',
  },
];

const offices = [
  {
    id: 'delhi-gpo',
    name: 'New Delhi GPO',
    address: 'Sansad Marg, New Delhi - 110001',
    contact: '011-23096044',
    lat: 28.6304,
    lng: 77.2197,
    timings: 'Mon-Sat, 9:00 AM - 8:00 PM',
  },
  {
    id: 'mumbai-gpo',
    name: 'Mumbai GPO',
    address: 'DN Road, Fort, Mumbai - 400001',
    contact: '022-22620067',
    lat: 18.9398,
    lng: 72.8355,
    timings: 'Mon-Sat, 9:00 AM - 8:00 PM',
  },
  {
    id: 'kolkata-gpo',
    name: 'Kolkata GPO',
    address: 'BBD Bagh, Kolkata - 700001',
    contact: '033-22313933',
    lat: 22.5707,
    lng: 88.3473,
    timings: 'Mon-Sat, 9:00 AM - 8:00 PM',
  },
  {
    id: 'bangalore-hpo',
    name: 'Bengaluru Head Post Office',
    address: 'Raj Bhavan Rd, Bengaluru - 560001',
    contact: '080-22861632',
    lat: 12.9784,
    lng: 77.5895,
    timings: 'Mon-Sat, 9:00 AM - 8:00 PM',
  },
];

const announcements = [
  {
    id: 1,
    title: 'Savings Interest Revision',
    body: 'Post Office RD interest increased to 6.7% p.a. w.e.f 1 Jan.',
    tag: 'Finance',
  },
  {
    id: 2,
    title: 'Speed Post Cut-Off',
    body: 'Same-day dispatch guaranteed for bookings before 3:00 PM.',
    tag: 'Logistics',
  },
  {
    id: 3,
    title: 'PLI Mega Drive',
    body: '10% extra bonus for policies enrolled before March 31.',
    tag: 'Insurance',
  },
  {
    id: 4,
    title: 'Ayushman Bharat Cards',
    body: 'Apply at 3000+ CSC-enabled post offices nationwide.',
    tag: 'Citizen Services',
  },
];

const rateChart = [
  { zone: 'Local', upto1kg: 45, additionalPerKg: 25, avgDays: 2 },
  { zone: 'Metro', upto1kg: 60, additionalPerKg: 35, avgDays: 3 },
  { zone: 'Rest of India', upto1kg: 75, additionalPerKg: 45, avgDays: 5 },
];

module.exports = { services, offices, announcements, rateChart };

