const Land = require('../models/Land');
const { calculateAreaSqFt, calculateCapacity } = require('../utils/vehicleCapacity');
const { sanitizeLand, distanceMeters } = require('../utils/verification');

exports.createLand = async (req, res) => {
  try {
    let { title, description, lat, lng, address, city, state, boundary, pricePerHour, amenities, dynamicPricing, areaSqFt } = req.body;

    // Parse JSON-stringified fields (FormData sends everything as strings)
    const parseMaybeJSON = (v, fallback) => {
      if (v === undefined || v === null || v === '') return fallback;
      if (typeof v !== 'string') return v;
      try { return JSON.parse(v); } catch { return v; }
    };
    boundary = parseMaybeJSON(boundary, []);
    amenities = parseMaybeJSON(amenities, []);
    // FormData may send amenities as repeated fields: amenities[]=x – multer puts last only; also support comma string
    if (typeof amenities === 'string') {
      amenities = amenities.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(amenities)) amenities = [];
    if (!Array.isArray(boundary)) boundary = [];
    dynamicPricing = parseMaybeJSON(dynamicPricing, {}) || {};

    const boundaryCoords = boundary || [];
    let computedArea = calculateAreaSqFt(boundaryCoords);
    // REAL-TIME FIX: if owner just drops a pin (no boundary drawn), use given area or sensible default
    // so the land gets capacity > 0 and is bookable immediately during field testing.
    const givenArea = parseFloat(areaSqFt);
    if ((!computedArea || computedArea <= 0) && Number.isFinite(givenArea) && givenArea > 0) {
      computedArea = Math.round(givenArea);
    }
    if (!computedArea || computedArea <= 0) {
      computedArea = 5000; // ~100 spots default for quick testing
      // auto-generate a small square boundary (~70x70ft) around the pin so map polygon shows
      const cLat = parseFloat(lat), cLng = parseFloat(lng);
      if (Number.isFinite(cLat) && Number.isFinite(cLng)) {
        const d = 0.00015;
        boundaryCoords.push([cLng - d, cLat - d], [cLng + d, cLat - d], [cLng + d, cLat + d], [cLng - d, cLat + d]);
      }
    }
    const areaSqFtFinal = computedArea;
    const { totalSpots, twoWheelerSpots, fourWheelerSpots } = calculateCapacity(areaSqFtFinal);
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    // REAL-TIME TESTING: auto-approve so owner upload is visible instantly.
    // Set INSTANT_APPROVE=false in production to require admin verification.
    const instantApprove = String(process.env.INSTANT_APPROVE || 'true').toLowerCase() !== 'false';

    const land = await Land.create({
      owner: req.user.id,
      title,
      description,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)], address, city, state },
      boundary: boundaryCoords,
      areaSqFt: areaSqFtFinal,
      totalSpots,
      twoWheelerSpots,
      fourWheelerSpots,
      pricePerHour: parseFloat(pricePerHour),
      amenities: amenities || [],
      images,
      dynamicPricing: dynamicPricing || {},
      status: instantApprove ? 'approved' : 'pending',
      isAvailable: true,
      verificationDetails: { verificationTier: instantApprove ? 'doc_verified' : 'unverified' },
    });

    res.status(201).json({ land: sanitizeLand(land, 'owner'), autoApproved: instantApprove });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLands = async (req, res) => {
  try {
    // Accept BOTH backend names (minPrice) and frontend names (priceMin) + map-bounds + text search
    const { lat, lng, radius, minPrice, maxPrice, priceMin, priceMax, vehicleType, amenities, search, minLat, maxLat, minLng, maxLng } = req.query;
    const query = { status: 'approved', isAvailable: true };

    if (lat && lng && radius) {
      query.location = {
        $geoWithin: { $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(radius) / 6371] },
      };
    } else if (minLat && maxLat && minLng && maxLng) {
      query.location = {
        $geoWithin: { $box: [[parseFloat(minLng), parseFloat(minLat)], [parseFloat(maxLng), parseFloat(maxLat)]] },
      };
    }
    const lo = minPrice ?? priceMin;
    const hi = maxPrice ?? priceMax;
    if (lo || hi) {
      query.pricePerHour = {};
      if (lo) query.pricePerHour.$gte = parseFloat(lo);
      if (hi) query.pricePerHour.$lte = parseFloat(hi);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }
    if (vehicleType === 'two_wheeler') query.twoWheelerSpots = { $gt: 0 };
    if (vehicleType === 'four_wheeler') query.fourWheelerSpots = { $gt: 0 };
    if (amenities) query.amenities = { $all: amenities.split(',') };

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 50));
    let lands = await Land.find(query)
      .select('-verificationDetails.documentUrl -verificationDetails.ownerIdProofUrl -verificationDetails.livePhotoUrl')
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    // REAL-TIME: sort by distance when user GPS given, attach distanceKm
    const uLat = parseFloat(lat), uLng = parseFloat(lng);
    let mapped = lands.map((l) => sanitizeLand(l, 'public'));
    if (Number.isFinite(uLat) && Number.isFinite(uLng)) {
      const { distanceMeters } = require('../utils/verification');
      mapped = mapped.map((l) => {
        const c = l.location && l.location.coordinates;
        const d = c ? distanceMeters([uLng, uLat], c) : Infinity;
        return { ...l, distanceKm: Number.isFinite(d) ? Math.round((d / 1000) * 10) / 10 : null };
      }).sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
    }
    res.json({ lands: mapped, page, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLandById = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id).populate('owner', 'name phone email');
    if (!land) return res.status(404).json({ message: 'Land not found' });
    // Privacy: public sees masked contact + NO doc URLs. Owner/admin see more.
    let role = 'public';
    if (req.user && (req.user.role === 'admin' || land.owner._id.toString() === req.user.id)) {
      role = req.user.role === 'admin' ? 'admin' : 'owner';
    }
    // getLandById is public; req.user may be undefined. Handle safely.
    res.json({ land: sanitizeLand(land, role) });
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
    res.json({ lands: lands.map((l) => sanitizeLand(l, 'owner')) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllLands = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
    // Admin vault: full docs visible here only
    const lands = await Land.find(query).populate('owner', 'name email phone').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    res.json({ lands, page, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitVerificationDocs = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: 'Land not found' });
    if (land.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedDocTypes = ['patta', 'tax_receipt', 'sale_deed', 'lease_agreement', 'utility_bill', 'other'];
    let { documentType, documentUrl, ownerIdProofUrl, livePhotoUrl, livePhotoCoordinates, notes } = req.body;

    if (documentType && !allowedDocTypes.includes(documentType)) {
      return res.status(400).json({ message: `documentType must be one of ${allowedDocTypes.join(', ')}` });
    }

    // Accept secure file uploads (private vault) if provided as multipart: fields doc, idProof, livePhoto
    if (req.files) {
      const filesArray = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      const byField = {};
      const list = Array.isArray(req.files) ? filesArray : [];
      // multer .fields() gives object; .array()/.single() gives array – map by fieldname
      const allFiles = Array.isArray(req.files) ? req.files : Object.entries(req.files).flatMap(([k, v]) => (Array.isArray(v) ? v : [v]).map((f) => ({ ...f, fieldname: f.fieldname || k })));
      for (const f of allFiles) byField[f.fieldname] = f;
      if (byField.doc) documentUrl = `/uploads/private/${byField.doc.filename}`;
      if (byField.idProof) ownerIdProofUrl = `/uploads/private/${byField.idProof.filename}`;
      if (byField.livePhoto) livePhotoUrl = `/uploads/private/${byField.livePhoto.filename}`;
    }

    // Parse livePhotoCoordinates if sent as JSON string
    if (typeof livePhotoCoordinates === 'string') {
      try { livePhotoCoordinates = JSON.parse(livePhotoCoordinates); } catch { /* keep as-is */ }
    }

    // TRUST CHECK: live photo GPS must be within 500m of claimed land location
    if (livePhotoCoordinates && Array.isArray(livePhotoCoordinates) && livePhotoCoordinates.length >= 2) {
      const landLngLat = land.location && land.location.coordinates;
      const dist = distanceMeters(landLngLat, livePhotoCoordinates.map(Number));
      if (!Number.isFinite(dist) || dist > 500) {
        return res.status(400).json({
          message: `Live photo must be taken at the land location (you are ${Math.round(dist)}m away, max 500m). Please retake the photo with GPS on.`,
        });
      }
    }

    land.verificationDetails = {
      ...land.verificationDetails,
      documentType: documentType || land.verificationDetails.documentType,
      documentUrl: documentUrl || land.verificationDetails.documentUrl,
      ownerIdProofUrl: ownerIdProofUrl || land.verificationDetails.ownerIdProofUrl,
      livePhotoUrl: livePhotoUrl || land.verificationDetails.livePhotoUrl,
      livePhotoCoordinates: livePhotoCoordinates || land.verificationDetails.livePhotoCoordinates,
      notes: notes || land.verificationDetails.notes,
      verificationTier: land.verificationDetails.verificationTier || 'unverified',
    };

    await land.save();
    res.json({ message: 'Verification documents submitted. Only admin can view them. Customers will only see a Verified tick.', land: sanitizeLand(land, 'owner') });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyLand = async (req, res) => {
  try {
    const { status, rejectionReason, verificationTier, notes } = req.body;
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    if (verificationTier && !['unverified', 'doc_verified', 'physically_verified'].includes(verificationTier)) {
      return res.status(400).json({ message: 'Invalid verificationTier' });
    }
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: 'Land not found' });

    if (status) land.status = status;
    if (rejectionReason !== undefined) land.rejectionReason = rejectionReason;

    if (!land.verificationDetails) land.verificationDetails = {};
    if (verificationTier) land.verificationDetails.verificationTier = verificationTier;
    if (notes) land.verificationDetails.notes = notes;

    if (status === 'approved') {
      land.verificationDetails.verifiedAt = new Date();
      land.verificationDetails.verifiedBy = req.user.id;
      if (!land.verificationDetails.verificationTier || land.verificationDetails.verificationTier === 'unverified') {
        land.verificationDetails.verificationTier = 'doc_verified';
      }
    }

    await land.save();
    res.json({ message: `Land status updated to ${land.status}`, land });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

