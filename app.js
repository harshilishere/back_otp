const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/user');
const auth = require('./middleware/auth');
const {MONGODB}= require('./config');
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/',(req,res,next)=>res.end('welcome!'));
app.post('/', (req, res,next) => { 
  var s= req.body.test;
  res.send("You posted: "+s) 
}) 


app.use('/',userRoutes);


app.use((req,res,next)=>{
	const err = new Error('not found');
	err.status=404;
	next(err);
});

app.use((err,req,res,next)=>{
	const status = err.status || 500;
	res.status(status).json({error:{message:err.message}});
});

mongoose.connect(MONGODB,{useNewUrlParser:true,useUnifiedTopology: true })
.then(()=>{
	console.log('connected to mongodb');
	return app.listen(3300);
})
.then(()=>console.log('server running'))
.catch(err=> console.log(err.message));
mongoose.set('useCreateIndex', true);
