async function sendApprovalEmail(toEmail, toName) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('RESEND_API_KEY not set — skipping email.');
    return { skipped: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'San Marino Robotics Lab <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'Your San Marino Robotics Lab account is approved',
      text:
        `Hi ${toName || ''},\n\n` +
        `Your account request for the San Marino Robotics Lab parent website has been approved!\n` +
        `You can now log in with the email and password you used to register:\n\n` +
        `https://san-marino-robotics-site.vercel.app/login.html\n\n` +
        `Thank you,\nSan Marino Robotics Lab`,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log('Email send failed:', res.status, JSON.stringify(data));
    return { ok: false, error: data };
  }
  console.log('Email sent, id:', data.id);
  return { ok: true, id: data.id };
}

module.exports = { sendApprovalEmail };
