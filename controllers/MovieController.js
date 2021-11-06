const catchAsync = require('./../utils/CatchAsync');
const AppError = require('./../utils/AppError');
const Movie = require('./../models/Movie');

exports.createMovie = catchAsync(async(req,res,next)=>{
    const newMovie = await Movie.create(req.body);
    res.status(201).json({
        status:'success',
        data:newMovie
    })
});

exports.getMovies = catchAsync(async(req,res,next)=>{
    const movies = await Movie.find();
    res.status(200).json({
        status:'success',
        data:movies
    })
});

exports.getSingleMovie = catchAsync(async(req,res,next)=>{
    const movie = await Movie.findById(req.params.id);
    res.status(200).json({
        status:'success',
        data:movie
    })
});

exports.updateMovie = catchAsync(async(req,res,next)=>{
    const movie = await Movie.findByIdAndUpdate(req.params.id,
                                                req.body,
                                                {new:true,
                                                    runValidators:true
                                                });
    res.status(200).json({
        status:'success',
        data:movie
    })
});

exports.deleteMovie = catchAsync(async(req,res,next)=>{
    const movie = await Movie.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status:'success',
        data:null
    })
});