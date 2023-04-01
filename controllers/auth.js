const User = require("../models/User")
const {StatusCodes} = require("http-status-codes")
const {BadRequestError} = require("../errors/index")
const {UnauthenticatedError} = require("../errors/index")

// const bcrypt = require("bcryptjs")

// const jwt = require("jsonwebtoken")

const register = async (req, res) => {
  // If we don't use this custom error then also our mongoose validator will work
  // const {name, email, password} = req.body

  // if (!name || !email || !password) {
  //   throw new BadRequestError("Please provide name, email and password")
  // }

  // Below code has been shifted to models/User.js
  // const {name, email, password} = req.body
  // const salt = await bcrypt.genSalt(10)
  // const hashedPassword = await bcrypt.hash(password, salt)
  // const tempUser = {name, email, password: hashedPassword}
  // const user = await User.create(tempUser)

  // Here we are not validating empty values in controllers instead we are handling it to mongoose to handle it.
  const user = await User.create({...req.body})

  // Moved to models/User.js . We will create a function to generate token which will associated with each of the document
  // const token = jwt.sign({userId: user._id, name: user.name}, "jwtSecret", {
  //   expiresIn: "30d",
  // })

  const token = user.genToken()
  res.status(StatusCodes.CREATED).json({
    user: {
      // Since we have created a function named "getName", so we can directly use it here
      name: user.getName(),
    },
    token,
  })
}

const login = async (req, res) => {
  const {email, password} = req.body

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password")
  }

  const user = await User.findOne({email})

  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials")
  }

  // compare password
  const isPasswordCorrect = await user.comparePassword(password)

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials")
  }

  const token = user.genToken()

  res.status(StatusCodes.OK).json({user: {name: user.name}, token})
}

module.exports = {register, login}
