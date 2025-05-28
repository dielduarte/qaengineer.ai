import EmailTemplate from '@/components/emails/confirm';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!process.env.RESEND_AUDIENCE_ID) {
      return Response.json(
        { error: 'RESEND_AUDIENCE_ID is not set' },
        { status: 500 },
      );
    }

    const { data, error } = await resend.contacts.create({
      email: email,
      firstName: 'unknown - qaengineer.ai',
      unsubscribed: true,
      audienceId: process.env.RESEND_AUDIENCE_ID,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    if (data) {
      await resend.emails.send({
        from: 'Qaengineer.ai <thankyou@qaengineer.ai>',
        to: [email],
        subject: 'Qaengineer.ai - confirm your email',
        react: EmailTemplate({ userId: data.id }),
      });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
