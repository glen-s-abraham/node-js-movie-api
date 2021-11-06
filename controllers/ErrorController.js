const AppError = require("../utils/AppError");

const errorDev = (err,res) =>{
    res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack
    });
}

const errorProd = (err,res)=>{
    if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        });
    }else{
        //console.error('Error:',err);

        res.status(500).json({
            status:'error',
            message:'Something went wrong'
        });
    }
    
}

const handleCastErrorDb= err=>{
    const message = `Invalid error ${err.path}:${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldDb = err =>{
    console.log(err);
    const value = err.keyValue.name;
    const message = `Duplicate field value "${value}" found please use another values`;
    return new AppError(message,400);
}

const handleValidationErrorDb = err =>{
    const message = `Invalid invalid input data`;
    return new AppError(message,400);
}

const handleJWTError = () =>{
    const message = 'Invalid User Token';
    return new AppError(message,401);
}

const handleJWTExpired = () =>{
    const message = 'Token expired';
    return new AppError(message,401);
}

module.exports=(err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        errorDev(err,res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = {...err}
        console.log(error);
        if(error.name === 'CastError') error = handleCastErrorDb(error);
        if(error.code ===11000) error = handleDuplicateFieldDb(error);
        if(error.name === "ValidationError") error = handleValidationErrorDb(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleJWTExpired();
        errorProd(error,res);
    }
    
}