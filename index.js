import express from "express";
import helmet from "helmet";
const app = express();
//todo => writing dotenv for accessing env
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 8080;
 
//to deploy so that it pass proxies
app.set('trust proxy', 1);

import cookieParser from "cookie-parser";
//todo rate Limiter 

import { limiter , authLimit } from "./middleware/RateLimit.js";
app.use(limiter);



app.use(cookieParser());
//todo connecting frontend and backend
import cors from "cors";
import { UseCors } from "./config/Cors.js";
app.use(cors(UseCors()));
app.use(helmet(
    {
    crossOriginOpenerPolicy: false
    }
));

//todo form handling

import path from "path";
app.set("view engine", "ejs");
app.set("views", path.resolve("./views")); 
app.use(express.json());
app.use(express.urlencoded({extended: false}));
//todo importing multer

//todo connecting database
import { dbConnect } from "./config/Database.js";
dbConnect();
 
import { User } from "./models/User.js";
import { Volunteer } from "./models/Volunteer.js";
// const deleteModel = async()=> {
//  console.log( "User deleted Successfully", await User.deleteMany({})  ) ;
//  console.log( "Volunteer deleted Successfully", await Volunteer.deleteMany({})  ) ;
// }
 
 await User.findOneAndUpdate({email: {$in:["knowmetechnical@gmail.com" , "admin@gmail.com"]} },
   { $set:{role: "admin"}}
 )
 await User.findOneAndUpdate({email: {$in:["ssr128979@gmail.com" , "volunteer@gmail.com"]} },
   { $set:{role: "volunteer"}}
 )
 await User.findOneAndUpdate({email: {$in:["rs1256046@gmail.com" , "user@gmail.com"]} },
   { $set:{role: "user"}}
 )  

 
//todo democredentials 

// email => admin@gmail.com , volunteer@gmail.com , user@gmail.com , 
//password => admin123 , volunteer123 , user123
//username => admin , volunteer , user
//verification code => 123456

// deleteModel()
// import ReportIssue from "./models/ReportIssue.js";
// console.log("volunteer data is ", await ReportIssue.find({}) );
// console.log("User data is ", await User.find({email: "rs1256046@gmail.com"}) );

//todo starting the function
import UploadRoutes from "./routes/UploadRoutes.js"
import AuthRouter from "./routes/UserAuthRoute.js";
import { reportAndVolunteer } from "./routes/ReportAndVolunteer.js";
import { razorRouter } from "./routes/RazorPay.js";

app.use("/api", UploadRoutes );
app.use("/api/auth", authLimit, AuthRouter);
app.use("/api/admin",authLimit, reportAndVolunteer );
app.use("/api/payment", razorRouter );

 

app.listen(PORT, ()=>{
    console.log("app is working on port " + PORT);
})
 
