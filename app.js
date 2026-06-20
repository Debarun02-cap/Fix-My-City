//Core Module
const path=require('path')

//External Module
const express=require('express');
const session=require('express-session');

//Local Module 
const {ur, registeredComplaints}=require('./routes/user');
const ar=require('./routes/admin');
const ir=require('./routes/auth');
const imageRoutes=require('./routes/images');
const {dbConnect}=require('./utils/databaseUtil');

const app=express();

app.set('view engine','ejs')

// Static files (css/images) served from /public
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
// Session middleware for login state
app.use(session({
  secret:'fixmycity-secret',
  resave:false,
  saveUninitialized:false
}));

// Make login info available to all views
app.use((req,res,next)=>{
  res.locals.isLoggedIn = !!req.session.user;
  res.locals.userRole = req.session.user ? req.session.user.role : null;
  res.locals.currentUserId = req.session.user ? req.session.user.id : null;
  next();
});
app.use(ir);
app.use('/admin',ar);
app.use('/user',ur);
app.use(imageRoutes);

const port=3000;
dbConnect(()=>{
  app.listen(port,()=>{  
    console.log("MongoDB connection successful");
    console.log(`Server is running on http://localhost:${port}`);
  });
});
