const payout = require("../models/payout")
const mongoose = require("mongoose")

const getApayout = async(req,res)=>{
    try{
        
        const findAllPayout = await payout.find()
        if(!findAllPayout){
            return res.status(401).json({message:"no payout for this user"})
        }
        console.log(findAllPayout)
        res.json(findAllPayout)
        

    }catch(error){
        console.log(error)
        res.status(500).json({
            successful:false,
            message:"server error"
        })

    }
}



const createApayout = async(req,res)=>{
    try {
        const {email,accountNumber,currency, routingNumber,walletAddress,threshold,schedule,method}= req.body
        console.log(threshold)
        if(!email || !accountNumber || !routingNumber || !walletAddress || !threshold || !schedule || !method || !currency){
            return res.status(401).json("you have a missing field")
        }
        const createdpayout = new payout({
            method,
            email,
            accountNumber,
            routingNumber,
            walletAddress,
            threshold,
            schedule,
            currency

        })
        console.log(createdpayout)
        const savedData = await createdpayout.save()
        console.log(savedData)

    } catch (error) {
        console.log(error)
        
        
        
    }
}



const updatepayout = async(req,res)=>{
    try {

        const {payoutId,email,accountNumber,routingNumber, walletAddress} = req.body
        const payoutMethods = ["paypal","bank","crypto"]
        if(!payoutMethods.includes(payoutId || email || accountNumber || routingNumber || walletAddress)){
            return res.status(401).json({message:"payout method is not found"})
        }
        const updated = await payout.findByIdAndUpdate(
            req.params.id,
            {payoutId,email,accountNumber,routingNumber,walletAddress},
            {new:true}
        )
        if(!updated){
            res.status(401).json({message:"payout failed to update"})
        }
       
     
        
    } catch (error) {
        console.log(error)
        
    }
}

module.exports = {
    getApayout,
    createApayout,
    updatepayout
    
}