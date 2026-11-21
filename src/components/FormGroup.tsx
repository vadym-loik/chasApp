import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../AppProvider';
import { Icon, type IconName } from './Icon';

/** A panel that joins some form rows, with a line between them. It shows nothing if it has no rows. */
export function FormGroup({ children }: { children: ReactNode }) {
  const { colors } = useApp();
  const rows = Children.toArray(children);
  if (rows.length === 0) return null;
  return (
    <View style={[styles.group, { backgroundColor: colors.surface }]}>
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 && <View style={[styles.divider, { backgroundColor: colors.track }]} />}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

interface RowProps {
  icon: IconName;
  label: string;
  /** A small control on the right side of the label, for example a date. */
  action?: ReactNode;
  /** Controls under the label. */
  children?: ReactNode;
}

/** One row of a form group: an icon and a label, with controls beside or under them. */
export function FormRow({ icon, label, action, children }: RowProps) {
  const { colors } = useApp();
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Icon name={icon} size={20} color={colors.accent} />
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: 20, paddingHorizontal: 16 },
  divider: { height: StyleSheet.hairlineWidth * 2 },
  row: { paddingVertical: 14, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 36 },
  label: { flex: 1, fontSize: 16, fontWeight: '600' },
});
