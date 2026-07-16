import Insurance from '../models/Insurance.js';

// Get all insurances for user
export const getInsurances = async (req, res) => {
  try {
    const insurances = await Insurance.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: insurances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new insurance policy
export const addInsurance = async (req, res) => {
  try {
    const newInsurance = await Insurance.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json({
      success: true,
      data: newInsurance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update insurance policy details
export const updateInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found'
      });
    }
    res.status(200).json({
      success: true,
      data: insurance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete insurance policy
export const deleteInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.findOne({ _id: req.params.id, userId: req.userId });
    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found'
      });
    }
    await Insurance.deleteOne({ _id: req.params.id });
    res.status(200).json({
      success: true,
      message: 'Insurance policy deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
