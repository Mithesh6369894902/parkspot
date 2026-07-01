const Land = require('../models/Land');
const { calculateAreaSqFt, calculateCapacity } = require('../utils/vehicleCapacity');

exports.createLand = async (req, res) => {
  try {
    const { title, description, lat, lng, address, city, state, boundary, pricePerHour, amenities, dynamicPricing } = req.body;
    const boundaryCoords = boundary || [];
    const areaSqFt = calculateAreaSqFt(boundaryCoords);
    const { totalSpots, twoWheelerSpots, fourWheelerSpots } = calculateCapacity(areaSqFt);
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const land = await Land.create({
      owner: req.user.id,
      title,
      description,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)], address, city, state },
      boundary: boundaryCoords,
      areaSqFt,
      totalSpots,
      twoWheelerSpots,
      fourWheelerSpots,
      pricePerHour: parseFloat(pricePerHour),
      amenities: amenities || [],
      images,
      dynamicPricing: dynamicPricing || {},
    });

    res.status(201).json({ land });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLands = async (req, res) => {
  try {
    const { lat, lng, radius, minPrice, maxPrice, vehicleType, amenities } = req.query;
    const query = { status: 'approved', isAvailable: true };

    if (lat && lng && radius) {
      query.location = {
        $geoWithin: { $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(radius) / 6371] },
      };
    }
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerHour.$lte = parseFloat(maxPrice);
    }
    if (vehicleType === 'two_wheeler') query.twoWheelerSpots = { $gt: 0 };
    if (vehicleType === 'four_wheeler') query.fourWheelerSpots = { $gt: 0 };
    if (amenities) query.amenities = { $all: amenities.split(',') };

    const lands = await Land.find(query).populate('owner', 'name phone').sort({ createdAt: -1 });
    res.json({ lands });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLandById = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate('owner', 'name phone email');
    if (!land) return res.status(404).json({ message: 'Land not found' });
    res.json({ land });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: 'Land not found' });
    if (land.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updates = req.body;
    if (updates.boundary) {
      updates.areaSqFt = calculateAreaSqFt(updates.boundary);
      const cap = calculateCapacity(updates.areaSqFt);
      Object.assign(updates, cap);
    }
    if (req.files && req.files.length > 0) {
      updates.images = [...(land.images || []), ...req.files.map(f => `/uploads/${f.filename}`)];
    }
    const updated = await Land.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ land: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: 'Land not found' });
    if (land.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Land.findByIdAndDelete(req.params.id);
    res.json({ message: 'Land deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyLands = async (req, res) => {
  try {
    const lands = await Land.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ lands });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllLands = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const lands = await Land.find(query).populate('owner', 'name email phone').sort({ createdAt: -1 });
    res.json({ lands });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyLand = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const land = await Land.findByIdAndUpdate(req.params.id, { status, rejectionReason: rejectionReason || '' }, { new: true });
    if (!land) return res.status(404).json({ message: 'Land not found' });
    res.json({ land });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
