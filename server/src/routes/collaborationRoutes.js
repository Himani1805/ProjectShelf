const express = require('express');
const {
    inviteCollaborator,
    respondToInvitation,
    getProjectCollaborators,
    getUserCollaborations,
    removeCollaborator
} = require('../controllers/collaborationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All collaboration routes require authentication
router.use(protect);

router.post('/', inviteCollaborator);
router.put('/:id/respond', respondToInvitation);
router.get('/project/:projectId', getProjectCollaborators);
router.get('/user', getUserCollaborations);
router.delete('/:id', removeCollaborator);

module.exports = router;