import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import userModel from '../models/user.model.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

export const register = async(req,res)=>{

    const {name, email, password} = req.body || {};

    if(!name || !email || !password){
        return res.json({
            success: false,
            message: 'Details are missing!!'
        })
    }

    try {

        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json({
                success:false,
                message: "Account already registered"
            })
        }
        
        const hashedPassword = await bcrypt.hash(password,10)

        const user = new userModel({name,email, password: hashedPassword})

        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.cookie('token',token,{
            httpOnly: true,
            secure: process.env.NODE_ENV==='production',
            sameSite: process.env.NODE_ENV==='production'? 'none': 'strict',
            maxAge: 7*24*60*60*1000
        })

        const mailOptions = {
            from: `"Shaurya Singh" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: "Welcome aboard — your account is ready",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            
                <h2 style="color: #111827; margin-bottom: 10px;">
                    Welcome, ${name}
                </h2>

                <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                    Thank you for signing up. Your account has been created successfully.
                </p>

                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    If you did not create this account, you can safely ignore this email.
                </p>

                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />

                <p style="font-size: 13px; color: #9ca3af; text-align: center;">
                    © 2026 Shaurya Singh. All rights reserved.
                </p>
            </div>`
        }

        await transporter.sendMail(mailOptions);

        return res.json({
            success:true
        })

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const login = async(req,res)=>{

    const { email, password } = req.body || {};

    if(!email || !password){
        return res.json({
            success: false,
            message: 'Email and Password are required'
        })
    }

    try {
        
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({
                success:false,
                message: "Invalid email"
            })
        }

        const isMatched = await bcrypt.compare(password, user.password);

        if(!isMatched){
            return res.json({
                success:false,
                message: "Invalid password"
            })
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})

        res.cookie('token',token, {
            httpOnly: true,
            secure: process.env.NODE_ENV==='production',
            sameSite: process.env.NODE_ENV==='production'? 'none': 'strict',
            maxAge: 7*24*60*60*1000
        })

        return res.json({
            success:true
        })

    } catch (error) {
        return res.json({success: false,
            message: error.message
        });
    }

}

export const logout = async(req,res)=>{
    try {

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV==='production',
            sameSite: process.env.NODE_ENV==='production'? 'none': 'strict',
            maxAge: 7*24*60*60*1000
        })

        return res.json({
            success: true,
            message: "Logged out successfully"
        })
        
    } catch (error) {
        return res.json({success: false,
            message: error.message
        })
    }
}

export const sendVerifyOtp = async (req,res)=>{
    try {
        
        const userId = req.userId

        const user = await userModel.findById(userId);

        if(!user){
            return res.json({
                success: false,
                message: "User not found"
            })
        }

        if(user.isAccountVerified){
            return res.json({
                success: false,
                message:" Account already verified"
            })
        }

        const otp = String(Math.floor(100000+Math.random()*900000))

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 1 * 60 * 60 * 1000

        await user.save();

        const mailOption = {
            from: `"Shaurya Singh" <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: "Verify your email address",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            
                    <h2 style="color: #111827; margin-bottom: 10px;">
                     Email Verification
                     </h2>

                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                       Hi ${user.name},
                    </p>

                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                        Please use the following OTP to verify your email address.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #111827; background: #f3f4f6; padding: 15px 25px; border-radius: 10px;">
                            ${otp}
                        </span>
                    </div>

                    <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                        This OTP will expire in <strong>1 hour</strong>.
                    </p>

                    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                        If you did not request this verification, you can safely ignore this email.
                    </p>

                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />

                    <p style="font-size: 13px; color: #9ca3af; text-align: center;">
                        © 2026 Shaurya Singh. All rights reserved.
                    </p>
                </div>    `
        }

        await transporter.sendMail(mailOption)

        res.json({
            success: true,
            message: 'Verification OTP sent on email'
        })

    } catch (error) {
        return res.json({success: false,
            message: error.message
        })
    }
}

export const verifyEmail = async (req,res)=>{
    
    const { otp } = req.body || {};
    const userId = req.userId;

    if(!userId || !otp){
        return res.json({
            success: false,
            message: "Missing Details"
        })
    }

    try {
        
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({
                success: false,
                message: "User not found"
            })
        }

        if(user.verifyOtp==='' || user.verifyOtp !== otp){
            return res.json({
                success: false,
                message: "Invalid OTP"
            })
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({
                success: false,
                message: "OTP Expired"
            })
        }

        user.isAccountVerified = true;

        user.verifyOtp=''
        user.verifyOtpExpireAt=0;

        await user.save();
        
        return res.json({
            success: true,
            message: "Email verified successfully"
        })

    } catch (error) {
        return res.json({success: false,
            message: error.message
        })
    }

}

export const isAuthenticated = async(req,res)=>{
    try {
        return res.json({success: true,
            message: "User is authenticated"
        })
    } catch (error) {
        return res.json({success: false,
            message: error.message
        })
    }
}

export const sendResetOtp = async (req,res)=>{
    const {email} = req.body || {}

    if(!email){
        return res.json({
            success: false,
            message: 'Email is required'
        })
    }

    try {
        
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false,
            message: "User not found"
            })
        }

        const otp = String(Math.floor(100000+Math.random()*900000))

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
        
        await user.save();

        const mailOption = {
            from: `"Shaurya Singh" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: "Reset your passsword",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            
                    <h2 style="color: #111827; margin-bottom: 10px;">
                     Password Reset
                     </h2>

                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                       Hi ${user.name},
                    </p>

                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                        Please use the following OTP to reset your password.
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #111827; background: #f3f4f6; padding: 15px 25px; border-radius: 10px;">
                            ${otp}
                        </span>
                    </div>

                    <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                        This OTP will expire in <strong>15 min</strong>.
                    </p>

                    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                        If you did not request this verification, you can safely ignore this email.
                    </p>

                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />

                    <p style="font-size: 13px; color: #9ca3af; text-align: center;">
                        © 2026 Shaurya Singh. All rights reserved.
                    </p>
                </div>    `
        }

        await transporter.sendMail(mailOption)

        res.json({
            success: true,
            message: 'Reset OTP sent on email'
        })

    } catch (error) {
        return res.json({success: false,
            message: error.message
        })
    }

}

export const resetPassword = async (req,res)=>{

    const {email,otp, newPassword} = req.body || {}

    if(!email || !otp || !newPassword){
        return res.json({
            success: false,
            message: "Email, OTP and new Password are required"
        })
    }

    try {
        
        const user = await userModel.findOne({email})

        if(!user){
            return res.json({
            success: false,
            message: "User not found"
            })
        }

        if(user.resetOtp==="" || user.resetOtp!== otp){
            return res.json({
            success: false,
            message: "Invalid OTP"
            })
        }

        if(user.resetOtpExpireAt<Date.now()){
            return res.json({
            success: false,
            message: "OTP Expired"
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        user.password = hashedPassword
        user.resetOtp=""
        user.resetOtpExpireAt=0

        await user.save();

        return res.json({
            success: true,
            message: "Password has been reset successfully"
        })

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}