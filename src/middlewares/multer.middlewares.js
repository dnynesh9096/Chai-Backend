import multer from "multer";

const storage = multer.diskStorage({
    destintion: function(req, File, cb ){
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb){
        cb(null, file.orginalname)
    }
})

export const upload = multer({
    storage,
})