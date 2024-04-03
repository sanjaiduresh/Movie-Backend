import express from "express";
import { MongoClient } from 'mongodb';
import cors from "cors";
import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";

const app=express();
const url="mongodb+srv://sanjai:sanjai123@movies.vcowzfe.mongodb.net/?retryWrites=true&w=majority&appName=movies"
const client= new MongoClient(url);
await client.connect();
console.log("mongodb connected");
app.use(express.json());
app.use(cors({
    origin:"*"
}));    

const auth =(request,response,next)=>{
    try {
        const token = request.header("backend-token"); // keyname
        jwt.verify(token,"student");
        next();
    } catch (error) {
        response.status(401).send({message:error.message});
    }
}

app.post("/register",async function(request,response){
    const {username,email,password}=request.body;
    const userFind= await client.db("CRUD").collection("users").findOne({email:email});
    if(userFind){
        response.status(400).send("User already exist");
    }
    else{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        const registerMethod=await client.db("CRUD").collection("users").insertOne({username:username,email:email,password:hashedPassword});
    }
})

app.post("/login",async function(request,response){
    const {email, password}=request.body;
    const userFind = await client.db("CRUD").collection("users").findOne({email:email});
    if(userFind){
        const mongoDBpassword = userFind.password;
        const passwordCheck = await bcrypt.compare(password,mongoDBpassword);
        if(passwordCheck){
            const token = jwt.sign({id:userFind._id},"student",); //jwt token 
            response.status(200).send({token:token});
        }
        else{
            response.status(400).send({message:"Invalid password"})
        }
    }
    else{
        response.status(400).send({message:"Invalid email"});
    }
})

app.listen(8000,()=>{
    console.log("Server connected successfully..😎");
})

