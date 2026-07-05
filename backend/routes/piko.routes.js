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
  reportRoute,
  getModerationQueue,
  moderateRoute,
  addRoutePhoto,
} = require('../controllers/piko.controller');
const { protect } = require('../middleware/auth.middleware');
const { requirePro } = require('../middleware/subscription.middleware');

// Mounted at /api/piko. All routes require authentication.
const router = express.Router();
router.use(protect);

// Pro gate for the "create & collaborate" actions. Browsing (list, view, save,
// read comments) stays free — the shop-window model.
const pro = requirePro('trails');

router.get('/saved', getSaved);
router.post('/route', pro, routeSnap); // draw/record snapping (GraphHopper proxy)
router.route('/routes').get(listRoutes).post(pro, createRoute);
router.get('/routes/:id', getRoute);
router.post('/routes/:id/save', toggleSave);
router.post('/routes/:id/vote', pro, vote);
router.route('/routes/:id/comments').get(listComments).post(addComment);
router.post('/routes/:id/add-to-plan', pro, addToPlan);

// Moderation & UGC safety (Phase 4)
router.get('/moderation', getModerationQueue); // admins (ADMIN_EMAILS)
router.post('/routes/:id/report', reportRoute);
router.post('/routes/:id/moderate', moderateRoute); // admins
router.post('/routes/:id/photos', addRoutePhoto); // creator/admin

module.exports = router;
