
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import { transporter } from "../config/Nodemailer.js";
import { sendEmail } from "../config/sendEmail.js";
import { oauth2client } from "../config/GoogleConfig.js";
import axios from 'axios';
dotenv.config();
const Register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Details incomplete" });
  }
  let user = await User.findOne({ email });
  if (user) {
    return res.json({ success: false, message: "User Already exist" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: name,
      email: email,
      password: hashedPassword,

    })

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: 24 * 60 * 60 * 1000, });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    })
    if (email != "admin@gmail.com" && email != "volunteer@gmail.com" && email != "user@gmail.com") {
      try {
        //  await transporter.sendMail({
        //       from: process.env.SENDER_EMAIL,
        //            to: email,
        //            subject: 'Welcome in My website',
        //            text: `Welcome in my world. Your accound created successfully using email id ${email} `
        //   })

        sendEmail(
          email,
          "Welcome in My Website",
          `Welcome in my world. Your account created successfully using email id ${email}`
        );

      }

      catch (err) {
        console.log(" Brevo email error ", err);
      }
    }
    else {
      return res.json({ success: true, message: "Your demo account created successfully " });
    }

    console.log("Email Sent successfully");

    return res.json({ success: true, message: "You registered successfully" });
  }
  catch (err) {
    return res.json(err.message);
  }

}

const Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "Some information missing!" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: " Account doesn't exist " });
  }
  try {
    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.json({ success: false, message: "Wrong password" });
    }
    const token = await jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: 24 * 60 * 60 * 1000, })
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production') ? 'none' : 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    })
    console.log(user);
    return res.json({ success: true, message: "You logged in successfully" });

  }
  catch (err) {
    return res.json({ success: false, message: `Login related problem ${err.message}` });
  }

}

const Logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production') ? 'none' : 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    })
    return res.json({ success: true, message: "Meet me soon" })
  }
  catch (err) {
    return res.json({ success: false, message: `logout err ${err.message}` });
  }
}

const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User Not found" });
    }
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" })
    }

    const Otp = Math.floor(100000 + Math.random() * 900000).toString();
    //  await user.save();
    if (user.email != "admin@gmail.com" && user.email != "volunteer@gmail.com" && user.email != "user@gmail.com") {
      user.emailVerifyOtp = Otp;
      //  const mailOptions = {
      //    from: process.env.SENDER_EMAIL,
      //     to: user.email,
      //     subject: 'Account Verification Otp',
      //     text: `Verification Otp is ${Otp}. Verify your account using `
      //  }  
      try {
        //  await transporter.sendMail(mailOptions);
        sendEmail(
          user.email,
          " Email Verification Otp",
          `Email Verification Otp is  ${Otp}`
        );

      }


      catch (err) {
        console.log("Breve email setup error ", err);
      }

    }
    else {
      user.emailVerifyOtp = '123456';
      user.emailVerifyOtpExpireAt = Date.now() + 15 * 60 * 1000;
      await user.save();
      return res.json({ success: true, message: "Your demo Otp is 123456 " });

    }
    user.emailVerifyOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();
    //  console.log(user.verifyOtp);
    return res.json({ success: true, message: "Otp sent successfully" });
  }
  catch (err) {
    console.log("SendVerifyOtp err", err);
    return res.json({ success: false, message: err.message })
  }
}
const verifyEmail = async (req, res) => {
  const { userId } = req.user;
  const { Otp } = req.body;
  console.log(Otp);
  if (!userId || !Otp) {
    return res.json({ success: false, message: "Missing details" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "user not found" });
    }
    console.log("verify Otp is ", Otp, "reserved Otp is", user.emailVerifyOtp);
    if (user.emailVerifyOtp === '' || user.emailVerifyOtp !== Otp) {
      return res.json({ sucess: false, message: "Invalid Otp" });
    }
    if (user.emailVerifyOtpExpireAt < Date.now()) {
      return res.json({ success: true, message: "Otp expired" });
    }
    user.isAccountVerified = true;
    user.emailVerifyOtp = '';
    user.emailVerifyOtpExpireAt = 0;
    await user.save();
    return res.json({ success: true, message: "Email verified Successfully" });
  }
  catch (err) {
    console.log("verifyEmail error is :", err);
  }
}


//todo Sending resetPassword otp

const resetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    console.log(user);
    const Otp = Math.floor(100000 + Math.random() * 900000).toString();
    //  const mailOptions = {
    //     from : process.env.SENDER_EMAIL,
    //     to: email,
    //     subject: " Reset Password Otp",
    //     text: ` You reset password Otp is ${Otp}, Enter to reset password  `
    //  }

    try {
      // await transporter.sendMail(mailOptions);
      sendEmail(
        email,
        "Reset Password Otp",
        `Your reset password is  ${Otp}`
      );

    }
    catch (err) {
      console.log("Nodemailer setup error ", err);
    }

    user.forgetPasswordOtp = Otp;
    user.forgetPasswordOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();
    return res.json({ success: true, message: "Reset Otp sent successfully" });
  }
  catch (err) {
    return res.json({ success: false, message: err.message })
  }

}

//Handling reset Password 

const resetPassword = async (req, res) => {
  const { email, Otp, password, confirmPassword } = req.body;
  if (!email || !Otp || !password || !confirmPassword) {
    return res.json({ success: false, message: "Missing Information" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: "User not Found " });
  }
  console.log("user reset" + user.forgetPasswordOtp + "Otp is" + Otp);
  if (user.forgetPasswordOtp === '' || user.forgetPasswordOtp !== Otp || user.forgetPasswordOtpExpireAt < Date.now()) {
    return res.json({ success: false, message: "Otp not valid, request a new Otp" });
  }

  if (password !== confirmPassword) {
    return res.json({ success: false, message: "Password and confirmPassword mismatch" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetOtp = '';
  user.resetOtpExpireAt = 0;
  await user.save();
  return res.json({ success: true, message: "Congratulations Your password get changed successfully" });

}

//todo get Users Data
const getUserData = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("get user Data ", userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "user not exist" });
    }
    console.log(user);
    const userData = {
      name: user.name,
      email: user.email,
      isAccountVerified: user.isAccountVerified,
      role: user.role,
    }
    return res.json({ success: true, data: userData });
  }
  catch (err) {
    return res.json({ success: false, message: err.message });
  }
}

//todo Google Login

const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);
    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)
    const { email, name } = userRes.data;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name,
        email: email
      })
      console.log(user);

      const id = user._id;
      // creating tokens 
      const token = jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '24h', });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production') ? 'none' : 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      })


      try {
        //   await transporter.sendMail({
        //  from: process.env.SENDER_EMAIL,
        //       to: email,
        //       subject: 'Welcome in My website',
        //       text: `Welcome in my world. Your account created successfully using email id ${email} `
        //  })
        sendEmail(
          email,
          "Welcome in My website",
          ` Welcome in my world. Your account created successfully using email id  ${email}`
        );
      }
      catch (err) {
        console.log("Nodemailer setup error ", err);
      }

      console.log("Email Sent successfully");

      return res.json({ success: true, message: "You registered successfully", token: token, user: user });
    }

    const id = user._id;
    // creating tokens 
    const token = jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '24h', });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (process.env.NODE_ENV === 'production') ? 'none' : 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    })

    return res.json({
      success: true, token: token, user: user, message: "Logged in successfully",
    })
  }
  catch (err) {
    return res.json({
      success: false,
      message: "some error in google login",
      err: err,
    })
  }
}


export { Register, Login, Logout, getUserData, resetPassword, resetPasswordOtp, verifyEmail, sendVerifyOtp, googleLogin };