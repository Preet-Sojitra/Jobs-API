// const {CustomAPIError} = require("../errors")
const {StatusCodes} = require("http-status-codes")
const errorHandlerMiddleware = (err, req, res, next) => {
  // console.log(err)
  let customError = {
    // set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong try again later",
  }

  // This not needed anymore
  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({msg: err.message})
  // }
  // This was earlier, when all types of error including mongoose excpet custom one we were handling it with internal server error
  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })

  // Now we have created object for custom error, we will handle mongoose error nicely with this one.
  // This still does not makes any difference
  // return res.status(customError.statusCode).json({msg: customError.msg})

  // Handling duplicate email value error
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`
    customError.statusCode = 400
  }

  // Handling validation error
  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ")
    customError.statusCode = 400
  }

  // Handling cast error (means when provided id is not in DB)
  if (err.name === "CastError") {
    customError.msg = `No item found with id ${err.value}`
    customError.statusCode = 404
  }

  // Just of reference for making if-else cases
  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err})
  return res.status(customError.statusCode).json({msg: customError.msg})
}

module.exports = errorHandlerMiddleware
