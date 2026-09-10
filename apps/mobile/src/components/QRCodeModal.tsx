import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  accountNumber: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  onClose,
  accountNumber,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Receive via QR Code</Text>
          <Text style={styles.subtitle}>Scan using any VaultGuard mobile terminal</Text>

          {/* Stylized QR Code Graphic */}
          <View style={styles.qrContainer}>
            <View style={styles.mockQrGrid}>
              <View style={[styles.qrCorner, styles.qrTopLeft]} />
              <View style={[styles.qrCorner, styles.qrTopRight]} />
              <View style={[styles.qrCorner, styles.qrBottomLeft]} />
              <View style={styles.qrCenterDot} />
            </View>
          </View>

          <View style={styles.accBox}>
            <Text style={styles.accLabel}>ACCOUNT ID</Text>
            <Text style={styles.accValue}>{accountNumber}</Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  qrContainer: {
    marginVertical: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 16,
  },
  mockQrGrid: {
    width: 140,
    height: 140,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCorner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderWidth: 6,
    borderColor: colors.black,
  },
  qrTopLeft: { top: 0, left: 0 },
  qrTopRight: { top: 0, right: 0 },
  qrBottomLeft: { bottom: 0, left: 0 },
  qrCenterDot: {
    width: 24,
    height: 24,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  accBox: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  accLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  accValue: {
    color: colors.text,
    fontSize: 13,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  closeBtn: {
    width: '100%',
    backgroundColor: colors.card,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
});
