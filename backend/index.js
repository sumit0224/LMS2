const express = require("express")
const app = express()
const dotenv = require("dotenv").config()
const cors = require("cors")
const connectToDB = require("./config/db")
const adminRoute = require('./routes/adminRoute')
const userRoute = require("./routes/userRoute")
const teacherRoute = require("./routes/teacherRoute")
const courseRoute = require("./routes/courseRoute")
const syllabusRoute = require("./routes/syllabusRoute")
const enrollmentRoute = require("./routes/enrollmentRoute")
const assignmentRoute = require("./routes/assignmentRoute")
const submissionRoute = require("./routes/submissionRoute")
const attendanceRoute = require("./routes/attendanceRoute")

connectToDB()

// Middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.send("hello from server")
})

// Routes
app.use("/api/admin", adminRoute)
app.use("/api/users", userRoute)
app.use("/api/teachers", teacherRoute)
app.use("/api/course", courseRoute)
app.use("/api/syllabus", syllabusRoute)
app.use("/api/enrollment", enrollmentRoute)
app.use("/api/assignments", assignmentRoute)
app.use("/api/submissions", submissionRoute)
app.use("/api/attendance", attendanceRoute)

const { errorHandler } = require("./middlewares/errorMiddleware");
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
    console.log("server running on port " + (process.env.PORT || 3000))
})