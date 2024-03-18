import express from "express";
import { MongoClient, ObjectId } from 'mongodb';
import cors from "cors";
import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";

const app=express();
const url="mongodb+srv://sanjai:sanjai123@movies.vcowzfe.mongodb.net/?retryWrites=true&w=majority&appName=movies"
const client= new MongoClient(url);
await client.connect();
console.log("mongodb connected");
app.use(express.json());
app.use(cors());

const auth =(request,response,next)=>{
    try {
        const token = request.header("backend-token"); // keyname
        jwt.verify(token,"student");
        next();
    } catch (error) {
        response.status(401).send({message:error.message});
    }
}

app.get("/",function(request,response){
    response.status(200).send("Hello World")
})

app.get("/get",auth,async function(request,response){
    const getMethod=await client.db("CRUD").collection("data").find({}).toArray();
    response.status(200).send(getMethod);
})

app.post("/post",async function(request,response){
    const getPostman =request.body;
    const sendMethod = await client.db("CRUD").collection("data").insertOne(getPostman);
    response.status(201).send(sendMethod);
});
app.post("/postmany",async function(request,response){
    const getMany =request.body;
    const sendMethod =await client.db("CRUD").collection("data").insertMany(getMany);
    response.status(201).send(sendMethod);
})

app.get("/getone/:id",async function(request,response){
    const {id} = request.params;
    const getMethod = await client.db("CRUD").collection("data").findOne({_id:new ObjectId(id)});
    response.status(200).send(getMethod);
})
app.put("/updateone/:id",async function(request,response){
    const {id}=request.params;
    const getPostman =request.body;
    const updateMethod=await client.db("CRUD").collection("data").updateOne({_id:new ObjectId(id)},{$set:getPostman});
    response.status(201).send(updateMethod);
});

app.delete("/delete/:id",async function(request,response){
    const {id}=request.params;
    const deleteMethod=await client.db("CRUD").collection("data").deleteOne({_id:new ObjectId(id)});
    response.status(200).send(deleteMethod);
})


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
        // response.status(201).send(registerMethod);
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

