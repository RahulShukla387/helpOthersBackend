import { User } from "../models/User.js";
import { Volunteer } from "../models/Volunteer.js";
import { transporter } from "../config/Nodemailer.js";
import { sendEmail } from "../config/sendEmail.js";
import dotenv from "dotenv";
import ReportIssue from "../models/ReportIssue.js";
dotenv.config();
const requestVolunteer =  async(req, res)=>{
    if (!req.user || !req.user.userId) {
  return res.json({
    success: false,
    message: "Unauthorized"
  });
}
    const { contactNo, reason } = req.body;
    const {userId} = req.user;
    const user = await User.findById(userId);
      console.log("check 1");
    if(!user){
        return res.json({success: false, message: "user not found" })
    }
    if(!user.isAccountVerified){
        return res.json({success: false, message: "Account not verified, please verify it"})
    }
    if(!contactNo || contactNo.length != 10 ){
        return res.json({success: false, message: "missing information"});
    }
    if(user.role === "volunteer"){
        return res.json({success: false, message: "You are already volunteer"});
    }
    if(user.isRequestedForVolunteer == true){
        return res.json({success: false, message: "You had already requested for volunteer"});
    }
    console.log("check 2");
    // console.log( user.isRequestedForVolunteer )
    try{
    const data = {
        contactNo: contactNo,
        reason: reason,
        relatedId: userId
    }
    const volunteer = await Volunteer.create(data);
    user.isRequestedForVolunteer = true;
    await user.save();
    return res.json({success: true, message: "You had successfully requested for volunteer" })

    }
    catch(err){
        res.json({success: false, message: `Volunteer err is ${ err.message } ` })
    }

}

const acceptVolunteer = async(req, res)=>{
   const {userId} = req.params; 
   const {volunteerId} =  req.body; 
   console.log(`User id is ${userId} and volunteer id is ${volunteerId} `) 
   const user = await User.findById(userId);
   if(!user){
    return res.json({success: false, message: "User not exist"});
   }  
   try{
      user.role = "volunteer";
      user.isRequestedForVolunteer = false; 
     let newUser = await user.save();
     try{
       const deletedUser =  await Volunteer.deleteOne({_id: volunteerId });
       console.log("user deleted successfull", deletedUser);

     }
     catch(err){

       return res.json({success: false, message: `User not deleted ${err.message}`});
     }
    //  await transporter.sendMail({
    //          from: process.env.SENDER_EMAIL,
    //           to: newUser.email,
    //           subject: " You are now Volunteer ",
    //           text: ` Congratulation You are now Promoted to Volunteer `
    //  })
      await sendEmail(
              newUser.email,
              "You are now Volunteer",
              ` Congratulation You are now Promoted to Volunteer`
            );
     return res.json({success: true, message: " You had accepted Volunteer request " })
   }
  catch(err){
    return res.json({ success: false, message: ` Accept volunteer Err =>  ${err.message} `   });
  }
     
}
const rejectVolunteer = async(req, res)=>{
   const {userId} = req.params;  
   const{volunteerId}  = req.body;
   const user = await User.findById(userId);
   if(!user){
    return res.json({success: false, message: "User not exist"});
   }  
   try{
     user.isRequestedForVolunteer = false; 
     let newUser = await user.save();
      
       try{
       const deletedUser =  await Volunteer.deleteOne({_id: volunteerId });
       console.log("user deleted successfull", deletedUser);

     }
     catch(err){

       return res.json({success: false, message: `User not deleted ${err.message}`});
     }

    //    await transporter.sendMail({
    //          from: process.env.SENDER_EMAIL,
    //           to: newUser.email,
    //           subject: " Rejected the request of Volunteer ",
    //           text: ` Sorry your request got rejected try later  `
    //  })
    await sendEmail(
              newUser.email,
              "Rejected the request of volunteer",
              `  Sorry your request got rejected try later`
            );
     return res.json({success: true, message: " You had rejected the volunteer request " });
   }
  catch(err){
    return res.json({ success: false, message: ` reject volunteer Err =>  ${err.message} `   });
  }

}

const getVolunteerData = async(req, res)=>{
    const volunteerData = await Volunteer.find({});
    res.json({success: true, message: "data fetched successfully ", data: volunteerData});
} 
const markReadVolunteer = async(req, res)=>{
   const {volunteerId} = req.params;
   const user = await Volunteer.findById(volunteerId);
   if(!user ){
    res.json({success: false, message: "user not found"});
   }
   try{
     user.markReadVolunteer = true;
     await user.save();
     return res.json({success: true, message: "User marked as read"});
   }
   catch(err){
    return res.json({success: false, message: ` mark read error is  ${err.message} `});
   }
} 

const viewVolunteer = async(req, res)=>{
  
  try{
  const {userId} = req.params;
  const user = await User.findById(userId);
  if(!user){
    return res.json({success: false, message: "User not found"});
  }
   
  return res.json({success: true, message: "data fetched successfully", data: user});

}
catch(err){
 return res.json({success: false, message: ` view Volunteer error is  ${err.message} `});
}

}



//todo Get Reoport data

const isReadReport = async (req, res)=>{
  const {id} = req.params;
  try{
     let report = await ReportIssue.findById(id);
     if(!report){
      return ({success: false, message: "No report exist"})
     }
     if(report.isMarkedRead === true){
      return res.json({success: false, message: "You already had viewed this report"})
     }

     report.isMarkedRead = true;
     await report.save();
     return res.json({success: true, message: "You marked it as read "})
  }
  catch(err){
    return res.json({success: false, message: "some problem in isReadReport" })
  }
 

}
const isSolvedReport = async (req, res)=>{
  
  const {id} = req.params;
  try{
    const report = await ReportIssue.findById(id);
    if(!report){
      return res.json({success: false, message: "Report not exist"})
    }
    await ReportIssue.findByIdAndDelete(id);
    return res.json({success: true, message: "Team had solved the problem"})
  }
  catch(err){
    return res.json({success: false, message: "some error occured"})
  }

}

const getReportData = async(req, res)=>{
   console.log("check 1");
    try{
      const report = await ReportIssue.find({});
      if(!report){
        return res.json({success: false, message: "Report not exist"});
      }
      return res.json({success: true, message: "successfully fetched", data: report })
    }
    catch(err){
      return res.json({success: false, message: `Error in getting report data ${err.message}`});
    }
}

const  NotificationCountAdmin = async (req, res) => {
  try{
    const countVol = await Volunteer.countDocuments({
    markReadVolunteer: false,
  });
    
  const countReport = await ReportIssue.countDocuments({
    isMarkedRead: false,
  })
   
  return res.json({
    success: true, message: "successfully fetched the count", data: {
      countReport: countReport, countVol: countVol
    }
  })

  }
  catch(err){
    return res.json({
      success: false, message: err.message
    })
  }
 

}
const  NotificationCountVolunteer = async (req, res) => {
  try{
    
  const countReport = await ReportIssue.countDocuments({
    isMarkedRead: false,
  })
   
  return res.json({
    success: true, message: "successfully fetched the count", data: {
      countReport: countReport
    }
  })

  }
  catch(err){
    return res.json({
      success: false, message: err.message
    })
  }
 

}
  


export {requestVolunteer, acceptVolunteer, rejectVolunteer , getVolunteerData, markReadVolunteer , viewVolunteer, isReadReport, isSolvedReport, getReportData, NotificationCountAdmin, NotificationCountVolunteer }