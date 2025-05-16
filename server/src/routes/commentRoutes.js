const express = require('express');
const {
    createComment,
    getComments,
    updateComment,
    deleteComment,
    toggleLike
} = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, createComment);
router.get('/:refType/:refId', getComments);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/like', protect, toggleLike);

module.exports = router;