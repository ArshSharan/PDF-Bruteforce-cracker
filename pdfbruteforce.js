import { readFileSync } from 'fs';
import {PDFEncryptionChecker} from './pdfcheck.js';
import { PasswordGenerator } from './wordGen.js';
async function bruteForcePDFPassword(pdfPath, options = {}) {
    const {
        maxAttempts = 1000000,
        maxTimeSeconds = 300,
        onProgress = null,
        seedLength = null,
        stopOnFound = true
    } = options;
    
    const checker = new PDFEncryptionChecker(pdfPath);
    const pwdGen = new PasswordGenerator('./passwords.txt');

    if (!checker.isEncrypted()) {
        console.log('PDF is not encrypted');
        return null;
    }
    
    console.log('Starting brute force attack...');
    const startTime = Date.now();
    let attempts = 0;
    let foundPassword = null;
    
    const attemptedPasswords = new Set();
    
    while (attempts < maxAttempts) {
        if ((Date.now() - startTime) / 1000 > maxTimeSeconds) {
            console.log(`\nTime limit reached (${maxTimeSeconds} seconds)`);
            break;
        }
        
        const password = pwdGen.getPassword()
        
        if (attemptedPasswords.has(password)) {
            continue;
        }
        
        attemptedPasswords.add(password);
        attempts++;
        
        if (attempts % 100 === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = attempts / elapsed;
            const progressMsg = `\rAttempts: ${attempts} | Rate: ${rate.toFixed(0)} p/s | ` +
                               `Current: "${password.substring(0, 20)}${password.length > 20 ? '...' : ''}"       `;
            
            if (onProgress) {
                onProgress({
                    attempts,
                    rate,
                    currentPassword: password,
                    elapsedTime: elapsed
                });
            } else {
                process.stdout.write(progressMsg);
            }
        }
        
        try {
            const result = await checker.validatePassword(password);
            
            if (result.valid) {
                const totalTime = (Date.now() - startTime) / 1000;
                foundPassword = password;
                
                console.log(`\n\nPassword found: ${password}`);
                console.log(`Attempts: ${attempts}`);
                console.log(`Time: ${totalTime.toFixed(2)} seconds`);
                
                if (stopOnFound) {
                    return {
                        password,
                        attempts,
                        time: totalTime,
                    };
                }
            }
        } catch (error) {
            console.error(`\nError testing password "${password}":`, error.message);
            continue;
        }
        
        if (attempts % 1000 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }
    
    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`\n\nBrute force completed without finding password`);
    console.log(`Total attempts: ${attempts}`);
    console.log(`Total time: ${totalTime.toFixed(2)} seconds`);
    console.log(`Average rate: ${(attempts / totalTime).toFixed(0)} p/s`);
    
    return null;
}

bruteForcePDFPassword(
  readFileSync("C:\\Users\\catte\\Downloads\\secured (1).pdf")
)
