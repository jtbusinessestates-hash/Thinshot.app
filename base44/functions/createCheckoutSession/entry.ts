import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '');
    const body = await req.json().catch(() => ({}));
    const { success_url, cancel_url, user_email } = body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1TNaMV2UMbepTX7S2uLr3Mpg',
        quantity: 1,
      }],
      success_url: success_url || 'https://thinshot.app/settings?pro=success',
      cancel_url: cancel_url || 'https://thinshot.app/upgrade',
      ...(user_email ? { customer_email: user_email, metadata: { user_email } } : {}),
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});