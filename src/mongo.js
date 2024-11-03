const mongoose=require("mongoose")

mongoose.connect("mongodb+srv://riddhijlalla:UGuW70FNMSYBgP4x@study-buddy.xabdj.mongodb.net/LoginFormPractice")
.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log('failed', e);
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
