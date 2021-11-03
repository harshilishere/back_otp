const User = require('./../models/user');
const jwt = require('jsonwebtoken');
const {SECRET_KEY}=require('./../config');
const {SENDGRID_API_KEY}=require('./../config');
const {JWT_ACC}=require('./../config');
const {RESET_PASS}=require('./../config');
const {CLIENT_URL}=require('./../config');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(SENDGRID_API_KEY)
const _ = require('lodash');

exports.register = async(req, res, next)=>{
	const{firstName,lastName,email,password} = req.body;
	const user = await User.findOne({email});
	if(user)
		return res.status(403).json({error:{message:"Email already in user"}});
	try{
		//await newUser.save();
		//const token = getSignedToken(newUser);
		//const token = jwt.sign({firstName,lastName,email,phone,password},JWT_ACC,{expiresIn:'20m'})
		const otp=generateOTP()
		function generateOTP() { 
			// Declare a digits variable  
			// which stores all digits 
			var digits = '0123456789'; 
			let OTP = ''; 
			for (let i = 0; i < 6; i++ ) { 
				OTP += digits[Math.floor(Math.random() * 10)]; 
			} 
			return OTP; 
		} 
		
		let newUser = new User({firstName,lastName,email,password,otp});
			newUser.save((err,success)=>{
				if(err){
					console.log("error in new user: ",err);
					return res.status(400).json({error:"error in db"})
				}
			});
		const msg = {
			to: email, // Change to your recipient
			from: 'harshil@keylogicautomations.com', // Change to your verified sender
			subject: 'Email activation',
			html: `<strong>Just a verification OTP </strong>
					<p>${otp}</p>`,
		  }
		  sgMail
			.send(msg)
			.then(() => {
			  console.log('Email sent')
			})
			.catch((error) => {
			  console.error(error)
			})
		//const token = jwt.sign({firstName,lastName,email,phone,password},JWT_ACC,{expiresIn:'20m'})
		res.status(200).json("We have sent a verification otp Please verify.");
	}catch(error){
		error.status=400;
		next(error);
	}
};

exports.activate=(req,res,next)=>{
	const {otp}=req.body;
	if(otp){
		/*jwt.verify(otp,RESET_PASS,function(err,decodeddata){
			if(err){
				return res.status(401).json({
					error: "Incorrect token or token expired"
				})
			}*/			
			User.findOne({otp},(err,user)=>{
				if(err||!user){
					return res.status(400).json({error:"User with this email does not exists"})
				}
				const obj = {
					verified: true,
					otp:''
				}
				user = _.extend(user,obj);
				user.save((err,result)=>{
					if(err){
						return res.status(400).json({error:"reset pass error"});
					}else{
				   
				   res.status(200).json("Email verified!");
					}

				})
			})
		
	}else{
		return res.status(401).json({error:"Authentication error"})
	}
};

exports.forgotpass=async(req,res,next)=>{
	const{email}= req.body;
	const user = await User.findOne({email});
	if(!user)
		return res.status(403).json({error:{message:"User with this email does not exist"}});
	try{
		//const token = jwt.sign({_id: user._id},RESET_PASS,{expiresIn:'20m'})
		function generateOTP() { 
			// Declare a digits variable  
			// which stores all digits 
			var digits = '0123456789'; 
			let OTP = ''; 
			for (let i = 0; i < 6; i++ ) { 
				OTP += digits[Math.floor(Math.random() * 10)]; 
			} 
			return OTP; 
		} 
		const ootp = await generateOTP();
		const msg = {
		to: email, // Change to your recipient
		from: 'harshil@keylogicautomations.com', // Change to your verified sender
		subject: 'OTP for Password reset',
		html: `	<h2>OTP is ${ootp}</h2>`,
				//for future reference <p>${CLIENT_URL}/${token}</p>
		 }
		 return user.updateOne({otp:ootp},function(err,success){
			
			 if(err){
				 return res.status(400).json({error:"reset pass link error"});
			 }else{
				sgMail
				.send(msg)
				.then(() => {
				  
				})
				.catch((error) => {
				  console.error(error)
				})
			
			res.status(200).json("sent you an OTP over email");
			 }
		 })}
		 catch(error){
			error.status=400;
			next(error);
		}
};

exports.resetpass=async(req,res,next)=>{
	const {otp,newpass}=req.body;
	//const user = await User.findOne({otp});
	
	if(otp){
		/*jwt.verify(otp,RESET_PASS,function(err,decodeddata){
			if(err){
				return res.status(401).json({
					error: "Incorrect token or token expired"
				})
			}*/			
			User.findOne({otp},(err,user)=>{
				if(err||!user){
					return res.status(400).json({error:"User with this otp does not exists"})
				}
				const obj = {
					password: newpass,
					otp:''
				}
				user = _.extend(user,obj);
				user.save((err,result)=>{
					if(err){
						return res.status(400).json({error:"reset pass error"});
					}else{
				   
				   res.status(200).json("pass changed");
					}

				})
			})
		
	}else{
		return res.status(401).json({error:"Authentication error"})
	}

};

exports.login=async(req,res,next)=>{
	const {email,password}=req.body;
	const user = await User.findOne({email});
	if(!user)
		return res.status(403).json({error:{message:'invalid loginid/pass'}});
	const isValid = await user.isPasswordValid(password);
	if(!isValid)
		return res.status(403).json({error:{message:'invalid loginid/pass'}});
	const token = getSignedToken(user);
	console.log(token);
	res.status(200).json({token});
};

exports.logout=async(req,res,next)=>{
	res.cookie('jwt','',{maxAge:1});
	res.redirect('/');
};


getSignedToken = user => {
	return jwt.sign({
		id: user._id,
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName
	},SECRET_KEY,{expiresIn:'24h'});
};

getRegSignedToken = user => {
	return jwt.sign({
		id: user._id,
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName
	},JWT_ACC,{expiresIn:'24h'});
};