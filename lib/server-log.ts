import { sanitizeErrorForLog } from "./salesforce/error-sanitizer";

export function logServerError(message: string, error: unknown): void {
    console.error(message, sanitizeErrorForLog(error));
}
