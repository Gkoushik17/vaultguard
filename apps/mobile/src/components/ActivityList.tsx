import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../theme';

export interface MobileTransactionItem {
  id: string;
  title: string;
  amountCents: number;
  type: 'DEBIT' | 'CREDIT';
  status: 'APPROVED' | 'BLOCKED' | 'FLAGGED_FOR_REVIEW';
  riskScore: number;
  timestamp: string;
}

interface ActivityListProps {
  transactions: MobileTransactionItem[];
  onItemPress: (item: MobileTransactionItem) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  transactions,
  onItemPress,
}) => {
  const renderItem = ({ item }: { item: MobileTransactionItem }) => {
    const isCredit = item.type === 'CREDIT';
    const amountFormatted = (item.amountCents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    const getStatusStyle = () => {
      switch (item.status) {
        case 'APPROVED':
          return { bg: 'rgba(16, 185, 129, 0.1)', text: colors.primary, border: colors.primary };
        case 'BLOCKED':
          return { bg: 'rgba(239, 68, 68, 0.1)', text: colors.danger, border: colors.danger };
        default:
          return { bg: 'rgba(245, 158, 11, 0.1)', text: colors.warning, border: colors.warning };
      }
    };

    const statusStyle = getStatusStyle();

    return (
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() => onItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.iconLetter}>{item.title.charAt(0)}</Text>
        </View>

        <View style={styles.detailsCol}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={styles.subMeta}>
            <Text style={styles.itemTime}>{item.timestamp}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item.status === 'FLAGGED_FOR_REVIEW' ? 'Review' : item.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.amountCol}>
          <Text
            style={[
              styles.amountText,
              { color: item.status === 'BLOCKED' ? colors.textDim : isCredit ? colors.primary : colors.white },
            ]}
          >
            {isCredit ? '+' : '-'}{amountFormatted}
          </Text>
          <Text style={styles.riskBadge}>Risk: {item.riskScore}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        <Text style={styles.countBadge}>{transactions.length} items</Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  countBadge: {
    color: colors.textMuted,
    fontSize: 11,
  },
  listContent: {
    gap: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconLetter: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  detailsCol: {
    flex: 1,
  },
  itemTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  subMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  itemTime: {
    color: colors.textDim,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  riskBadge: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
});
