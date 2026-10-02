const ErrorHandler = require("../utils/Errorhandler");

module.exports = (err,req , res, next) => {
     err.statusCode = err.statusCode || 500
     err.message = err.message || "Internal Server error"


     if(err.name === "CastError" ){
        const message = `Resources Nor Found With This Id.. Invalid ${err.path} `
        err = new ErrorHandler(message , 400)
     }

     // Duplicate Key Error

    if(err.code === 1100) {
        const message = `Duplicate Key ${Object.keys(err.keyValue)}`
        err = new ErrorHandler(message , 400)
    }

    // Wrong Jwt Error

    if(err.name === "JsonWebTokenError"){
        const message = `Your Url Is Invalid Please Try nAgain`
        err = new ErrorHandler(message , 400) 
    }
      // Token Expried Error
    if(err.name === "TokenExpriedError"){
        const message = `Your Token is Expried Please Try nAgain`
        err = new ErrorHandler(message , 400) 
    }

    res.status(err.statusCode).json({
        success : false,
        message : err.message
    })
}