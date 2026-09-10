-- Seed data for VaultGuard
-- Pre-populates baseline accounts and demo merchants

-- 1. Insert Initial System Accounts
INSERT INTO accounts (id, account_number, holder_name, account_type, currency, balance_cents, status)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'VG-SYS-RESERVE-01', 'VaultGuard Liquidity Reserve', 'EQUITY', 'USD', 1000000000, 'ACTIVE'),
    ('a0000000-0000-0000-0000-000000000002', 'VG-USR-ALICE-101', 'Alice Johnson (Verified)', 'ASSET', 'USD', 500000, 'ACTIVE'), -- $5,000.00
    ('a0000000-0000-0000-0000-000000000003', 'VG-USR-BOB-102', 'Bob Smith (Consumer)', 'ASSET', 'USD', 250000, 'ACTIVE'),       -- $2,500.00
    ('a0000000-0000-0000-0000-000000000004', 'VG-USR-SUSPECT-999', 'Compromised Test Account', 'ASSET', 'USD', 1500000, 'ACTIVE') -- $15,000.00
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Registered Merchants
INSERT INTO merchants (id, name, category_code, api_key_hash, webhook_url, is_active)
VALUES 
    ('m0000000-0000-0000-0000-000000000001', 'Apex Electronics & Tech', '5732', 'hash_sec_apex_98127391', 'http://gateway-node:5000/api/webhooks/apex', true),
    ('m0000000-0000-0000-0000-000000000002', 'WholeGreen Organic Groceries', '5411', 'hash_sec_groceries_32187', 'http://gateway-node:5000/api/webhooks/groceries', true),
    ('m0000000-0000-0000-0000-000000000003', 'HighRoller Global Casino', '7995', 'hash_sec_casino_449102', 'http://gateway-node:5000/api/webhooks/casino', true),
    ('m0000000-0000-0000-0000-000000000004', 'CloudStream Subscriptions', '4899', 'hash_sec_cloud_118239', 'http://gateway-node:5000/api/webhooks/cloud', true)
ON CONFLICT (id) DO NOTHING;
