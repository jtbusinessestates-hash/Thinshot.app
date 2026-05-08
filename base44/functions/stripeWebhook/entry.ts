import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userEmail = session.metadata?.user_email;

    if (userEmail && session.payment_status === 'paid') {
      const base44 = createClientFromRequest(req);
      const settings = await base44.asServiceRole.entities.UserSettings.filter({ created_by: userEmail }, '-created_date', 1);

      if (settings.length > 0) {
        await base44.asServiceRole.entities.UserSettings.update(settings[0].id, {
          is_pro: true,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        });
      } else {
        // Create settings if they don't exist yet
        // Note: created_by is set automatically by the SDK based on auth context
        // We use asServiceRole so we pass the email in a note field instead
        await base44.asServiceRole.entities.UserSettings.create({
          is_pro: true,
          weight_unit: 'kg',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        });
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object;
    const base44 = createClientFromRequest(req);
    const settings = await base44.asServiceRole.entities.UserSettings.filter(
      { stripe_subscription_id: subscription.id }, '-created_date', 1
    );
    if (settings.length > 0) {
      const isPro = ['active', 'trialing'].includes(subscription.status);
      await base44.asServiceRole.entities.UserSettings.update(settings[0].id, { is_pro: isPro });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const base44 = createClientFromRequest(req);
    const settings = await base44.asServiceRole.entities.UserSettings.filter(
      { stripe_subscription_id: subscription.id }, '-created_date', 1
    );
    if (settings.length > 0) {
      await base44.asServiceRole.entities.UserSettings.update(settings[0].id, { is_pro: false });
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const base44 = createClientFromRequest(req);
    const settings = await base44.asServiceRole.entities.UserSettings.filter(
      { stripe_subscription_id: invoice.subscription }, '-created_date', 1
    );
    if (settings.length > 0) {
      await base44.asServiceRole.entities.UserSettings.update(settings[0].id, { is_pro: false });
    }
  }

  return Response.json({ received: true });
});