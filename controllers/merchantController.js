const merchants = require("../models/merchants")
const bcrypt = require("bcryptjs")
const getAllmerchants = async(req,res)=>{
    try {
        const findAllmerchants = await merchants.find()
        if(!findAllmerchants){
            return res.status(401).json({message:"no user found"})

        }
        res.json({findAllmerchants})
    } catch (error) {
        console.log(error)
        
    }
}

const getAmerchant = async(req,res)=>{
    try {
        const {id} = req.params
        const findmerchant = await merchants.findById(id).exec()
        if(!findmerchant){
            return res.status(401).json({message:"no user found"})
        }
        res.json(findmerchant)
    } catch (error) {


        
    }
}

const createMerchants = async(req,res)=>{
    try {
        const{productname,email,phone,password,company_name,commission,website_Url,description,}= req.body
        if(!productname || !email || !phone || !password || !company_name || !commission  || !description){
            return res.status(401).json({message:"all fields are required"})
        }
        const existingmerchants = await users.findOne({email}).exec()
        if(!existingmerchants){
            return res.status(409).json({message:"user already exists"})
        }
        const hashpwd = await bcrypt.hash(password,10)
        const newmerchants = new users({
            productname,
            email,
            phone,
            password:hashpwd,
            description,
            website_Url:req.file.path,
            commission,
            company_name


        })
        await newmerchants.save()
        
    } catch (error) {
        console.log(error)
        
    }
}

const updateMerchants = async(req,res)=>{
    try {
        const{id} = req.params
        const findAmerchant = await merchants.findById(id)
        if(!findAmerchant){
            return res.status(401).json({message: "no user found"})

        }
        const hashpwd = await bcrypt.hash(password,10)
        const updatedMerchant = await merchants.findByIdAndUpdate(findAmerchant)
        if(!updatedMerchant){
            return res.status(401).json({message:"user not updated"})
        }
        const userObject = {
            hashpwd,
            updatedMerchant
        }
        await userObject.save()

    } catch (error) {
        console.log(error)
        
    }
}

const deleteMerchants = async(req,res)=>{
    try {
        const{id} = req.params
        const foundMerchant = await merchants.findById(id).exec()
        if(!foundM){
            return res.status(401).json({message:"no user found"})
        }
        const deletedMerchant = await merchants.findByIdAndDelete(foundMerchant)
        if(!deletedMerchant){
            return res.status(401).json({message:"user was not deleted"})
        }
    } catch (error) {
        console.log(error)

        
    }
}

module.exports = {
    getAllmerchants,
    getAmerchant,
    createMerchants,
    updateMerchants,
    deleteMerchants
}