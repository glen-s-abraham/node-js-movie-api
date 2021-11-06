const express = require('express');
const movieController = require('./../controllers/MovieController');
const router = express.Router();

router
    .route('/')
    .post(movieController.createMovie)
    .get(movieController.getMovies)

router
    .route('/:id')
    .get(movieController.getSingleMovie)
    .patch(movieController.updateMovie)
    .delete(movieController.deleteMovie)

module.exports = router;