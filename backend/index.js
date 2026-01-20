const express = require("express")
const app = express()
const dotenv = require("dotenv").config()
const connectToDB = require("./config/db")
const adminRoute = require('./routes/adminRoute')

connectToDB()

app.use(express.json());
app.use(express.urlencoded({ extended: true }))



app.get("/", (req, res) => {
    res.send("hello from server")

})
app.use("/api/admin", adminRoute)



app.listen(process.env.PORT || 3000, () => {
    console.log("server runing on  port")
})