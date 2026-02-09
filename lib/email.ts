export async function sendDownloadEmail(email: string, downloadUrl: string, jobId: string) {
    console.log(`[Email Mock] Sending download link to ${email}`);
    console.log(`[Email Mock] Link: ${downloadUrl}`);

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (RESEND_API_KEY) {
        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: 'AI Stickers <noreply@yourdomain.com>',
                    to: email,
                    subject: 'Your Sticker Pack is Ready!',
                    html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your stickers are here! 🎉</h2>
              <p>Thank you for your purchase. You can download your sticker pack using the button below:</p>
              <div style="margin: 30px 0;">
                <a href="${downloadUrl}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Download Sticker Pack</a>
              </div>
              <p style="color: #666; font-size: 14px;">This link will expire in 48 hours.</p>
              <p style="color: #666; font-size: 14px;">If you have any issues, please contact support with your Job ID: ${jobId}</p>
            </div>
          `,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Failed to send email via Resend:', error);
            }
        } catch (err) {
            console.error('Error sending email:', err);
        }
    } else {
        console.log('RESEND_API_KEY not found. Email not sent (logged to console above).');
    }
}
