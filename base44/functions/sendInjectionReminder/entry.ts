import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const settings = await base44.entities.UserSettings.list('-created_date', 1);
    const s = settings[0];

    if (!s?.reminder_injection) {
      return Response.json({ message: 'Reminders disabled' });
    }

    const medLogs = await base44.entities.MedicationLog.list('-injection_date', 1);
    const lastMed = medLogs[0];
    const drugName = lastMed ? (lastMed.drug_name === 'Custom' ? lastMed.custom_drug_name : lastMed.drug_name) : 'your GLP-1 medication';
    const dose = lastMed ? `${lastMed.dose_mg}mg` : '';

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Time for your ThinShot 💉`,
      body: `Hi ${user.full_name || 'there'},\n\nToday is your scheduled injection day for ${drugName}${dose ? ` (${dose})` : ''}.\n\nRemember to:\n• Rotate your injection site\n• Log your injection in ThinShot after\n• Stay hydrated today\n\nYou're doing great — keep it up! 💪\n\nOpen ThinShot: https://thinshot.app/medications\n\n—\nSent by ThinShot Reminders\nUnsubscribe: https://thinshot.app/reminders`,
    });

    return Response.json({ success: true, sentTo: user.email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});