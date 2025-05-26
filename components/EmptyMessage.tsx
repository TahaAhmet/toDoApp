import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../_context/ThemeContext';

type Props = {
  message: string;
  emoji?: string;
};

export default function EmptyMessage({ message, emoji }: Props) {
  const { theme } = useTheme();
  const color = theme === 'light' ? 'gray' : '#aaa';

  return (
    <>
      {emoji && <Text style={[styles.emoji, { color }]}>{emoji}</Text>}
      <Text style={[styles.message, { color }]}>{message}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});
