require('dotenv').config()

const express  = require('express');
const mongoose = require('mongoose');
const  {userRouter} = require("./routes/user");
const  {courseRouter} = require("./routes/course");
const  {adminRouter} = require("./routes/admin");
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());
app.use('/user', userRouter);
app.use('/course' ,courseRouter);
app.use('/admin', adminRouter);







async function main() {
    await mongoose.connect(process.env.MONGO_URL)
    console.log("running");
    
    app.listen(3000);
}

main()

