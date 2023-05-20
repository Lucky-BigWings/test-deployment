// const nodemailer = require('nodemailer');
// const userModel = require('../models/userModel');
// const otpGen = require("otp-generator");
// const bcrypt = require('bcrypt')
// const jwt = require('jsonwebtoken')
// // const { isValidEmail } = require('../middlewares/validator');

// const userVerification = require('../models/verificationModel')
// const {v4: uuidv4} = require('uuid')
// const dotenv = require('dotenv')
// dotenv.config()

// // ============================ Generate OTP ============================

// const signup = async (req, res) => {
//     try {
//         const data = req.body;
//         const { name, email, password } = data

//         if (!name) {
//             return res.status(400).send({ status: false, message: "Please provide name" });
//         };

//         if (!email) {
//             return res.status(400).send({ status: false, message: "Please provide email" });
//         };

//         if (!password) {
//             return res.status(400).send({ status: false, message: "Please provide password" });
//         };

//         // if (!isValidEmail(data.email)) {
//         //     return res.status(400).send({ status: false, message: "Invalid email" });
//         // };

//         const userExist = await userModel.findOne({ email: email })

//         if (userExist) {
//             return res.status(400).send({ status: false, message: "user already exist" });
//         }

//         const encryptPassword = await bcrypt.hash(data.password, 10);
//         data.password = encryptPassword;

//         const newUser = new User({
//             name,
//             email,
//             password
//         })

//         newUser.save()
//         .then((result) => {
//             sendVerificationEmail(result, res)
//         })
//         .catch((error) => {
//             return res.status(400).send({ status: false, error: error.message });
//         })

//         // const user = await userModel.create(data)
//         // return res.status(201).send({ status: true, message: user });

//     } catch (error) {
//         return res.status(500).send({ status: false, error: error.message });
//     };
// };

// const sendVerificationEmail = ({ _id, email }, res) => {
//     const currentUrl = "http://localhost:4000/";
//     const uniqueString = uuidv4 + _id;

//     const mailOptions = {
//         from: process.env.SMTP_MAIL,
//         to: email,
//         subject: 'Verify Your Email',
//         html: `<p>Verify your email address to complete the signup and login to your account.</p><p>This link<b> expires in 6 hours</b>.</p><p>Press <a href=${
//             currentUrl + "user/verify/" + _id + "/" + uniqueString
//         }>here</a>to proceed.</p>`,
//     };

//     bcrypt.hash(uniqueString, 10)
//     .then((hashedUniqueString) => {
//         const newVerification = new userVerification({
//             userId: _id,
//             uniqueString: hashedUniqueString,
//             createdAt: Date.now(),
//             expiresAt: Date.now() + 21600000,
//         })

//         newVerification.save()
//         .then(()=>{
//             transporter.sendMail(mailOptions)
//             .then(()=>{
//                 return res.status(400).send({ status: false, message: "verification email sent" });
//             })
//             .catch((error)=>{
//                 console.log(error);
//                 return res.status(400).send({ status: false, message: "verification email failed" });
//             })
//         })
//         .catch((error)=>{
//             console.log(error);
//             return res.status(400).send({ status: false, message: "couldn't save verification email data" });
//         })
//     })
//     .catch(()=>{
//         return res.status(400).send({ status: false, message: "error occured while hashing email data" });
//     })
// }

// // ============================= Verify OTP ==============================

// const signIn = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).send({ status: false, message: "Please enter email & password" });
//         };

//         // if (!isValidEmail(email)) {
//         //     return res.status(400).send({ status: false, message: "Invalid email" });
//         // };

//         // if (!isValidPassword(password)) {
//         //     return res.status(400).send({ status: false, message: "Password must have 8 to 15 characters with at least one lowercase, uppercase, numeric value and a special character" });
//         // };

//         const userExist = await userModel.findOne({ email: email });

//         if (userExist) {
//             const verifyPassword = await bcrypt.compare(password, userExist.password);

//             if (!verifyPassword) {
//                 return res.status(400).send({ status: true, message: "wrong password" });
//             };

//             const token = jwt.sign(
//                 {
//                     userId: userExist._id,
//                 },
//                 "my-secret-key",
//                 { expiresIn: "9h" }
//             );

//             return res
//                 .status(200)
//                 .cookie('token', token, { expires: new Date(Date.now() + 86400000) })       // expires in 1 day
//                 .send({ status: true, message: token });
//         } else {
//             return res.status(404).send({ status: true, message: "user not found" });
//         };

//     } catch (error) {
//         return res.status(500).send({ status: false, error: error.message });
//     };
// }

// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: false,
//     auth: {
//         user: process.env.SMTP_MAIL,
//         pass: process.env.SMTP_PASSWORD
//     }
// });

// transporter.verify((error,success) => {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log("Ready for message");
//         console.log(success);
//     }
// })

// module.exports = { signup, signIn };













const userModel = require('../models/userModel');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    // Extract user data from request body
    const { email, password } = req.body;

    // Create a new user object
    const newUser = new userModel({
      email,
      password,
      verifiedUser: false // Set verifiedUser as false initially
    });

    // Save the user to the database
    await newUser.save();

    // Send verification email
    sendVerificationEmail(newUser.email);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send verification email
const sendVerificationEmail = async (email) => {
  try {
    // Generate a verification token (you can use any token generation method)
    const verificationToken = jwt.sign(
      {
        userId: email,
      },
      'my-secret-key',
      { expiresIn: '9h' }
    );

    // Save the token to the user's document in the database
    const user = await userModel.findOneAndUpdate( { email: email }, {$set: { verificationToken: verificationToken }}, { new: true } );

    if (!user) {
      console.log('User not found');
      return;
    }

    // Create a transporter for sending emails
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Create the email content
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: 'Account Verification',
      html: `
        <p>Hello,</p>
        <p>Thank you for registering. Please click the following link to verify your account:</p>
        <p><a href="http://localhost:4000/verify/${verificationToken}">Verify Account</a></p>
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.response);
  } catch (error) {
    console.log('Error sending verification email:', error);
  }
};

const verify = async (req, res) => {
    try {
      const { token } = req.params;
  
      // Find the user by verification token
      const user = await userModel.findOne({ verificationToken: token });
  
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update verifiedUser to true
      user.verifiedUser = true;
      user.verificationToken = undefined;
      await user.save();
  
      res.json({ message: 'Account verified successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

module.exports = { register, verify };
