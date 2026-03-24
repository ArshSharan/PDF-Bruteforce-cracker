import { readFileSync } from 'fs';
import { createInterface } from 'readline';

let weights;
try {
    const data = readFileSync('Weight.txt', 'utf8');
    weights = JSON.parse(data);
} catch (err) {
    console.error('Error loading weights file:', err.message);
    process.exit(1);
}
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SPECIAL = '.[];\'?()*&^%$#@!';

const availableChars = LOWERCASE+UPPERCASE+NUMBERS+SPECIAL;

function weigrand(dis) {
    const randThreshold = Math.random();
    let sum = 0;
    
    for (const [key, value] of Object.entries(dis)) {
        if (randThreshold <= value + sum) {
            return key;
        }
        sum += value;
    }
    return null;
}

function getRandomSeed() {
    const randomIndex = Math.floor(Math.random() * availableChars.length);
    return availableChars[randomIndex];
}

function getRandomLength(min = 8, max = 20) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePassword(seed = null, length = null) {
    const finalSeed = seed || getRandomSeed();
    
    const finalLength = length || getRandomLength();
    
    let out = finalSeed;
    
    for (let i = 0; i < finalLength; i++) {
        const lastChar = out[out.length - 1];
        const di = weights[lastChar];
        
        if (!di) {
            break;
        }
        
        const chis = weigrand(di);
        if (!chis) {
            break;
        }
        
        out += chis;
    }
    
    return {
        password: out,
        seed: finalSeed,
        length: finalLength,
        actualLength: out.length
    };
}

function displayPassword(result) {
    console.log('\n=================================');
    console.log(`Generated Password: ${result.password}`);
    console.log(`Seed: ${result.seed}`);
    console.log(`Target Length: ${result.length}`);
    console.log(`Actual Length: ${result.actualLength}`);
    console.log('=================================\n');
}

async function runInteractive() {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = (question) => new Promise((resolve) => {
        rl.question(question, resolve);
    });

    console.log('\n=== Password Generator ===');
    console.log(`Available characters: ${availableChars}`);
    console.log('==========================\n');

    let continueLoop = true;
    
    while (continueLoop) {
        const seedInput = await askQuestion('Enter seed character (press Enter for random): ');
        const seed = seedInput || null;
        
        const lengthInput = await askQuestion('Enter password length 8-20 (press Enter for random): ');
        let length = null;
        
        if (lengthInput) {
            const parsedLength = parseInt(lengthInput);
            if (parsedLength >= 8 && parsedLength <= 20) {
                length = parsedLength;
            } else {
                console.log('Invalid length! Using random length between 8-20.');
                length = null;
            }
        }
        
        const result = generatePassword(seed, length);
        displayPassword(result);
        
        const response = await askQuestion('Generate another? (y/n): ');
        if (response.toLowerCase() !== 'y') {
            continueLoop = false;
        }
        console.log('');
    }
    
    rl.close();
    console.log('Goodbye!');
}

function generateSimple(count = 5) {
    console.log('\n=== Generating Passwords ===\n');
    
    for (let i = 1; i <= count; i++) {
        const result = generatePassword();
        console.log(`${i}. Password: ${result.password}`);
        console.log(`   Seed: ${result.seed}, Target: ${result.length}, Actual: ${result.actualLength}\n`);
    }
}

class PasswordGenerator{
    constructor(wordListPath) {
	const content = readFileSync(wordListPath, 'utf8');
        this.wordList = content.split('\n');
        this.count = 0;
    }
    getPassword(){
      if(this.count < this.wordList.length)
	    return this.wordList[this.count++]

      const { password, seed, length, actualLength } = generatePassword();
      return password;
    }
}

export {
    PasswordGenerator
};
