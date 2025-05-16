const Collaboration = require('../models/collaborationModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');
const { createNotification } = require('./notificationController');

// @desc    Invite a collaborator
// @route   POST /api/collaborations
// @access  Private
exports.inviteCollaborator = async (req, res, next) => {
  try {
    const { projectId, email, role } = req.body;
    
    // Check if project exists and user is owner
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${projectId}`
      });
    }
    
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to invite collaborators to this project'
      });
    }
    
    // Find user by email
    const collaborator = await User.findOne({ email });
    
    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: `User not found with email ${email}`
      });
    }
    
    // Check if user is already a collaborator
    const existingCollaboration = await Collaboration.findOne({
      project: projectId,
      collaborator: collaborator._id
    });
    
    if (existingCollaboration) {
      return res.status(400).json({
        success: false,
        message: 'User is already a collaborator on this project'
      });
    }
    
    // Create collaboration
    const collaboration = await Collaboration.create({
      project: projectId,
      owner: req.user.id,
      collaborator: collaborator._id,
      role
    });
    
    // Send notification to collaborator
    await createNotification(
      collaborator._id,
      req.user.id,
      'system',
      `You've been invited to collaborate on project: ${project.title}`,
      'Project',
      project._id,
      `/projects/${project._id}`
    );
    
    res.status(201).json({
      success: true,
      data: collaboration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to collaboration invitation
// @route   PUT /api/collaborations/:id/respond
// @access  Private
exports.respondToInvitation = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either accepted or rejected'
      });
    }
    
    const collaboration = await Collaboration.findById(req.params.id);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: `Collaboration not found with id of ${req.params.id}`
      });
    }
    
    // Check if user is the collaborator
    if (collaboration.collaborator.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to respond to this invitation'
      });
    }
    
    collaboration.status = status;
    await collaboration.save();
    
    // Get project details
    const project = await Project.findById(collaboration.project);
    
    // Send notification to owner
    await createNotification(
      collaboration.owner,
      req.user.id,
      'system',
      `${req.user.name} has ${status} your invitation to collaborate on: ${project.title}`,
      'Project',
      project._id,
      `/projects/${project._id}`
    );
    
    res.status(200).json({
      success: true,
      data: collaboration
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project collaborators
// @route   GET /api/collaborations/project/:projectId
// @access  Private
exports.getProjectCollaborators = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${req.params.projectId}`
      });
    }
    
    // Check if user is owner or collaborator
    const isOwner = project.user.toString() === req.user.id;
    
    if (!isOwner) {
      const isCollaborator = await Collaboration.findOne({
        project: req.params.projectId,
        collaborator: req.user.id,
        status: 'accepted'
      });
      
      if (!isCollaborator) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to view collaborators for this project'
        });
      }
    }
    
    const collaborations = await Collaboration.find({
      project: req.params.projectId
    }).populate('collaborator', 'name email profileImage');
    
    res.status(200).json({
      success: true,
      count: collaborations.length,
      data: collaborations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's collaborations
// @route   GET /api/collaborations/user
// @access  Private
exports.getUserCollaborations = async (req, res, next) => {
  try {
    const collaborations = await Collaboration.find({
      collaborator: req.user.id,
      status: 'accepted'
    })
    .populate({
      path: 'project',
      select: 'title description'
    })
    .populate({
      path: 'owner',
      select: 'name email profileImage'
    });
    
    res.status(200).json({
      success: true,
      count: collaborations.length,
      data: collaborations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove collaborator
// @route   DELETE /api/collaborations/:id
// @access  Private
exports.removeCollaborator = async (req, res, next) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: `Collaboration not found with id of ${req.params.id}`
      });
    }
    
    // Check if user is owner or the collaborator themselves
    const isOwner = collaboration.owner.toString() === req.user.id;
    const isSelfRemoval = collaboration.collaborator.toString() === req.user.id;
    
    if (!isOwner && !isSelfRemoval) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to remove this collaborator'
      });
    }
    
    await collaboration.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};