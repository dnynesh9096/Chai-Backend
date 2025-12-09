
import 'dotenv/config';

console.log('ACCESS_TOKEN_EXPIRY:', process.env.ACCESS_TOKEN_EXPIRY, typeof process.env.ACCESS_TOKEN_EXPIRY);
console.log('REFRESH_TOKEN_EXPIRY:', process.env.REFRESH_TOKEN_EXPIRY, typeof process.env.REFRESH_TOKEN_EXPIRY);
console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? 'SET' : 'NOT SET');
console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? 'SET' : 'NOT SET');
