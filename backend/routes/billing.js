import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../utils/db.js';

const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const PRICE_IDS = {
  creator: process.env.STRIPE_PRICE_CREATOR || 'price_creator_placeholder',
  creator_pro: process.env.STRIPE_PRICE_CREATOR_PRO || 'price_creator_pro_placeholder',
};

let stripe = null;
if (STRIPE_SECRET_KEY) {
  try {
    const stripeModule = await import('stripe');
    stripe = stripeModule.default(STRIPE_SECRET_KEY);
    console.log('[BILLING] Stripe initialized');
  } catch (error) {
    console.warn('[BILLING] Stripe module not found, billing disabled');
  }
}

router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    const user = req.user;

    if (!['creator', 'creator_pro'].includes(plan)) {
      return res.status(400).json({ success: false, error: 'Invalid plan selected' });
    }

    if (!stripe || !STRIPE_SECRET_KEY) {
      console.log('[BILLING] Checkout requested but Stripe not configured:', user.email, plan);
      return res.json({
        success: true,
        message: 'Billing not active yet. Add STRIPE_SECRET_KEY to enable payments.',
        checkoutUrl: null
      });
    }

    const priceId = PRICE_IDS[plan];

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: 'https://titleiq.tightslice.com/dashboard?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://titleiq.tightslice.com/pricing',
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plan: plan,
      }
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('[BILLING] Checkout session created:', user.email, plan, session.id);

    return res.json({
      success: true,
      checkoutUrl: session.url
    });

  } catch (error) {
    console.error('[BILLING] Checkout error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create checkout session' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      console.warn('[BILLING] Webhook received but Stripe not configured');
      return res.json({ received: true });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody || req.body,
        sig,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('[BILLING] Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('[BILLING] Webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId || session.client_reference_id;
        const plan = session.metadata.plan;

        if (userId && plan) {
          db.prepare(`
            UPDATE users
            SET plan = ?,
                billing_status = 'active',
                trial_expires = NULL,
                stripe_customer_id = ?,
                stripe_subscription_id = ?
            WHERE id = ?
          `).run(plan, session.customer, session.subscription, userId);

          console.log('[BILLING] User upgraded:', userId, plan);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        db.prepare(`
          UPDATE users
          SET billing_status = 'active'
          WHERE stripe_customer_id = ?
        `).run(customerId);

        console.log('[BILLING] Payment succeeded for customer:', customerId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        db.prepare(`
          UPDATE users
          SET billing_status = 'past_due'
          WHERE stripe_customer_id = ?
        `).run(customerId);

        console.log('[BILLING] Payment failed for customer:', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        db.prepare(`
          UPDATE users
          SET billing_status = 'canceled',
                plan = 'trial'
          WHERE stripe_customer_id = ?
        `).run(customerId);

        console.log('[BILLING] Subscription canceled for customer:', customerId);
        break;
      }

      default:
        console.log('[BILLING] Unhandled event type:', event.type);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('[BILLING] Webhook error:', error);
    res.status(400).send('Webhook Error');
  }
});

export default router;
