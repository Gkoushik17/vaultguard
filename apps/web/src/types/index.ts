export interface RiskFactor {
  code: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  weight: number;
}

export interface Transaction {
  id: string;
  idempotency_key: string;
  source_account_id: string;
  destination_account_id: string;
  merchant_id?: string;
  amount_cents: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'BLOCKED' | 'FLAGGED_FOR_REVIEW' | 'SETTLED' | 'FAILED';
  payment_method: string;
  ip_address?: string;
  device_fingerprint?: string;
  location_city?: string;
  location_country?: string;
  risk_score: number;
  risk_reasons: RiskFactor[];
  created_at: string;
  settled_at?: string;
}

export interface SystemStats {
  total_transactions: number;
  total_volume_cents: number;
  approved_count: number;
  blocked_count: number;
  flagged_count: number;
  tps: number;
  average_risk_score: number;
}
