
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    let modified = false;

    if (!envContent.includes('REFRESH_TOKEN_EXPIRY')) {
        envContent += '\nREFRESH_TOKEN_EXPIRY=10d';
        console.log('Added REFRESH_TOKEN_EXPIRY');
        modified = true;
    }

    if (!envContent.includes('ACCESS_TOKEN_EXPIRY')) {
        envContent += '\nACCESS_TOKEN_EXPIRY=1d';
        console.log('Added ACCESS_TOKEN_EXPIRY');
        modified = true;
    } else {
        // Check if it is the problematic "30" value and fix it if needed
        if (envContent.includes('ACCESS_TOKEN_EXPIRY=30')) {
            envContent = envContent.replace('ACCESS_TOKEN_EXPIRY=30', 'ACCESS_TOKEN_EXPIRY=1d');
            console.log('Updated ACCESS_TOKEN_EXPIRY from 30 to 1d');
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(envPath, envContent);
        console.log('.env updated successfully');
    } else {
        console.log('.env already has the required variables');
    }

} catch (error) {
    console.error('Error updating .env:', error);
}
