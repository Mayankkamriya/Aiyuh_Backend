// import bcrypt from "bcrypt";
// import OTPModel from "../../models/otp.model.js";
import { transporter } from "../../infrastructure/email/EmailSender.js";
// import userModel from "../../models/user.model.js"; 
import otpStore from "./otpStore.js";

export const sendOTP = async (email, userData) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        // Store OTP in memory with 10-minute expiry
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
            userData
        });

        const mailStruct = {
            from: process.env.EMAIL,
            to: email,
            subject: "Verify Your Email",
            html: `<p>Your OTP is <b>${otp}</b> to verify your email by - Mayank Kamriya</p>
                   <p>OTP is valid for 10 minutes.</p>`,
        };

        // Uncomment this in production
        await transporter.sendMail(mailStruct);

        // console.log(`OTP sent successfully to ${email}: ${otp}`);
    } catch (e) {
        console.error("Error in sendOTP function:", e);
        throw new Error("Failed to send OTP");
    }
};


// export const sendOTP = async (email) => {
//     try {
//         const user = await userModel.findOne({ email });
//         const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

//         const hashedOTP = await bcrypt.hash(otp, 4);

//         const mailStruct = {
//             from: process.env.EMAIL,
//             to: email,
//             subject: "Verify Your Email",
//             html: `<p>Your OTP is <b>${otp}</b> to verify the email by - Mayank Kamriya</p>
//                    <p>OTP is valid for 1 Hour.</p>`,
//         };

//         if (!user) {
//             await OTPModel.create({
//                 _id: user._id,
//                 otp: hashedOTP,
//                 createdAt: Date.now(),
//                 expiresAt: Date.now() + 3600000, // 1 Hour
//             });
//         } else {
//             await OTPModel.updateOne(
//                 { _id: user_id },
//                 {
//                     otp: hashedOTP,
//                     createdAt: Date.now(),
//                     expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
//                 },
//                 { upsert: true }
//             );
//         }

//         // Send OTP via email
//         // await sendEmail(email, mailStruct.subject, "", mailStruct.html);
//         console.log(`OTP sent successfully to ${email} and you ${otp}`);
//         // await transporter.sendMail(mailStruct); // please uncomment it 

//     } catch (e) {
//         console.error("Error in sendOTP function:", e);
//         throw new Error("Failed to send OTP");
//     }
// };
