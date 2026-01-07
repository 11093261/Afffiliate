require("dotenv").config()
const {CloudinaryStorage} = require("multer-storage-cloudinary")
const multer = require("multer")
const cloudinary = require("cloudinary").v2


cloudinary.config({
    cloudinary_name:process.env.CLOUDINARY_NAME,
    cloudinary_api_key:process.env.CLOUDINARY_API_KEY,
    cloudinary_api_secret:process.env.CLOUDINARY_API_SECRET

    
})

const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"upload",
        allowed_formats: ['jpg', 'jpeg', 'png'],
    }
    

})
const upload = multer({storage:storage})
module.exports = upload