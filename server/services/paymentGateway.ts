import Stripe from "stripe";
import { getStripeEnv } from "../config/stripeEnv";

export interface CreatePaymentIntentInput {
  amountMinor: number;
  currency: "inr";
  marketplaceOrderId: string;
  customerId: string;
  idempotencyKey: string;
}

export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  status: string;
}

export interface RefundResult { id: string; status: string | null; }

export interface PaymentGateway {
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult>;
  cancelPaymentIntent(paymentIntentId: string): Promise<void>;
  refundPaymentIntent(paymentIntentId: string, idempotencyKey: string): Promise<RefundResult>;
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event;
}

class StripePaymentGateway implements PaymentGateway {
  private readonly config = getStripeEnv();
  private readonly stripe = new Stripe(this.config.secretKey);

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: input.amountMinor,
      currency: input.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        marketplaceOrderId: input.marketplaceOrderId,
        customerId: input.customerId,
      },
    }, { idempotencyKey: input.idempotencyKey });
    if (!intent.client_secret) throw new Error("Stripe PaymentIntent did not return a client secret");
    return { id: intent.id, clientSecret: intent.client_secret, status: intent.status };
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (!intent.client_secret) throw new Error("Stripe PaymentIntent did not return a client secret");
    return { id: intent.id, clientSecret: intent.client_secret, status: intent.status };
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    const current = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (current.status === "canceled") return;
    if (current.status === "succeeded") throw new Error("Cannot cancel a succeeded PaymentIntent");
    await this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  async refundPaymentIntent(paymentIntentId: string, idempotencyKey: string): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({ payment_intent: paymentIntentId }, { idempotencyKey });
    return { id: refund.id, status: refund.status ?? null };
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);
  }
}

let defaultGateway: PaymentGateway | undefined;
export function paymentGateway(): PaymentGateway {
  defaultGateway ??= new StripePaymentGateway();
  return defaultGateway;
}
