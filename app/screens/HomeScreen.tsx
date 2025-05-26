import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Button,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import 'react-native-get-random-values'; // uuid için gerekli polyfill
import { v4 as uuidv4 } from 'uuid';

import { useTheme } from '../../_context/ThemeContext';
import EmptyMessage from '../../components/EmptyMessage';
import TaskItem from '../../components/TaskItem';

type Task = { id: string; text: string; completed: boolean };
type Filter = 'all' | 'active' | 'completed';
const STORAGE_KEY = 'TASKS';

export default function HomeScreen() {
    // --- Tema & renk paleti ---
    const { theme, toggleTheme } = useTheme();
    const colors = theme === 'light'
        ? {
            background: '#fff',
            text: '#000',
            filterBg: '#eee',
            filterActiveBg: '#2196f3',
            filterText: '#333',
            filterActiveText: '#fff',
        }
        : {
            background: '#121212',
            text: '#fff',
            filterBg: '#333',
            filterActiveBg: '#bb86fc',
            filterText: '#fff',
            filterActiveText: '#000',
        };

    // --- State tanımları ---
    const [task, setTask] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<Filter>('all');

    // Düzenleme modal’ı için
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    // --- AsyncStorage: yükle & kaydet ---
    useEffect(() => {
        const load = async () => {
            try {
                const json = await AsyncStorage.getItem(STORAGE_KEY);
                if (json) setTasks(JSON.parse(json));
            } catch (e) {
                console.error('Yükleme hatası:', e);
            }
        };
        load();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }, [tasks]);

    // --- CRUD & Update (düzenleme) fonksiyonları ---
    const addTask = () => {
        if (!task.trim()) return;
        const newTask: Task = { id: uuidv4(), text: task.trim(), completed: false };
        setTasks(prev => [...prev, newTask]);
        setTask('');
    };

    const toggleTaskCompleted = (id: string) =>
        setTasks(prev =>
            prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
        );

    const removeTask = (id: string) =>
        setTasks(prev => prev.filter(t => t.id !== id));

    // Düzenleme başlatma
    const startEdit = (id: string, currentText: string) => {
        setEditingId(id);
        setEditText(currentText);
    };

    // Düzenleme kaydetme
    const saveEdit = () => {
        if (editingId === null) return;
        setTasks(prev =>
            prev.map(t =>
                t.id === editingId
                    ? { ...t, text: editText.trim() || t.text }
                    : t
            )
        );
        setEditingId(null);
        setEditText('');
    };

    // --- Filtreleme ---
    const filteredTasks = tasks.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'active') return !t.completed;
        return t.completed;
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Düzenleme Modal’ı */}
            <Modal
                visible={editingId !== null}
                animationType="slide"
                transparent
                onRequestClose={() => setEditingId(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Görevi Düzenle
                        </Text>
                        <TextInput
                            style={[styles.input, { borderColor: colors.filterActiveBg, color: colors.text }]}
                            value={editText}
                            onChangeText={setEditText}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <Button
                                title="İptal"
                                onPress={() => setEditingId(null)}
                                color={colors.filterActiveBg}
                            />
                            <Button
                                title="Kaydet"
                                onPress={saveEdit}
                                color={colors.filterActiveBg}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Tema Toggle */}
            <View style={styles.themeToggle}>
                <Text style={[styles.text, { color: colors.text }]}>
                    {theme === 'light' ? '☀️' : '🌙'}
                </Text>
                <Switch
                    value={theme === 'dark'}
                    onValueChange={toggleTheme}
                    thumbColor={colors.filterActiveBg}
                    trackColor={{ true: colors.filterActiveBg, false: colors.filterBg }}
                />
            </View>

            {/* Başlık */}
            <Text
                style={[
                    styles.title,
                    {
                        color: colors.text,
                        borderBottomColor: colors.filterActiveBg,
                    },
                ]}
            >
                🛡️ Görev Gözcüsü
            </Text>

            {/* Görev Girişi */}
            <TextInput
                style={[styles.input, { borderColor: colors.filterActiveBg, color: colors.text }]}
                placeholder="Bir görev yaz..."
                placeholderTextColor={colors.filterText}
                value={task}
                onChangeText={setTask}
            />
            <Pressable
                style={[styles.addButton, { backgroundColor: colors.filterActiveBg }]}
                onPress={addTask}
            >
                <Text style={[styles.addButtonText, { color: colors.filterActiveText }]}>
                    EKLE
                </Text>
            </Pressable>

            {/* Filtre Butonları */}
            <View style={styles.filterContainer}>
                {(['all', 'active', 'completed'] as Filter[]).map(f => (
                    <Pressable
                        key={f}
                        onPress={() => setFilter(f)}
                        style={[
                            styles.filterBtn,
                            { backgroundColor: colors.filterBg },
                            filter === f && { backgroundColor: colors.filterActiveBg },
                        ]}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                { color: colors.filterText },
                                filter === f && { color: colors.filterActiveText },
                            ]}
                        >
                            {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Tamamlanan'}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Boş Liste Mesajı */}
            {filteredTasks.length === 0 && (
                <EmptyMessage message="Görev yok" emoji="🔍" />
            )}

            {/* Görev Listesi */}
            <FlatList
                data={filteredTasks}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TaskItem
                        text={item.text}
                        completed={item.completed}
                        onToggle={() => toggleTaskCompleted(item.id)}
                        onDelete={() => removeTask(item.id)}
                        onEdit={() => startEdit(item.id, item.text)}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 50 },
    themeToggle: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        borderBottomWidth: 2,
        paddingBottom: 4,
    },
    text: { fontSize: 16 },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
    addButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
    addButtonText: { fontSize: 16, fontWeight: '600' },
    filterContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
    filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
    filterText: { fontWeight: '500' },

    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalContent: {
        width: '80%', padding: 20,
        borderRadius: 8, elevation: 5,
    },
    modalTitle: {
        fontSize: 18, fontWeight: 'bold',
        marginBottom: 10, textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row', justifyContent: 'space-between', marginTop: 20,
    },
});
