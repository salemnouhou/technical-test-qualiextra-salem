import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerification = async (to: string, token: string) => {
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
