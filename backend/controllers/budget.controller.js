const Trip = require('../models/trip.model');
const Dashboard = require('../models/dashboard.model');
const Expense = require('../models/expense.model');
const Settlement = require('../models/settlement.model');
const fx = require('../services/fx.service');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Budget controller — expenses + settlements for a trip.
//
// All routes are scoped to trip membership (owner + collaborators). After every
// write we emit `budget:updated` to the trip's dashboard room so collaborators
// refetch. FX is reconciled through USD via fx.service; each expense stores an
// `amountUSD` snapshot at write time so historical totals don't drift.
// ─────────────────────────────────────────────────────────────────────────────

// Load the trip and verify the requester is a member. Returns the trip or null.
async function loadTripForMember(tripId, userId) {
  const trip = await Trip.findById(tripId);
  if (!trip) return { trip: null, member: false };
  const isOwner = trip.owner.toString() === userId.toString();
  const isCollaborator = trip.collaborators.some((c) => c.toString() === userId.toString());
  return { trip, member: isOwner || isCollaborator };
}

// Emit a budget change to the trip's dashboard room (best-effort).
async function emitBudgetUpdated(req, tripId) {
  try {
    const io = req.app.get('io');
    if (!io) return;
    const dashboard = await Dashboard.findOne({ tripId }).select('_id');
    if (dashboard) {
      io.to(dashboard._id.toString()).emit('budget:updated', { tripId: tripId.toString() });
    }
  } catch (error) {
    logger.error('Failed to emit budget:updated:', error);
  }
}

// @desc    Get all expenses + settlements + budget for a trip
// @route   GET /api/trips/:tripId/expenses
// @access  Private (trip members)
const getBudget = async (req, res) => {
  try {
    const { trip, member } = await loadTripForMember(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!member) return res.status(403).json({ success: false, message: 'Not authorized to view this budget' });

    const [expenses, settlements] = await Promise.all([
      Expense.find({ tripId: trip._id }).sort({ createdAt: -1 }).lean(),
      Settlement.find({ tripId: trip._id }).sort({ createdAt: -1 }).lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        expenses,
        settlements,
        budgetUSD: (trip.budget && trip.budget.total) || 0,
        currencies: fx.getCurrencies()
      }
    });
  } catch (error) {
    logger.error('Get budget error:', error);
    res.status(500).json({ success: false, message: 'Failed to get budget', error: error.message });
  }
};

// @desc    Create an expense
// @route   POST /api/trips/:tripId/expenses
// @access  Private (trip members)
const createExpense = async (req, res) => {
  try {
    const { trip, member } = await loadTripForMember(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!member) return res.status(403).json({ success: false, message: 'Not authorized to edit this budget' });

    const body = req.body;
    if (!fx.isSupported(body.currency)) {
      return res.status(400).json({ success: false, message: `Unsupported currency: ${body.currency}` });
    }

    const expense = await Expense.create({
      tripId: trip._id,
      title: body.title,
      description: body.description || '',
      amount: body.amount,
      currency: body.currency,
      amountUSD: fx.toUSD(body.amount, body.currency),
      category: body.category || 'other',
      date: body.date,
      location: body.location || '',
      paidBy: body.paidBy,
      splitMethod: body.splitMethod,
      splits: body.splits.map((s) => ({ user: s.user, amount: s.amount })),
      receiptUrl: body.receiptUrl || null,
      settled: body.settled || false,
      createdBy: req.user._id
    });

    await emitBudgetUpdated(req, trip._id);

    res.status(201).json({ success: true, message: 'Expense created', data: { expense: expense.toObject() } });
  } catch (error) {
    logger.error('Create expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to create expense', error: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/trips/:tripId/expenses/:id
// @access  Private (trip members)
const updateExpense = async (req, res) => {
  try {
    const { trip, member } = await loadTripForMember(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!member) return res.status(403).json({ success: false, message: 'Not authorized to edit this budget' });

    const expense = await Expense.findOne({ _id: req.params.id, tripId: trip._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    const body = req.body;
    const fields = ['title', 'description', 'category', 'date', 'location', 'paidBy', 'splitMethod', 'settled'];
    fields.forEach((f) => {
      if (body[f] !== undefined) expense[f] = body[f];
    });
    if (body.splits !== undefined) {
      expense.splits = body.splits.map((s) => ({ user: s.user, amount: s.amount }));
    }
    if (body.receiptUrl !== undefined) {
      expense.receiptUrl = body.receiptUrl || null;
    }
    if (body.amount !== undefined) expense.amount = body.amount;
    if (body.currency !== undefined) {
      if (!fx.isSupported(body.currency)) {
        return res.status(400).json({ success: false, message: `Unsupported currency: ${body.currency}` });
      }
      expense.currency = body.currency;
    }
    // Re-snapshot the USD value whenever amount or currency changed.
    if (body.amount !== undefined || body.currency !== undefined) {
      expense.amountUSD = fx.toUSD(expense.amount, expense.currency);
    }

    await expense.save();
    await emitBudgetUpdated(req, trip._id);

    res.status(200).json({ success: true, message: 'Expense updated', data: { expense: expense.toObject() } });
  } catch (error) {
    logger.error('Update expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to update expense', error: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/trips/:tripId/expenses/:id
// @access  Private (trip members)
const deleteExpense = async (req, res) => {
  try {
    const { trip, member } = await loadTripForMember(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!member) return res.status(403).json({ success: false, message: 'Not authorized to edit this budget' });

    const expense = await Expense.findOneAndDelete({ _id: req.params.id, tripId: trip._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    await emitBudgetUpdated(req, trip._id);

    res.status(200).json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    logger.error('Delete expense error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete expense', error: error.message });
  }
};

// @desc    Mark an expense settled / reopen it
// @route   PATCH /api/trips/:tripId/expenses/:id/settled
// @access  Private (trip members)
const setExpenseSettled = async (req, res) => {
  try {
    const { trip, member } = await loadTripForMember(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!member) return res.status(403).json({ success: false, message: 'Not authorized to edit this budget' });

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, tripId: trip._id },
      { settled: req.body.settled },
      { new: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    await emitBudgetUpdated(req, trip._id);

    res.status(200).json({ success: true, message: 'Expense updated', data: { expense: expense.toObject() } });
  } catch (error) {
    logger.error('Set expense settled error:', error);
    res.status(500).json({ success: false, message: 'Failed to update expense', error: error.message });
  }
};

// @desc    Record a settlement payment
// @route   POST /api/trips/:tripId/settlements
// @access  Private (trip members)
const createSettlement = async (req, res) => {
  try {
    const { trip, member } = await loadTripForMember(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!member) return res.status(403).json({ success: false, message: 'Not authorized to edit this budget' });

    const { from, to, amountUSD } = req.body;
    const date = req.body.date || new Date().toISOString().slice(0, 10);

    const settlement = await Settlement.create({
      tripId: trip._id,
      from,
      to,
      amountUSD: Math.round(amountUSD * 100) / 100,
      date,
      createdBy: req.user._id
    });

    await emitBudgetUpdated(req, trip._id);

    res.status(201).json({ success: true, message: 'Settlement recorded', data: { settlement: settlement.toObject() } });
  } catch (error) {
    logger.error('Create settlement error:', error);
    res.status(500).json({ success: false, message: 'Failed to record settlement', error: error.message });
  }
};

// @desc    Undo / delete a settlement payment
// @route   DELETE /api/trips/:tripId/settlements/:id
// @access  Private (trip members)
const deleteSettlement = async (req, res) => {
  try {
    const { trip, member } = await loadTripForMember(req.params.tripId, req.user._id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!member) return res.status(403).json({ success: false, message: 'Not authorized to edit this budget' });

    const settlement = await Settlement.findOneAndDelete({ _id: req.params.id, tripId: trip._id });
    if (!settlement) return res.status(404).json({ success: false, message: 'Settlement not found' });

    await emitBudgetUpdated(req, trip._id);

    res.status(200).json({ success: true, message: 'Settlement removed' });
  } catch (error) {
    logger.error('Delete settlement error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove settlement', error: error.message });
  }
};

module.exports = {
  getBudget,
  createExpense,
  updateExpense,
  deleteExpense,
  setExpenseSettled,
  createSettlement,
  deleteSettlement
};
