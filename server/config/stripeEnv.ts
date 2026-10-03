function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getStripeEnv() {
  return Object.freeze({
    secretKey: required("STRIPE_SECRET_KEY"),
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY?.trim() || required("STRIPE_API_KEY"),
    webhookSecret: required("STRIPE_WEBHOOK_SECRET"),
  });
}
