
 const z = require ("zod");
const bcrypt = require("bcrypt")
const { Router }=  require("express");
const {userModel, purchaseModel, courseModel } = require("../database/db");
const { id } = require("zod/locales");
const jwt = require("jsonwebtoken");
const {JWT_USER_PASSWORD} = require("../config");
const { userMiddleware } = require("../middlewares/user");





const userRouter = Router();

// zod schema
 const signupSchema = z.object({
   email: z.string().email("Invalid email format"),
   password: z.string().min(6 , "Password must be at least 6 characters").max(15),
   FirstName: z.string().min(2 , "First name must be at least 2 characters").max(40),
   LastName: z.string().min(2 , "Last name must be at least 2 charaters").max(40)

 });




userRouter.post('/signup', async(req,res)=>{

    
  try{
        const parsedData = signupSchema.safeParse(req.body);
        if(!parsedData.success){
              return res.status(400).json({
               message: "Invalid input",
               errors: parsedData.error.errors
              });
        }
          

const {email , password , FirstName , LastName} =  parsedData.data;

/* password hashed for protection */
const HashedPassword = await bcrypt.hash(password , 5);    

// user save

      await userModel.create({
         email: email,
         password: HashedPassword,
         FirstName: FirstName,
         LastName: LastName
      }) 

      res.json({
         message: "You have successfully signedUp"
      }) 
   }
   catch(error){
      res.status(500).json({
         message: "signup failed",
         error: error.message,
      })
   }
});


userRouter.post('/signin', async(req,res)=>{
   try{ 
   const {email , password } = req.body;

   const user = await userModel.findOne({
      email: email,
   })

   if(!user){
      return res.status(401).json({message: "User not found"});
   }


    const passwordMatch = await bcrypt.compare(password , user.password);

    if(!passwordMatch){
       return res.status(401).json({message: "Incorrect password" });
    }
     else{
       const token = jwt.sign({
         id: user._id
       }, JWT_USER_PASSWORD);
     
      return res.json({
         token: token,
         message: "you are signed In"
       })
      }

   } 
   catch(error){
      
         res.status(500).json({
            message: "signup falied"
         })
      }

})


userRouter.get('/purchases', userMiddleware ,async (req , res)=>{
   const userId = req.userId;
  
   const purchases = await purchaseModel.find({
      userId,
   })

   const coursesdata = await courseModel.find({
      _id: {$in: purchases.map(x => x.courseId) }
   })
   res.json({
      purchases
   })
})

module.exports = {
   userRouter: userRouter
}
