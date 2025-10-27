const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Import mongoose to check for valid ObjectId
const authMiddleware = require('../middleware/authMiddleware');
const Project = require('../models/Project');
const User = require('../models/User');

// @route   POST api/projects
// @desc    Create a new project
// @access  Private (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }

  const { name, description, startDate, endDate, manager, team } = req.body;

  // Basic validation
  if (!name || !description || !startDate || !endDate || !manager) {
      return res.status(400).json({ msg: 'Please provide name, description, start date, end date, and manager ID.' });
  }

  try {
    const managerUser = await User.findById(manager);
    if (!managerUser) {
        return res.status(400).json({ msg: 'Invalid Manager ID.' });
    }

    let validTeam = [];
    if (team && Array.isArray(team)) {
        for (const memberId of team) {
            const teamUser = await User.findById(memberId);
            if (teamUser) {
                validTeam.push(teamUser._id);
            } else {
                 console.warn(`User ID ${memberId} provided in team not found.`);
            }
        }
    } else {
        // If no team is provided, add the manager to the team by default
        validTeam.push(managerUser._id);
    }

    const newProject = new Project({
      name, description, startDate, endDate,
      manager: managerUser._id, team: validTeam, status: 'Not Started',
    });
    const project = await newProject.save();
    const populatedProject = await Project.findById(project._id)
      .populate('manager', 'name email role')
      .populate('team', 'name email role');

    req.io.emit('project_created', populatedProject);
    res.json(populatedProject);

  } catch (err) {
    console.error(err.message);
     if (err.kind === 'ObjectId') {
        return res.status(400).json({ msg: 'Invalid ID format provided for manager or team member.' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/projects
// @desc    Get projects based on role
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    let projects;
    if (user.role === 'admin') {
      projects = await Project.find().sort({ createdAt: -1 }).populate('manager', 'name email').populate('team', 'name email');
    } else if (user.role === 'manager') {
       projects = await Project.find({ manager: req.user.id }).sort({ createdAt: -1 }).populate('manager', 'name email').populate('team', 'name email');
    } else { // 'client'
      projects = await Project.find({ team: req.user.id }).sort({ createdAt: -1 }).populate('manager', 'name email').populate('team', 'name email');
    }
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NEW ROUTE for getting a single project ---
// @route   GET api/projects/:projectId
// @desc    Get a project by its ID
// @access  Private (User must be Admin, Manager, or on the Team)
router.get('/:projectId', authMiddleware, async (req, res) => {
    try {
        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
            return res.status(400).json({ msg: 'Invalid Project ID format' });
        }

        // Find the project and populate manager/team names
        const project = await Project.findById(req.params.projectId)
            .populate('manager', 'name email')
            .populate('team', 'name email');

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // --- Permission Check ---
        // Ensure the logged-in user has access to this project
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isManager = project.manager._id.equals(user._id);
        const isOnTeam = project.team.some(member => member._id.equals(user._id));

        // Allow access if user is Admin, the Project Manager, or on the Team
        if (user.role !== 'admin' && !isManager && !isOnTeam) {
            return res.status(403).json({ msg: 'Access denied. You do not have permission to view this project.' });
        }
        // --- End Permission Check ---

        res.json(project);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT api/projects/:projectId/team/:userId
// @desc    Add a user to a project's team
// @access  Private (Admin or Project Manager)
router.put('/:projectId/team/:userId', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.projectId) || !mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ msg: 'Invalid Project or User ID format' });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    const requestingUser = await User.findById(req.user.id);
    if (!requestingUser) return res.status(404).json({ msg: 'Requesting user not found' });

    const isManagerOfProject = project.manager.equals(requestingUser._id);
    if (requestingUser.role !== 'admin' && !isManagerOfProject) {
      return res.status(403).json({ msg: 'Access denied. Only Admin or the Project Manager can add team members.' });
    }

    const userToAdd = await User.findById(req.params.userId);
    if (!userToAdd) return res.status(404).json({ msg: 'User to add not found' });

    const isAlreadyOnTeam = project.team.some(memberId => memberId.equals(userToAdd._id));
    if (isAlreadyOnTeam) return res.status(400).json({ msg: 'User is already on the project team' });

    project.team.push(userToAdd._id);
    await project.save();

    const updatedProject = await Project.findById(project._id)
        .populate('manager', 'name email')
        .populate('team', 'name email');

    req.io.emit('project_updated', updatedProject);
    res.json(updatedProject);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;

