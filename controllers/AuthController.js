const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./../models/User');
const AppError = require('./../utils/AppError');
const catchAsync = require('./../utils/CatchAsync');
const sendEmail = require('./../utils/Email');

const signToken = id => {
    return jwt.sign(
        {
            id: id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_TTL
        }
    );
}

const generateAndSendJWTToken = (user,statusCode,res)=>{
    const token = signToken(user._id);
    let cookieOptions = {
        expires:new Date(Date.now()+process.env.JWT_COOKIE_TTL*24*60*60*1000),
        httpOnly:true
    }
    if(process.env.NODE_ENV == 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    res.status(201).json({
        status:'success',
        token:token,
        data:{
            user:user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role:req.body.role
    });
    generateAndSendJWTToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('please enter an email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !await user.isCorrectPassword(password, user.password)) {
        return next(new AppError('invalid email and password', 401));
    }
    generateAndSendJWTToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in', 401));
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError('The user for this token no longer exist', 401));
    }
    if (user.isPasswordChanged(decoded.iat)) {
        return next(new AppError('The user changed password recently relogin to continue', 401));
    }
    req.user = user;
    next();

});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not Have permission for the action', 403));
        }
        next();
    };
}

exports.forgotPassword = catchAsync(async (req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user){
        console.log('shit');
        return next(new AppError('There is no user with the email address',404));
    }
    const resetToken = user.generatePasswordResetToken();
    await user.save({validateBeforeSave:false});

    const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
    const message = ` Forgot password?Submit a patch request with your new password and passwordConsfirm
    to ${resetUrl}`;

    try{
        await sendEmail({
            email:user.email,
            subject:'Password reset link (valid for 10 minutes)',
            message
        });
        res.status(200).json({
            status:'success',
            message:'Token sent to email'
        });
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpies = undefined;
        await user.save({validateBeforeSave:false});
        return next(new AppError('Error sending email.Try again later!',500));
    }
    
});

exports.resetPassword = catchAsync(async (req,res,next)=>{
    const hashedToken = crypto.createHash('sha256')
                              .update(req.params.token)
                              .digest('hex');
    console.log(hashedToken);
    const user = await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpies:{$gt:Date.now()}
    });
    if(!user){
        return next(new AppError('Invalid token',400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpies = undefined;
    await user.save();
    generateAndSendJWTToken(user, 200, res);
    
});

exports.updatePassword = catchAsync(async (req,res,next)=>{
    const user = await User.findById(req.user.id).select('password');
    if(!(await user.isCorrectPassword(req.body.currentPassword, user.password))){
        return next(new AppError('Current password Incorrect',400));
    }
    user.password = req.body.password;
    user.password_confirm = req.body.passwordConfirm;
    await user.save();
    generateAndSendJWTToken(user, 200, res);
});