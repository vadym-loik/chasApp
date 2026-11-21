import { router } from 'expo-router';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useApp } from '../AppProvider';
import type { CounterItem } from '../models/counter';
import { confirmDelete } from '../utils/confirm';
import { CounterCard } from './CounterCard';
import { Icon, type IconName } from './Icon';

interface Props {
  item: CounterItem;
  onDeleted: () => void;
}

/**
 * A counter card with swipe actions.
 * Swipe right: the edit button shows on the left. Swipe left: the red delete button shows on the right.
 */
export function SwipeableCounterCard({ item, onDeleted }: Props) {
  const { colors, comic, t } = useApp();

  function action(
    icon: IconName,
    label: string,
    color: string,
    gap: ViewStyle,
    onPress: () => void,
    methods: SwipeableMethods,
  ) {
    return (
      <Pressable
        onPress={() => {
          methods.close();
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.action, gap, { backgroundColor: color, opacity: pressed ? 0.85 : 1 }, comic.frame]}
      >
        <Icon name={icon} size={26} color="#FFFFFF" />
      </Pressable>
    );
  }

  return (
    <ReanimatedSwipeable
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={(_progress, _translation, methods) =>
        action('edit', t.editCounter, colors.accent, styles.gapRight, () => router.push(`/edit?id=${item.id}`), methods)
      }
      renderRightActions={(_progress, _translation, methods) =>
        action('trash', t.delete, colors.danger, styles.gapLeft, () => confirmDelete(item, t, onDeleted), methods)
      }
    >
      <CounterCard item={item} onPress={() => router.push(`/${item.id}`)} />
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  action: { width: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  // A gap between the card and the button.
  gapLeft: { marginLeft: 10 },
  gapRight: { marginRight: 10 },
});
