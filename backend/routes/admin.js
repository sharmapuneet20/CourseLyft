
const { Router } = require('express');
 const {adminModel ,  courseModel } = require('../database/db')

const z  = require("zod");
const jwt = require("jsonwebtoken");
const {JWT_ADMIN_PASSWORD} = require("../config");
const bcrypt = require("bcrypt");
const { id } = require("zod/locales");
const { adminMiddleware } = require('../middlewares/admin');




const adminRouter = Router();

// zod schema
 const signupAdminSchema = z.object({
   email: z.string().email("Invalid email format"),
   password: z.string().min(6 , "Password must be at least 6 characters").max(15),
   FirstName: z.string().min(2 , "First name must be at least 2 characters").max(40),
   LastName: z.string().min(2 , "Last name must be at least 2 charaters").max(40)

 });

 
adminRouter.post('/signup', async(req, res)=>{
    try{
        const parsedData = signupAdminSchema.safeParse(req.body);
        if(!parsedData.success){
            return res.status(400).json({
                message: "Invaid input",
                errors: parsedData.error.errors
            });
        }


    const {email , password , FirstName , LastName } = parsedData.data;

    const HashedPassword = await bcrypt.hash(password, 5);

     await adminModel.create({
        email,
        password: HashedPassword,
        FirstName,
        LastName
    })
    res.json({
        message: "you have successfully signup"
    })

}  
  catch(error){
        res.status(500).json({
            message: "Signup Failed",
            error: error.message,
        })
    }
});

adminRouter.post('/signin', async(req, res)=>{
    try{
      const{ email , password } = req.body;

      const admin = await adminModel.findOne({
         email: email
      })

      if(!admin){
        return res.status(401).json({mesage: "Admin not found"});
      }

      const passwordMatch = await bcrypt.compare(password , admin.password);

      if(!passwordMatch){
        return res.status(401).json({message: "Incorrect password"})
      }
      else{
        const token = jwt.sign({
            id: admin._id
        }, JWT_ADMIN_PASSWORD);
      
      return res.json({
        token: token,
        message: "you are signed In"
      })

    }
    }
    catch(error){
        res.status(500).json({
            message: "signIn failed",
            error: error.message
        })
    }
    
})

adminRouter.post('/course', adminMiddleware, async (req, res)=>{
     const adminId = req.userId;

     const {title , description , imageUrl  , price } = req.body;

const course =      await courseModel.create({
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price,
        creatorId: adminId

     })
     res.json({
        message: "Course created",
        courseId: course._id
     })
})

adminRouter.put('/course', adminMiddleware , async(req, res)=>{
       const adminId = req.userId;

     const {title , description , imageUrl  , price , courseId} = req.body;



  const course =    await courseModel.updateOne({
      _id: courseId,
      creatorId: adminId
     },{
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price

     })
     res.json({
        message: "Course updated",
        courseId: course._id
     })
})
        
    

adminRouter.get('/course/bulk',  adminMiddleware ,async(req, res)=>{

   const adminId = req.userId;

    const courses =  await courseModel.find({
      creatorId: adminId 
      });
     
     res.json({
        message: "all courses available",
        courses
     });
    
})




module.exports = {
    adminRouter : adminRouter
}

