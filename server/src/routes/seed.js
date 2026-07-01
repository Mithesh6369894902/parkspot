const router = require('express').Router();
const User = require('../models/User');
const Land = require('../models/Land');

router.get('/', async (req, res) => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return res.json({ message: 'Database already seeded', users: existingUsers });
    }

    const admin = await User.create({
      name: 'Admin User', email: 'admin@parkspot.in', password: 'admin123',
      phone: '9999900000', role: 'admin', isVerified: true,
    });

    const owner1 = await User.create({
      name: 'Rajesh Kumar', email: 'rajesh@parkspot.in', password: 'owner123',
      phone: '9876543210', role: 'owner', isVerified: true,
    });

    const owner2 = await User.create({
      name: 'Priya Patel', email: 'priya@parkspot.in', password: 'owner123',
      phone: '9876543211', role: 'owner', isVerified: true,
    });

    const customer = await User.create({
      name: 'Amit Singh', email: 'amit@parkspot.in', password: 'customer123',
      phone: '9876543212', role: 'customer', isVerified: true,
    });

    const lands = [
      {
        owner: owner1._id, title: 'Green Field Parking - Connaught Place',
        description: 'Large open ground near Connaught Place, perfect for events and conferences. Well-connected by metro.',
        location: { type: 'Point', coordinates: [77.2167, 28.6315], address: 'Block A, Near CP Metro', city: 'New Delhi', state: 'Delhi' },
        boundary: [[77.2160, 28.6310], [77.2175, 28.6310], [77.2175, 28.6320], [77.2160, 28.6320]],
        areaSqFt: 15000, totalSpots: 150, twoWheelerSpots: 90, fourWheelerSpots: 60,
        pricePerHour: 80, amenities: ['Lighting', 'Security Guard', 'CCTV', 'Paved Surface'],
        status: 'approved', isAvailable: true,
      },
      {
        owner: owner1._id, title: 'Open Ground - Sector 62 Noida',
        description: 'Vacant plot near IT park, ideal for corporate events and tech conferences.',
        location: { type: 'Point', coordinates: [77.3620, 28.6275], address: 'Plot 45, Sector 62', city: 'Noida', state: 'Uttar Pradesh' },
        boundary: [[77.3615, 28.6270], [77.3625, 28.6270], [77.3625, 28.6280], [77.3615, 28.6280]],
        areaSqFt: 20000, totalSpots: 200, twoWheelerSpots: 120, fourWheelerSpots: 80,
        pricePerHour: 60, amenities: ['Lighting', '24/7 Access', 'Paved Surface'],
        status: 'approved', isAvailable: true,
      },
      {
        owner: owner2._id, title: 'Marriage Garden Parking - Jaipur',
        description: 'Adjacent to wedding venues in Malviya Nagar. Easy access for guests.',
        location: { type: 'Point', coordinates: [75.7873, 26.9124], address: 'Malviya Nagar, Near WTP', city: 'Jaipur', state: 'Rajasthan' },
        boundary: [[75.7870, 26.9120], [75.7880, 26.9120], [75.7880, 26.9130], [75.7870, 26.9130]],
        areaSqFt: 12000, totalSpots: 120, twoWheelerSpots: 72, fourWheelerSpots: 48,
        pricePerHour: 50, amenities: ['Covered', 'Lighting', 'Security Guard', 'Guarded Entry'],
        status: 'approved', isAvailable: true,
      },
      {
        owner: owner2._id, title: 'Event Ground - HSR Layout Bangalore',
        description: 'Open area near HSR Layout, close to multiple event venues and restaurants.',
        location: { type: 'Point', coordinates: [77.6410, 12.9116], address: '27th Main, HSR Layout', city: 'Bangalore', state: 'Karnataka' },
        boundary: [[77.6405, 12.9110], [77.6415, 12.9110], [77.6415, 12.9122], [77.6405, 12.9122]],
        areaSqFt: 18000, totalSpots: 180, twoWheelerSpots: 108, fourWheelerSpots: 72,
        pricePerHour: 70, amenities: ['Lighting', 'Security Guard', 'CCTV', '24/7 Access', 'Paved Surface'],
        status: 'approved', isAvailable: true,
      },
    ];

    await Land.insertMany(lands);

    res.json({
      message: 'Database seeded successfully!',
      accounts: {
        admin: 'admin@parkspot.in / admin123',
        owner: 'rajesh@parkspot.in / owner123',
        customer: 'amit@parkspot.in / customer123',
      },
      lands: lands.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
