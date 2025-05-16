const cloudinary = require('cloudinary').v2;

// @desc    Upload media file
// @route   POST /api/media/upload
// @access  Private
exports.uploadMedia = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                url: req.file.path,
                type: req.file.mimetype.startsWith('image') ? 'image' : 'video'
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete media file
// @route   DELETE /api/media/:publicId
// @access  Private
exports.deleteMedia = async (req, res, next) => {
    try {
        const publicId = req.params.publicId;

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== 'ok') {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete media'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};