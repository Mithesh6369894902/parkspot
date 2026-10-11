/**
 * Verification + privacy helpers for ParkSpot land trust.
 * - Customers NEVER see document URLs.
 * - Owner phone/email masked for public.
 * - Live photo GPS must be near the land.
 */

function toRad(d) {
  return (d * Math.PI) / 180;
}

// Haversine distance in meters between [lng,lat] pairs
function distanceMeters(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length < 2 || b.length < 2) return Infinity;
  const [lng1, lat1] = a.map(Number);
  const [lng2, lat2] = b.map(Number);
  if ([lng1, lat1, lng2, lat2].some((n) => Number.isNaN(n))) return Infinity;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function maskPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 4) return '******';
  return `******${digits.slice(-4)}`;
}

function maskEmail(email) {
  if (!email || !String(email).includes('@')) return '';
  const [u, d] = String(email).split('@');
  return `${u.slice(0, 2)}***@${d}`;
}

// Strip verification docs + mask owner for public responses.
// role: 'public' | 'owner' | 'admin'
function sanitizeLand(landDoc, role = 'public') {
  const land = typeof landDoc.toObject === 'function' ? landDoc.toObject() : { ...landDoc };
  if (role === 'admin') return land; // admin sees everything (vault)
  // Never expose private doc URLs to customers or even owners via public APIs
  if (land.verificationDetails) {
    const { verificationTier, verifiedAt, notes } = land.verificationDetails;
    land.verificationDetails = { verificationTier, verifiedAt, notes: role === 'owner' ? notes : '' };
    if (role === 'owner') {
      land.verificationDetails.hasDocument = true; // flag only, no URL
    }
  }
  if (land.owner && typeof land.owner === 'object') {
    if (role === 'public') {
      land.owner = {
        _id: land.owner._id,
        name: land.owner.name,
        phoneMasked: maskPhone(land.owner.phone),
        // email intentionally omitted for public
      };
    }
  }
  return land;
}

module.exports = { distanceMeters, maskPhone, maskEmail, sanitizeLand };
