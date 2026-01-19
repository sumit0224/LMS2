const express = require("express")
const app = express()


app.get("/", (req, res)=>{
    res.send("hello from server")

})

app.listen(process.env.PORT|| 3000, ()=>{
    console.log("server runing on 3000 port")
})