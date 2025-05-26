import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../_context/ThemeContext';

type Props = {
  text: string;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
};

export default function TaskItem({ text, completed, onToggle, onDelete, onEdit }: Props) {
  const { theme } = useTheme();
  const colors = theme === 'light'
    ? { card: '#fff', text: '#000', done: '#888', icon: '#555' }
    : { card: '#1e1e1e', text: '#fff', done: '#888', icon: '#aaa' };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* 1) Tamamla için basılabilir metin */}
      <Pressable onPress={onToggle} style={{ flex: 1 }}>
        <Text
          style={[
            styles.text,
            { color: colors.text },
            completed && { textDecorationLine: 'line-through', color: colors.done },
          ]}
        >
          {text}
        </Text>
      </Pressable>

      {/* 2) Düzenle (kalem) ikonu */}
      <Pressable onPress={onEdit} style={styles.iconBtn}>
        <MaterialIcons name="edit" size={20} color={colors.icon} />
      </Pressable>

      {/* 3) Sil (çöp kutusu) ikonu */}
      <Pressable onPress={onDelete} style={styles.iconBtn}>
        <MaterialIcons name="delete-outline" size={20} color="#cc0000" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  text: {
    fontSize: 16,
  },
  iconBtn: {
    padding: 6,
    marginLeft: 8,
  },
});
