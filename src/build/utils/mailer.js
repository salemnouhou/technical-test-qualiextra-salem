"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerification = void 0;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const sendVerification = async (to, token) => {
    const url = `${process.env.API_BASE}/auth/verify?token=${token}`;
    const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || "QUALIEXTRA <no-reply@mail.chaap.app>",
        to,
        subject: "Vérifiez votre adresse email",
        html: `
      <p>Bienvenue 👋</p>
      <p>Cliquez <a href="${url}">ici</a> pour vérifier votre adresse.</p>
      <p>Ou utilisez ce code unique : ${token}</p>

      <p>Ce lien expirera dans 24h.</p>
    `,
    });
    return result;
};
exports.sendVerification = sendVerification;
