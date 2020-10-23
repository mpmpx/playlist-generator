const express = require("express");
const router = express.Router();
const controller = require('../controllers/controller.js');


router.get('/', controller.home);
router.get('/get_first_song?', controller.getFirstSong);
router.get('/get_next_song?', controller.getNextSong);

router.get('/history', controller.getHistory);

module.exports = router;
