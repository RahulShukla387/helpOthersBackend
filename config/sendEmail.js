import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmail = async (to, subject, text) => {
  try {
    const response = await emailApi.sendTransacEmail({
      sender: { email: process.env.SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      textContent: text,
    });

    console.log("Email sent:", response.messageId);
  } catch (err) {
    console.error("Brevo error:", err.response?.body || err.message);
  }
};