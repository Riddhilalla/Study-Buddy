const mongoose=require("mongoose")

mongoose.connect("mongodb://localhost:27017/LoginFormPractice")
.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log('failed');
})

const logInSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{


        type:String,

        required:true
    },
    notes: [{
        title: String,
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]

})

const LogInCollection=new mongoose.model('LogInCollection',logInSchema)

module.exports=LogInCollection
