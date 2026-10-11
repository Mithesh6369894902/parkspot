const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
const privateDir = path.join(uploadsDir, 'private');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(privateDir)) fs.mkdirSync(privateDir, { recursive: true });

const publicStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

// PRIVATE vault for land docs / ID proofs. Never served statically (see server.js guard).
const privateStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, privateDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `doc-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const docFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) cb(null, true);
  else cb(new Error('Only JPG/PNG/WEBP/PDF documents are allowed'));
};

const upload = multer({ storage: publicStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

// Private vault uploader: max 3 files, 5MB each
const uploadPrivate = multer({ storage: privateStorage, limits: { fileSize: 5 * 1024 * 1024, files: 3 }, fileFilter: docFilter });

module.exports = upload;
module.exports.uploadPrivate = uploadPrivate;
