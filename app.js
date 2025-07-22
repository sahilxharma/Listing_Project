if(process.env.NODE_ENV !="production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsMate=require('ejs-mate');
const path = require("path");
const methodOverride = require("method-override");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport = require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const reviewsRouter=require("./routes/review.js");
const listingsRouter=require("./routes/listing.js");
const userRouter=require("./routes/user.js");


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dburl=process.env.ATLASDB_URL

//mangoose ko yaha bulaya gaya h by main function database se connect krne k liye
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dburl);
}
////////////////////////////////////////////////////////////
app.set("view engine", "ejs");   //engine set krna padta h yaha se
app.set("views", path.join(__dirname, "views"));       //isko ejs ya html access k liye late h
app.use(express.urlencoded({ extended: true }));   // isko parse krne k liye bnate h jaise req.body.username lana ho toh
app.use(methodOverride("_method")); //isko put ya patch reuest k liye bnate h delete bhi included h
app.engine('ejs',ejsMate);  // ye boiler plate k loiye inport kiya h
app.use(express.static(path.join(__dirname,"/public"))); //yaha css k liye ye bulaya h


const store=MongoStore.creat({
  mongoUrl:dburl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter: 24*3600,       //ye login reh session change na ho refresh kre baad

});

store.on("error",()=>{
  console.log("err in mongo session",err);
})

const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  }
}



app.use(session(sessionOptions));
app.use(flash());


//login khtar authenticate kran khatr
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})

app.use('/listings',listingsRouter);
app.use('/listings/:id/reviews',reviewsRouter)
// we need to merge params to access id in review.js .
app.use("/",userRouter);

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });


//ye kaam na kr riiiii
// app.use("*",(req,res,next)=>{
//   next(new ExpressError(404,"page not found!"));
// });

// sabko wrapAsync error m dalde taki kiska error na aaye sabhi routes m daalde
app.use((err,req,res,next)=>{
  let {statusCode=500,message="something went wrong"}=err;
  res.status(statusCode).render("listings/error.ejs", {err});//can also add some bootstrap alerts for  [error ]
  next(err);
})



app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
