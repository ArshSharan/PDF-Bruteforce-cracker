import { PDFDocument } from 'pdf-lib';
import {decryptPDF} from 'pdf-encrypt-decrypt'; 

export class PDFEncryptionChecker {
    constructor(pdfBuffer) {
        this.buffer = pdfBuffer;
        this._encrypted = null;
    }

    async isEncrypted() {
        if (this._encrypted !== null) return this._encrypted;
        try {
            await PDFDocument.load(this.buffer, { parsePages: false });
            this._encrypted = false;
        } catch (err) {
            const msg = err.message.toLowerCase();
            this._encrypted = msg.includes('encrypted');
        }
        return this._encrypted;
    }

    async validatePassword(password) {
        const encrypted = await this.isEncrypted();
        if (!encrypted) {
            return { valid: false, error: 'PDF is not encrypted' };
        }
        try {
            await decryptPDF(this.buffer, password);
            return { valid: true, password: password };
        } catch (error) {
            const msg = error.message?.toLowerCase() || '';
            if (msg.includes('password') || msg.includes('decrypt')) {
                return { valid: false, error: 'Invalid password' };
            }
            return { valid: false, error: `Decryption error: ${error.message}` };
        }
    }
}
