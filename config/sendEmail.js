// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async (to, subject, text) => {
//   try {
//     const data = await resend.emails.send({
//       from: "onboarding@resend.dev",   
//       to: [to],
//       subject: subject,
//       text: text,
//     });

//     console.log("Email sent:", data);
//   } catch (err) {
//     console.error("Resend error:", err);
//   }
// };

import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

export const sendEmail = async (to, subject, text) => {
  try {
    const message = [
      `From: ${process.env.GMAIL_SENDER_EMAIL}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "",
      text,
    ].join("\n");

    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log("Email sent:", res.data);
  } catch (err) {
    console.error("Gmail API Error:", err.message);
  }
};