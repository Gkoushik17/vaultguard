import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing } from '../theme';

interface QuickTransferProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amountCents: number;
    destinationAccountId: string;
    merchantId?: string;
    mcc?: string;
    note: string;
  }) => Promise<void>;
}

export const QuickTransfer: React.FC<QuickTransferProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [amountStr, setAmountStr] = useState('25.00');
  const [recipient, setRecipient] = useState<'bob' | 'merchant' | 'casino'>('bob');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed <= 0) return;

    const amountCents = Math.round(parsed * 100);
    let destId = 'a0000000-0000-0000-0000-000000000003'; // Bob
    let merchantId: string | undefined = undefined;
    let mcc: string = '5411';

    if (recipient === 'merchant') {
      destId = 'a0000000-0000-0000-0000-000000000001';
      merchantId = 'm0000000-0000-0000-0000-000000000001'; // Apex
      mcc = '5732';
    } else if (recipient === 'casino') {
      destId = 'a0000000-0000-0000-0000-000000000001';
      merchantId = 'm0000000-0000-0000-0000-000000000003'; // Casino
      mcc = '7995'; // High risk
    }

    setLoading(true);
    try {
      await onSubmit({
        amountCents,
        destinationAccountId: destId,
        merchantId,
        mcc,
        note: `Transfer to ${recipient}`,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          
          <Text style={styles.title}>Send Instant Payment</Text>
          <Text style={styles.subtitle}>Protected by VaultGuard AI Fraud Shield</Text>

          {/* Amount input */}
          <View style={styles.amountBox}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="decimal-pad"
              value={amountStr}
              onChangeText={setAmountStr}
              placeholder="0.00"
              placeholderTextColor={colors.textDim}
            />
          </View>

          {/* Recipient Selection */}
          <Text style={styles.sectionLabel}>SELECT RECIPIENT</Text>
          <View style={styles.recipientsRow}>
            <TouchableOpacity
              style={[
                styles.recipientBtn,
                recipient === 'bob' && styles.recipientBtnActive,
              ]}
              onPress={() => setRecipient('bob')}
            >
              <Text
                style={[
                  styles.recipientText,
                  recipient === 'bob' && styles.recipientTextActive,
                ]}
              >
                Bob Smith (P2P)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.recipientBtn,
                recipient === 'merchant' && styles.recipientBtnActive,
              ]}
              onPress={() => setRecipient('merchant')}
            >
              <Text
                style={[
                  styles.recipientText,
                  recipient === 'merchant' && styles.recipientTextActive,
                ]}
              >
                Apex Tech (Store)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.recipientBtn,
                recipient === 'casino' && styles.recipientBtnActive,
              ]}
              onPress={() => setRecipient('casino')}
            >
              <Text
                style={[
                  styles.recipientText,
                  recipient === 'casino' && styles.recipientTextActive,
                ]}
              >
                Casino (High-Risk)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, loading && styles.disabledBtn]}
              onPress={handleSend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.confirmBtnText}>Authorize & Pay</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyPrefix: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '800',
    marginRight: 4,
  },
  amountInput: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '800',
    minWidth: 120,
  },
  sectionLabel: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  recipientsRow: {
    flexDirection: 'column',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  recipientBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recipientBtnActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  recipientText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  recipientTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
