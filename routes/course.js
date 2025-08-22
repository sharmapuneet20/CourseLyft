
const { Router } = require('express');

const courseRouter = Router();



courseRouter.post('/purchase', async (req , res)=>{
//    you would expect the user to pay you money

})



courseRouter.get('/preview', async (req , res)=>{


})

module.exports = {
    courseRouter: courseRouter
}