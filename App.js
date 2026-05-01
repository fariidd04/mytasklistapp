import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';

const PRIORITIES = {
  high: { label: 'Tinggi', color: '#FF4757', bg: '#FF475715' },
  medium: { label: 'Sedang', color: '#FFA502', bg: '#FFA50215' },
  low: { label: 'Rendah', color: '#2ED573', bg: '#2ED57315' },
};

const FILTERS = ['Semua', 'Aktif', 'Selesai'];

const TaskItem = ({ item, onDelete, onToggle }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const priority = PRIORITIES[item.priority];

  const confirmDelete = () => {
    Alert.alert(
      '🗑️ Hapus Task',
      `Hapus "${item.text}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => onDelete(item.id) },
      ]
    );
  };

  return (
    <Animated.View style={[styles.taskCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.taskCardInner}
        onPress={() => onToggle(item.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Checkbox */}
        <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
          {item.done && <Text style={styles.checkmark}>✓</Text>}
        </View>

        {/* Content */}
        <View style={styles.taskContent}>
          <Text style={[styles.taskText, item.done && styles.taskTextDone]} numberOfLines={2}>
            {item.text}
          </Text>
          <View style={styles.taskMeta}>
            <View style={[styles.priorityBadge, { backgroundColor: priority.bg, borderColor: priority.color }]}>
              <Text style={[styles.priorityText, { color: priority.color }]}>
                ● {priority.label}
              </Text>
            </View>
            {item.done && (
              <View style={styles.doneBadge}>
                <Text style={styles.doneText}>Selesai ✓</Text>
              </View>
            )}
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function App() {
  // State Management
  const [inputText, setInputText] = useState('');
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Selesaikan laporan mingguan', priority: 'high', done: false },
    { id: '2', text: 'Beli bahan makanan', priority: 'medium', done: true },
    { id: '3', text: 'Olahraga 30 menit', priority: 'low', done: false },
  ]);
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [inputError, setInputError] = useState('');

  // Derived state
  const doneCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'Aktif') return !task.done;
    if (activeFilter === 'Selesai') return task.done;
    return true;
  });

  // Handlers
  const handleAddTask = () => {
    const trimmed = inputText.trim();

    if (!trimmed) {
      setInputError('Task tidak boleh kosong! Tulis dulu ya 😅');
      return;
    }
    if (trimmed.length < 3) {
      setInputError('Task terlalu singkat, minimal 3 karakter!');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      text: trimmed,
      priority: selectedPriority,
      done: false,
    };

    setTasks(prev => [newTask, ...prev]);
    setInputText('');
    setInputError('');
  };

  const handleDelete = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleToggle = (id) => {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
    );
  };

  const handleInputChange = (text) => {
    setInputText(text);
    if (inputError) setInputError('');
  };

  // Empty State Component
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>
        {activeFilter === 'Selesai' ? '🎯' : activeFilter === 'Aktif' ? '🎉' : '📋'}
      </Text>
      <Text style={styles.emptyTitle}>
        {activeFilter === 'Selesai'
          ? 'Belum ada yang selesai'
          : activeFilter === 'Aktif'
          ? 'Semua task sudah selesai!'
          : 'Belum ada task nih'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'Semua'
          ? 'Tambahkan task pertama lo di atas 👆'
          : 'Coba cek filter yang lain'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.appName}>MyTaskList</Text>
            <Text style={styles.appTagline}>Produktif tiap hari 🚀</Text>
          </View>
          {/* Counter Badge */}
          <View style={styles.counterBadge}>
            <Text style={styles.counterNumber}>{doneCount}</Text>
            <Text style={styles.counterLabel}>dari {totalCount}</Text>
            <Text style={styles.counterSub}>selesai</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          {totalCount === 0
            ? 'Mulai tambah task!'
            : doneCount === totalCount
            ? '🎊 Semua selesai! Mantap!'
            : `${Math.round((doneCount / totalCount) * 100)}% selesai`}
        </Text>
      </View>

      {/* FORM INPUT */}
      <View style={styles.formContainer}>
        <View style={[styles.inputWrapper, inputError ? styles.inputWrapperError : null]}>
          <TextInput
            style={styles.textInput}
            placeholder="Tambah task baru..."
            placeholderTextColor="#555"
            value={inputText}
            onChangeText={handleInputChange}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
            maxLength={100}
          />
          <Text style={styles.charCount}>{inputText.length}/100</Text>
        </View>

        {/* Error Message */}
        {inputError ? (
          <Text style={styles.errorText}>⚠️ {inputError}</Text>
        ) : null}

        {/* Priority Selector */}
        <View style={styles.priorityRow}>
          <Text style={styles.priorityLabel}>Prioritas:</Text>
          <View style={styles.priorityButtons}>
            {Object.entries(PRIORITIES).map(([key, val]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.priorityBtn,
                  { borderColor: val.color },
                  selectedPriority === key && { backgroundColor: val.color },
                ]}
                onPress={() => setSelectedPriority(key)}
              >
                <Text style={[
                  styles.priorityBtnText,
                  { color: selectedPriority === key ? '#fff' : val.color },
                ]}>
                  {val.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask} activeOpacity={0.8}>
          <Text style={styles.addButtonText}>+ Tambah Task</Text>
        </TouchableOpacity>
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterRow}>
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
            {filter !== 'Semua' && (
              <View style={[styles.filterCount, activeFilter === filter && styles.filterCountActive]}>
                <Text style={[styles.filterCountText, activeFilter === filter && { color: '#fff' }]}>
                  {filter === 'Aktif'
                    ? tasks.filter(t => !t.done).length
                    : tasks.filter(t => t.done).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* TASK LIST */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem item={item} onDelete={handleDelete} onToggle={handleToggle} />
        )}
        ListEmptyComponent={EmptyListComponent}
        contentContainerStyle={[
          styles.listContent,
          filteredTasks.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },

  // Header
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0A0A0F',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A25',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  counterBadge: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7C3AED30',
  },
  counterNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7C3AED',
    lineHeight: 28,
  },
  counterLabel: {
    fontSize: 11,
    color: '#666',
  },
  counterSub: {
    fontSize: 10,
    color: '#444',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1A1A25',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
    textAlign: 'right',
  },

  // Form
  formContainer: {
    padding: 16,
    backgroundColor: '#0D0D18',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A25',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121E',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1E1E30',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  inputWrapperError: {
    borderColor: '#FF4757',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#E0E0E0',
    paddingVertical: 13,
  },
  charCount: {
    fontSize: 11,
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#FF4757',
    marginBottom: 8,
    marginLeft: 4,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  priorityLabel: {
    fontSize: 13,
    color: '#666',
    width: 60,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  priorityBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#0A0A0F',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#12121E',
    gap: 5,
  },
  filterTabActive: {
    backgroundColor: '#7C3AED20',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  filterText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#7C3AED',
  },
  filterCount: {
    backgroundColor: '#1E1E30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  filterCountActive: {
    backgroundColor: '#7C3AED',
  },
  filterCountText: {
    fontSize: 10,
    color: '#555',
    fontWeight: '700',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 4,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  // Task Card
  taskCard: {
    marginVertical: 5,
    borderRadius: 14,
    backgroundColor: '#12121E',
    borderWidth: 1,
    borderColor: '#1A1A2E',
    overflow: 'hidden',
  },
  taskCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#2A2A40',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D18',
  },
  checkboxDone: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  taskContent: {
    flex: 1,
    gap: 6,
  },
  taskText: {
    fontSize: 15,
    color: '#D0D0E0',
    fontWeight: '500',
    lineHeight: 20,
  },
  taskTextDone: {
    color: '#3A3A55',
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  priorityBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  doneBadge: {
    backgroundColor: '#7C3AED20',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  doneText: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '600',
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FF475715',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#FF4757',
    fontSize: 13,
    fontWeight: '700',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 52,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A3A55',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#2A2A40',
    textAlign: 'center',
  },
});