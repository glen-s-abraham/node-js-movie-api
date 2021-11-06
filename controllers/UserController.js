const User = require('./../models/User');
const catchAsync = require('./../utils/CatchAsync');
const AppError = require('./../utils/AppError');

exports.getAllUsers = catchAsync(async (req,res,next)=>{
    const users = await User.find();
    res.status(200).json({
    status: 'success',
    results:users.length,
    data: {
        users
    },
    });
});

exports.createUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message:'route not implemented'
    });
}

exports.getSingleUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message:'route not implemented'
    });
}

exports.updateUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message:'route not implemented'
    });
}

exports.deleteUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message:'route not implemented'
    });
}

const filterObj = (obj, ...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)){
            newObj[el]=obj[el];
        }
    });
    return newObj;
}

exports.updateMe = catchAsync(async (req,res,next)=>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password updates',400));
    }
    const filteredBody = filterObj(req.body,'name','email');
    user = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {new:true,
        runValidators:true}
    );
    res.status(200).json({
        status:'success',
        data:{user}
    });
});

exports.deleteMe = catchAsync(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{isActive:false});
    res.status(204).json({
        status:'success',
        data:null
    });
});