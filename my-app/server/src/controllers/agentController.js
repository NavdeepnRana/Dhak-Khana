const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const crypto = require('crypto');

const tokenOptions = { expiresIn: '12h' };

// Generate unique Agent ID
const generateAgentId = async () => {
  let agentId;
  let exists = true;
  while (exists) {
    agentId = 'AG' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const found = await Agent.findOne({ agentId });
    exists = !!found;
  }
  return agentId;
};

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Login Agent
async function loginAgent(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { agentId, email, mobile, password } = req.body;

  // Find agent by agentId, email, or mobile
  let agent = null;
  if (agentId) {
    agent = await Agent.findOne({ agentId: agentId.toUpperCase() });
  } else if (email) {
    agent = await Agent.findOne({ email: email.toLowerCase() });
  } else if (mobile) {
    agent = await Agent.findOne({ mobile });
  }

  if (!agent) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (agent.status !== 'Active') {
    return res.status(403).json({ message: 'Your account is inactive. Please contact admin.' });
  }

  const isMatch = await bcrypt.compare(password, agent.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Update last login
  agent.lastLogin = new Date();
  await agent.save();

  const token = jwt.sign(
    { id: agent._id, role: 'agent', agentId: agent.agentId },
    process.env.JWT_SECRET,
    tokenOptions
  );

  res.json({
    token,
    user: {
      id: agent._id,
      name: agent.fullName,
      email: agent.email,
      phone: agent.mobile,
      role: 'agent',
      agentId: agent.agentId,
      assignedCity: agent.assignedCity,
      assignedArea: agent.assignedArea,
    },
  });
}

// Get all agents (Admin only)
async function getAllAgents(req, res) {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Failed to fetch agents' });
  }
}

// Get single agent
async function getAgent(req, res) {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    // Remove password from response
    const agentData = agent.toObject();
    delete agentData.password;
    res.json(agentData);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ message: 'Failed to fetch agent' });
  }
}

// Create agent (Admin only)
async function createAgent(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      fullName,
      mobile,
      email,
      agentId,
      password,
      assignedCity,
      assignedArea,
      postOffice,
      hub,
      vehicleType,
      licenseNumber,
      shiftTime,
      status,
    } = req.body;

    // Check if agent with same email, mobile, or agentId exists
    const existing = await Agent.findOne({
      $or: [
        { email: email.toLowerCase() },
        { mobile },
        ...(agentId ? [{ agentId: agentId.toUpperCase() }] : []),
      ],
    });

    if (existing) {
      return res.status(409).json({ message: 'Agent with this email, mobile, or agent ID already exists' });
    }

    // Generate agent ID if not provided
    const finalAgentId = agentId ? agentId.toUpperCase() : await generateAgentId();

    // Always auto-generate password (admin should not set passwords manually)
    const finalPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const agent = await Agent.create({
      agentId: finalAgentId,
      fullName,
      mobile,
      email: email.toLowerCase(),
      password: hashedPassword,
      assignedCity,
      assignedArea,
      postOffice,
      hub,
      vehicleType: vehicleType || 'Bike',
      licenseNumber,
      shiftTime: shiftTime || 'Full Day',
      status: status || 'Active',
      role: 'agent',
      createdBy: req.user?.id,
    });

    // Remove password from response
    const agentData = agent.toObject();
    delete agentData.password;

    // TODO: Send email/SMS with credentials
    // For now, return the password in response (only for admin)
    res.status(201).json({
      message: 'Agent created successfully',
      agent: agentData,
      credentials: {
        agentId: finalAgentId,
        password: finalPassword, // Only returned to admin during creation
      },
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Agent with this information already exists' });
    }
    res.status(500).json({ message: 'Failed to create agent' });
  }
}

// Update agent
async function updateAgent(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updateData = { ...req.body };
    
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Remove password from updateData if it's empty
    if (updateData.password === '') {
      delete updateData.password;
    }

    // Don't allow updating agentId
    delete updateData.agentId;

    const agent = await Agent.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const agentData = agent.toObject();
    delete agentData.password;

    res.json({ message: 'Agent updated successfully', agent: agentData });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ message: 'Failed to update agent' });
  }
}

// Delete agent
async function deleteAgent(req, res) {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ message: 'Failed to delete agent' });
  }
}

// Activate/Deactivate agent
async function toggleAgentStatus(req, res) {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    agent.status = agent.status === 'Active' ? 'Inactive' : 'Active';
    await agent.save();

    const agentData = agent.toObject();
    delete agentData.password;

    res.json({
      message: `Agent ${agent.status === 'Active' ? 'activated' : 'deactivated'} successfully`,
      agent: agentData,
    });
  } catch (error) {
    console.error('Error toggling agent status:', error);
    res.status(500).json({ message: 'Failed to update agent status' });
  }
}

module.exports = {
  loginAgent,
  getAllAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  toggleAgentStatus,
};

