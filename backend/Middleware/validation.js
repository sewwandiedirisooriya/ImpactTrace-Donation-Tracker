// middleware/validation.js
const validateBeneficiary = (req, res, next) => {
  const { name, email, needs_description } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Name is required'
    });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Valid email is required'
    });
  }

  if (!needs_description || needs_description.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Needs description is required'
    });
  }

  next();
};

const validateDonation = (req, res, next) => {
  const { donor_name, donor_email, amount } = req.body;

  if (!donor_name || donor_name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Donor name is required'
    });
  }

  if (!donor_email || !isValidEmail(donor_email)) {
    return res.status(400).json({
      success: false,
      message: 'Valid donor email is required'
    });
  }

  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid amount is required'
    });
  }

  next();
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validateBeneficiary,
  validateDonation
};