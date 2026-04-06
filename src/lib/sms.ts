/**
 * SMS utility using Fast2SMS API
 * Docs: https://docs.fast2sms.com/
 */

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || '';

/**
 * Send an SMS message via Fast2SMS Quick-SMS route.
 * Returns true on success, false on failure (never throws).
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  if (!FAST2SMS_API_KEY) {
    console.warn('[SMS] FAST2SMS_API_KEY is not set — skipping SMS.');
    return false;
  }

  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message,
        language: 'english',
        flash: 0,
        numbers: phone,
      }),
    });

    const data = await res.json();

    if (data.return === true) {
      console.log(`[SMS] Sent to ${phone}`);
      return true;
    } else {
      console.error(`[SMS] Failed for ${phone}:`, data.message);
      return false;
    }
  } catch (err) {
    console.error(`[SMS] Error sending to ${phone}:`, err);
    return false;
  }
}

/** Validate an Indian mobile number (10 digits, starts with 6-9) */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

/** Fire-and-forget: SMS sent when a user joins a queue */
export function sendQueueJoinSMS(phone: string): void {
  sendSMS(phone, 'Thank you for joining the queue. You will be notified when your slot is assigned. - VQueue');
}

/** Fire-and-forget: SMS sent when admin assigns an appointment slot */
export function sendAppointmentSMS(phone: string, date: string, time: string): void {
  sendSMS(phone, `You are assigned on ${date} at ${time}. Please be on time. - VQueue`);
}
