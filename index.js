const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const port = 3000;


mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/Healthmenteedb", { useNewUrlParser: true }).then(console.log("connected to database!"));

const app = express();

app.set('view engine', 'ejs'); 



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// for doctor

const doctorSchema = new mongoose.Schema({
    fname : String,
    lname : String,
    email: String,
    password: String
    
})

const Doctor = mongoose.model("Doctor",doctorSchema);

// for Users

const userSchema = new mongoose.Schema({
    fname : String,
    lname : String,
    email: String,
    password: String
    
})

const User = mongoose.model("User",userSchema);



app.get("/", (req, res) => {
  res.sendFile(__dirname+"/public/index.html");
})



app.post("/signup",(req,res)=>{
    const type = req.body.fav_language;
    
    if (type == "User") {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            const user = new User({
                fname : req.body.fname,
                lname : req.body.lname,
                email : req.body.email,
                password : hash
            })
    
            user.save();
        });
        res.sendFile(__dirname+"/public/form.html");
        
    } else {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            const doctor = new Doctor({
                fname : req.body.fname,
                lname : req.body.lname,
                email : req.body.email,
                password : hash
            })
    
            doctor.save();
            
        });

        res.render("doctor",{doctor : req.body});
    }
    
    

    
})

app.post("/login",(req,res)=>{

    // console.log(req.body);
    

    Doctor.findOne({email : req.body.email }, (err,foundDoctor)=>{
        if (!err) {
            if (foundDoctor) {
                bcrypt.compare( req.body.password, foundDoctor.password, function(err, result) {
                    if (result) {
                        console.log("You are a Docctor "+foundDoctor.fname+" "+foundDoctor.lname);
                        res.render("doctor",{doctor : foundDoctor});
                    }
                    else{
                        console.log("wrong password");
                        
                    }
                });
            }
            else {
                User.findOne({email : req.body.email }, (err,foundUser)=>{
                    if (!err) {
                        if (foundUser) {
                            bcrypt.compare( req.body.password, foundUser.password, function(err, result) {
                                if (result) {
                                    console.log("user is present."+foundUser.fname+" "+foundUser.lname);
                                    
                                    res.sendFile(__dirname+"/public/form.html");
                                }
                                else{
                                    console.log("wrong password");
                                    res.sendFile(__dirname+"/public/login.html");
                                }
                            });
                        }
                        else {
                            console.log("user not found");
                            res.sendFile(__dirname+"/public/login.html");
            
                        }
                    }
                    else{
                        console.log("error to login")
                        console.log(err);
                        res.sendFile(__dirname+"/public/login.html");
                    }
                });

            }
        }
        else{
            console.log("error to login");
            console.log(err);
            res.sendFile(__dirname+"/public/login.html");
        }

        
    });

    
});



app.listen(port, function () {
  console.log("Server started on port 3000");
});