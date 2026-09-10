import crypto from 'crypto';

export class WebhookDispatcher {
  private secretKey: string;

  constructor(secretKey: string = 'vaultguard_master_secret') {
    this.secretKey = secretKey;
  }

  public signPayload(payload: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');
  }

  public async dispatch(merchantWebhookUrl: string, eventType: string, data: any): Promise<boolean> {
    const payload = JSON.stringify({
      id: crypto.randomUUID(),
      event: eventType,
      data,
      timestamp: new Date().toISOString()
    });

    const signature = this.signPayload(payload);

    console.log(`[Webhook] Dispatching event '${eventType}' to ${merchantWebhookUrl}`);
    console.log(`[Webhook] HMAC Signature: sha256=${signature.slice(0, 16)}...`);

    // In a real environment this does fetch(merchantWebhookUrl, { headers: { 'X-Signature': signature } })
    return true;
  }
}
