
import 'dotenv/config';

console.log(JSON.stringify({
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
    ACCESS_TOKEN_SECRET_EXISTS: !!process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET_EXISTS: !!process.env.REFRESH_TOKEN_SECRET
}, null, 2));
