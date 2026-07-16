import Investment from '../models/Investment.js';

// Get all investments for user
export const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: investments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new investment
export const addInvestment = async (req, res) => {
  try {
    const newInvestment = await Investment.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json({
      success: true,
      data: newInvestment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update an investment
export const updateInvestment = async (req, res) => {
  try {
    const investment = await Investment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }
    res.status(200).json({
      success: true,
      data: investment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete an investment
export const deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, userId: req.userId });
    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }
    await Investment.deleteOne({ _id: req.params.id });
    res.status(200).json({
      success: true,
      message: 'Investment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
