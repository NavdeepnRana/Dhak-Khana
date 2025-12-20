const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Agent = require('../models/Agent');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role, agentId } = decoded;

    if (role === 'admin') {
      const admin = await Admin.findById(id).select('-password');
      if (!admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }
      req.user = { id: admin._id, name: admin.name, email: admin.email, role: 'admin' };
    } else if (role === 'agent' || agentId) {
      // Agent authentication
      const agent = await Agent.findById(id).select('-password');
      if (!agent) {
        return res.status(401).json({ message: 'Agent not found' });
      }
      req.user = {
        id: agent._id,
        name: agent.fullName,
        fullName: agent.fullName,
        email: agent.email,
        phone: agent.mobile,
        role: 'agent',
        agentId: agent.agentId,
        assignedCity: agent.assignedCity,
        assignedArea: agent.assignedArea,
      };
    } else {
      // Customer authentication
      const user = await User.findById(id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone };
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You are not allowed to access this resource' });
    }
    next();
  };
}

module.exports = { authMiddleware, authorizeRoles };

