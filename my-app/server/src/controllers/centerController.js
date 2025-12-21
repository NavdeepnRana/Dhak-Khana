const Center = require('../models/Center');

async function getAllCenters(req, res) {
  try {
    const centers = await Center.find().sort({ name: 1 });
    res.json(centers);
  } catch (error) {
    console.error('Error fetching centers:', error);
    res.status(500).json({ message: 'Failed to fetch centers' });
  }
}

async function getCenter(req, res) {
  try {
    const center = await Center.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    res.json(center);
  } catch (error) {
    console.error('Error fetching center:', error);
    res.status(500).json({ message: 'Failed to fetch center' });
  }
}

async function createCenter(req, res) {
  try {
    const { name, code, address, serviceArea, contact, city, pincode } = req.body;
    
    // Check if center with same code already exists
    const existingCenter = await Center.findOne({ code });
    if (existingCenter) {
      return res.status(400).json({ message: 'Center with this code already exists' });
    }

    const center = await Center.create({
      name,
      code,
      address,
      serviceArea,
      contact,
      city,
      pincode,
    });

    res.status(201).json({ message: 'Center created successfully', center });
  } catch (error) {
    console.error('Error creating center:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Center with this code already exists' });
    }
    res.status(500).json({ message: 'Failed to create center' });
  }
}

async function updateCenter(req, res) {
  try {
    const { name, code, address, serviceArea, contact, city, pincode } = req.body;
    
    // Check if code is being changed and if new code already exists
    if (code) {
      const existingCenter = await Center.findOne({ code, _id: { $ne: req.params.id } });
      if (existingCenter) {
        return res.status(400).json({ message: 'Center with this code already exists' });
      }
    }

    const center = await Center.findByIdAndUpdate(
      req.params.id,
      { name, code, address, serviceArea, contact, city, pincode },
      { new: true, runValidators: true }
    );

    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }

    res.json({ message: 'Center updated successfully', center });
  } catch (error) {
    console.error('Error updating center:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Center with this code already exists' });
    }
    res.status(500).json({ message: 'Failed to update center' });
  }
}

async function deleteCenter(req, res) {
  try {
    const center = await Center.findByIdAndDelete(req.params.id);
    if (!center) {
      return res.status(404).json({ message: 'Center not found' });
    }
    res.json({ message: 'Center deleted successfully' });
  } catch (error) {
    console.error('Error deleting center:', error);
    res.status(500).json({ message: 'Failed to delete center' });
  }
}

async function searchCenters(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const searchRegex = new RegExp(q, 'i');
    const centers = await Center.find({
      $or: [
        { name: searchRegex },
        { code: searchRegex },
        { city: searchRegex },
        { serviceArea: searchRegex },
        { address: searchRegex },
      ],
    })
      .limit(10)
      .sort({ name: 1 });

    res.json(centers);
  } catch (error) {
    console.error('Error searching centers:', error);
    res.status(500).json({ message: 'Failed to search centers' });
  }
}

module.exports = {
  getAllCenters,
  getCenter,
  createCenter,
  updateCenter,
  deleteCenter,
  searchCenters,
};


