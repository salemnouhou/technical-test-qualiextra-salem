"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDisposableEmail = isDisposableEmail;
const disposable_email_domains_1 = __importDefault(require("disposable-email-domains"));
function isDisposableEmail(email) {
    const domain = email.split('@')[1].toLowerCase();
    return disposable_email_domains_1.default.includes(domain);
}
