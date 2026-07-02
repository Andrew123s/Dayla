const express = require('express');
const {
  listRoutes,
  getRoute,
  createRoute,
  toggleSave,
  getSaved,
  vote,
  listComments,
  addComment,
  addToPlan,
  routeSnap,
} = require('../controllers/piko.controller');
const { protect } = require('../middleware/auth.middleware');

// Mounted at /api/piko. All routes require authentication.
const router = express.Router();
router.use(protect);

router.get('/saved', getSaved);
router.post('/route', routeSnap); // draw/record snapping (GraphHopper proxy)
router.route('/routes').get(listRoutes).post(createRoute);
router.get('/routes/:id', getRoute);
router.post('/routes/:id/save', toggleSave);
router.post('/routes/:id/vote', vote);
router.route('/routes/:id/comments').get(listComments).post(addComment);
router.post('/routes/:id/add-to-plan', addToPlan);

module.exports = router;
