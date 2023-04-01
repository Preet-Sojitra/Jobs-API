require("dotenv").config()
require("express-async-errors")
const express = require("express")

// extra security packages
const helmet = require("helmet")
const cors = require("cors")
const xss = require("xss-clean")
const rateLimiter = require("express-rate-limit")

// Swagger
/**
 * Steps used to setup api docs using swagger
 * 1. Export collection from postman and rename it as .json
 * 2. Went to "APIMATIC" to format the json file and save it as yaml
 * 3. Went to "Swagger UI editor" and paste the yaml code to see live example of docs
 * 4. Copy that yaml code and make file in local machine and add it.
 */
const swaggerUI = require("swagger-ui-express")
const YAML = require("yamljs")
const swaggerDocument = YAML.load("./swagger.yaml")

const app = express()

// connectDB
const connectDB = require("./db/connect")

const authenticateUser = require("./middleware/authentication")

// routers
const authRouter = require("./routes/auth")
const jobRouter = require("./routes/jobs")

// error handler
const notFoundMiddleware = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")

app.use(express.json())
// extra packages
app.set("trust proxy", 1)
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windows
    standardHeaders: true,
    message: "Too many requests sent by this ip, please try again in 15 mins",
  })
)
app.use(helmet())
app.use(cors())
app.use(xss())

// routes
app.use("/api/v1/auth", authRouter) // For authentication
app.use("/api/v1/jobs", authenticateUser, jobRouter) // For jobs
app.get("/", (req, res) => {
  res.send('<h1>Jobs Api</h1><a href="/api-docs">Documentation</a>')
})
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument))

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
