const express = require('express');
const {
  getBudget,
  createExpense,
  updateExpense,
  deleteExpense,
  setExpenseSettled,
  createSettlement,
  deleteSettlement
} = require('../controllers/budget.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, budgetSchemas } = require('../utils/validator');

// Mounted at /api/trips — these routes live alongside the trip routes but are
// kept in their own file for clarity.
const router = express.Router();

router.use(protect);

const validateBody = (schema) => (req, res, next) => {
  const validation = validate(schema, req.body);
  if (!validation.isValid) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
  }
  req.body = validation.value;
  next();
};

// Expenses
router.route('/:tripId/expenses')
  .get(getBudget)
  .post(validateBody(budgetSchemas.createExpense), createExpense);

router.route('/:tripId/expenses/:id')
  .put(validateBody(budgetSchemas.updateExpense), updateExpense)
  .delete(deleteExpense);

router.patch('/:tripId/expenses/:id/settled', validateBody(budgetSchemas.setSettled), setExpenseSettled);

// Settlements
router.post('/:tripId/settlements', validateBody(budgetSchemas.createSettlement), createSettlement);
router.delete('/:tripId/settlements/:id', deleteSettlement);

module.exports = router;
