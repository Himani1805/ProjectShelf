const express = require('express');
const { uploadMedia, deleteMedia } = require('../controllers/mediaController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/fileUpload');

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadMedia);
router.delete('/:publicId', protect, deleteMedia);

module.exports = router;