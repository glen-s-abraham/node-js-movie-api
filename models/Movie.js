const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({
    title:{
        type:String,
        required:[true,"Please enter a valid movie title"],
        unique:true 
    },
    plot:{
        type:String,
        required:[true,"Movie must have a plot"]
    },
    director:{
        type:String,
        require:[true,"Movie must have a drector name"]
    },
    coverImage:String,
    ratings:{
        type:Number,
        min:1,
        max:5
    },
});

const Movie = mongoose.model('Movie',movieSchema);
module.exports = Movie;