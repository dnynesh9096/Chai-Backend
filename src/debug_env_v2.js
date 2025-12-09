
import 'dotenv/config';

const check = (name) => {
    const val = process.env[name];
    console.log(`${name}: [${val ? 'PRESENT' : 'MISSING'}] Value: ${val}`);
}

check('ACCESS_TOKEN_EXPIRY');
check('REFRESH_TOKEN_EXPIRY');
check('ACCESS_TOKEN_SECRET');
check('REFRESH_TOKEN_SECRET');
