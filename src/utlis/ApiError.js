class ApiError extends Error{
    constructor(
        statuscode,
        message="Something went worng ",
        errors = [],
        statck =""
    ){
        super(message)
        this.statusCode = this.statusCode
        this.data = null
        this.message
        this.succes = false;
        this.errors = errors


        if(statck){
            this.stack = statck
        }else{
            Error.captureStackTrace(this,this.constructor)
        }

    }
}
export {ApiError}
