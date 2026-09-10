import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';

interface BalanceCardProps {
  balanceCents: number;
  accountNumber: string;
  onSendPress: () => void;
  onReceivePress: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balanceCents,
  accountNumber,
  onSendPress,
  onReceivePress,
}) => {
  const [hideBalance, setHideBalance] = useState(false);

  const formattedBalance = (balanceCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <View style={styles.card}>
      {/* Header Info */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.subTitle}>TOTAL BALANCE</Text>
          <Text style={styles.accountNumber}>{accountNumber}</Text>
        </View>
        <TouchableOpacity
          style={styles.hideButton}
          onPress={() => setHideBalance(!hideBalance)}
          activeOpacity={0.7}
        >
          <Text style={styles.hideText}>{hideBalance ? 'Show' : 'Hide'}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Balance Display */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>
          {hideBalance ? '••••••••' : formattedBalance}
        </Text>
        <View style={styles.ledgerBadge}>
          <Text style={styles.ledgerBadgeText}>ACID Double-Entry</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.primaryBtn]}
          onPress={onSendPress}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Send Money</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={onReceivePress}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>QR Receive</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  accountNumber: {
    color: colors.textDim,
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  hideButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hideText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  balanceContainer: {
    marginVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  balanceText: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ledgerBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  ledgerBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
