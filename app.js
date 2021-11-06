const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const app = express();
const AppError = require('./utils/AppError');
const userRouter = require('./routes/UserRoutes');
const handler = require('./controllers/ErrorController');
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//Header security
app.use(helmet());
//Rate limiter
const limiter = rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'Too many requests from this IP Please try again in an hour'
});
app.use('/api', limiter);

app.use(express.json());

//Data sanitization NoSql injection
app.use(mongoSanitize());
//Data Sanitization XSS
app.use(xss());
//parameter pollution
app.use(hpp());

app.use('/api/users',userRouter);
//error handler for unhandled routes
app.all('*',(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl}`,404));
});

app.use(handler);

module.exports = app;
