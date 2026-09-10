import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing } from './src/theme';
import { BalanceCard } from './src/components/BalanceCard';
import { QuickTransfer } from './src/components/QuickTransfer';
import { QRCodeModal } from './src/components/QRCodeModal';
import { ActivityList, MobileTransactionItem } from './src/components/ActivityList';

export default function App() {
  const [balanceCents, setBalanceCents] = useState(500000); // $5,000.00
  const [accountNumber] = useState('VG-USR-ALICE-101');
  const [transferVisible, setTransferVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [coreStatus, setCoreStatus] = useState<'CONNECTING' | 'ONLINE' | 'STANDALONE'>('CONNECTING');

  const [activities, setActivities] = useState<MobileTransactionItem[]>([
    {
      id: 'tx_init_1',
      title: 'WholeGreen Groceries',
      amountCents: 4250,
      type: 'DEBIT',
      status: 'APPROVED',
      riskScore: 12,
      timestamp: 'Today, 2:15 PM',
    },
    {
      id: 'tx_init_2',
      title: 'Apex Electronics Tech',
      amountCents: 189900,
      type: 'DEBIT',
      status: 'FLAGGED_FOR_REVIEW',
      riskScore: 48,
      timestamp: 'Yesterday, 6:40 PM',
    },
    {
      id: 'tx_init_3',
      title: 'Salary Direct Deposit',
      amountCents: 320000,
      type: 'CREDIT',
      status: 'APPROVED',
      riskScore: 5,
      timestamp: 'Sep 01, 9:00 AM',
    },
  ]);

  // Ping Go Core on startup
  useEffect(() => {
    fetch('http://localhost:8080/health')
      .then((res) => res.json())
      .then(() => setCoreStatus('ONLINE'))
      .catch(() => setCoreStatus('STANDALONE'));
  }, []);

  const handleSendPayment = async (data: {
    amountCents: number;
    destinationAccountId: string;
    merchantId?: string;
    mcc?: string;
    note: string;
  }) => {
    const idempotencyKey = 'mob_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const payload = {
      idempotency_key: idempotencyKey,
      source_account_id: 'a0000000-0000-0000-0000-000000000002', // Alice
      destination_account_id: data.destinationAccountId,
      merchant_id: data.merchantId || 'm0000000-0000-0000-0000-000000000001',
      merchant_category_code: data.mcc || '5411',
      amount_cents: data.amountCents,
      currency: 'USD',
      payment_method: 'APPLE_PAY_WALLET',
      location_city: 'San Francisco',
      location_country: 'US',
    };

    try {
      // Send to Go Core API
      const response = await fetch('http://localhost:8080/api/v1/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();
      const tx = resJson.transaction;

      if (response.ok && tx.status === 'APPROVED') {
        setBalanceCents((prev) => prev - data.amountCents);
        Alert.alert('Payment Approved', `Successfully sent $${(data.amountCents / 100).toFixed(2)}.`);
      } else if (tx.status === 'BLOCKED') {
        Alert.alert(
          'Security Block Triggered',
          `VaultGuard AI flagged this transaction (Risk Score: ${tx.risk_score}/100) due to security policies.`
        );
      } else {
        Alert.alert('In Review', 'Payment is held for secondary compliance verification.');
      }

      // Add to mobile activity
      const newItem: MobileTransactionItem = {
        id: tx.id,
        title: data.note || 'Instant Transfer',
        amountCents: data.amountCents,
        type: 'DEBIT',
        status: tx.status,
        riskScore: tx.risk_score,
        timestamp: 'Just now',
      };
      setActivities((prev) => [newItem, ...prev]);
    } catch (e) {
      // Standalone simulation fallback
      const isHighRisk = data.mcc === '7995' || data.amountCents > 500000;
      const riskScore = isHighRisk ? 82 : 15;
      const status = isHighRisk ? 'BLOCKED' : 'APPROVED';

      if (status === 'APPROVED') {
        setBalanceCents((prev) => prev - data.amountCents);
        Alert.alert('Payment Approved (Local)', `$${(data.amountCents / 100).toFixed(2)} authorized.`);
      } else {
        Alert.alert('Transaction Blocked', 'High risk anomaly prevented transfer.');
      }

      const newItem: MobileTransactionItem = {
        id: 'tx_local_' + Math.random().toString(36).substring(2, 8),
        title: data.note || 'Instant Transfer',
        amountCents: data.amountCents,
        type: 'DEBIT',
        status,
        riskScore,
        timestamp: 'Just now',
      };
      setActivities((prev) => [newItem, ...prev]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Top Mobile Bar */}
      <View style={styles.header}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AJ</Text>
          </View>
          <View>
            <Text style={styles.userName}>Alice Johnson</Text>
            <Text style={styles.userBadge}>TIER 3 VERIFIED</Text>
          </View>
        </View>

        <View style={styles.networkBadge}>
          <View
            style={[
              styles.networkDot,
              { backgroundColor: coreStatus === 'ONLINE' ? colors.primary : colors.warning },
            ]}
          />
          <Text style={styles.networkText}>
            {coreStatus === 'ONLINE' ? 'Go 8080 Live' : 'Offline Mode'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <BalanceCard
          balanceCents={balanceCents}
          accountNumber={accountNumber}
          onSendPress={() => setTransferVisible(true)}
          onReceivePress={() => setQrVisible(true)}
        />

        <ActivityList
          transactions={activities}
          onItemPress={(item) => {
            Alert.alert(
              item.title,
              `Status: ${item.status}\nAmount: $${(item.amountCents / 100).toFixed(2)}\nAI Risk Score: ${item.riskScore}/100`
            );
          }}
        />
      </ScrollView>

      {/* Modals */}
      <QuickTransfer
        visible={transferVisible}
        onClose={() => setTransferVisible(false)}
        onSubmit={handleSendPayment}
      />

      <QRCodeModal
        visible={qrVisible}
        onClose={() => setQrVisible(false)}
        accountNumber={accountNumber}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  userName: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  userBadge: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  networkText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
});
