const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,'Please enter a valid username']
        },
        email:{
            type:String,
            required:[true,'Please enter a valid email id'],
            unique:true,
            lowercase:true,
            validate:[validator.isEmail,'Please enter a valid email format']
        },
        photo:String,
        role:{
            type:String,
            enum:['admin','user'],
            default:'user'
        },
        password:{
            type:String,
            required:[true,'Please enter a password'],
            minlength:8,
            select: false 
        },
        passwordConfirm:{
            type:String,
            required:[true,'Please confirm your password'],
            validate:{
                //only works on create() and save()
                validator:function(el){
                    return el == this.password;
                },
                message:`passwords Doesn't match`
            }
        },
        passwordChangedAt:Date,
        passwordResetToken:String,
        passwordResetExpies:Date,
        isActive:{
            type:Boolean,
            default:true,
            select:false
        }

});

userSchema.pre(/^find/,function(next){
    this.find({isActive:{$ne:false}});
    next();
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});


userSchema.methods.isCorrectPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.isPasswordChanged = function(jwtTimestamp){
    if(this.passwordChangedAt){
        const changedTime = parseInt(this.passwordChangedAt.getTime()/1000,10);
        return changedTime > jwtTimestamp;
    }
    return false;
}

userSchema.methods.generatePasswordResetToken = function(){
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256')
                                    .update(token)
                                    .digest('hex');
    console.log({token},this.passwordResetToken);
    this.passwordResetExpies = Date.now() + 10 * 60 *1000;
    return token;                                
}

const User = mongoose.model('User',userSchema);
module.exports = User;

