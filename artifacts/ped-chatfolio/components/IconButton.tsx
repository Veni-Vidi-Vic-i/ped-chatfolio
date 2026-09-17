import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

type IconButtonProps = {
  name: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
  light?: boolean;
};

export function IconButton({ name, label, onPress, light = false }: IconButtonProps) {
  const colors = useColors();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: light ? colors.card : colors.secondary },
        pressed && styles.pressed,
      ]}
    >
      <Feather name={name} size={18} color={colors.foreground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  pressed: { opacity: 0.68 },
});