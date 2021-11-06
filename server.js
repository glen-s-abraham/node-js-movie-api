const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err=>{
    console.log('Uncaught exception');
    console.log(err);
    server.close(()=>{
        process.exit(1);
    });
});

dotenv.config({path:'./config.env'});
const app = require('./app');

mongoose.connect(process.env.DB_CON_STRING, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(con=>{
    console.log("DB connected");
}).catch(err=>console.log(err));

const port = process.env.PORT || 8000;
const server = app.listen(8000,()=>{
    console.log(`App started on port ${port}`);
});

process.on('unhandledRejection',err=>{
    console.log(err.name, err.message);
    console.log('Unhandled Rejection');
    server.close(()=>{
        process.exit(1);
    });
});

