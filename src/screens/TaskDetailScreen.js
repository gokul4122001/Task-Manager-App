import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { wp, hp, sizes, colors } from '../utils/responsive';
import { addTask, updateTask } from '../store/slices/taskSlice';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const TaskDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const existingTask = route.params?.task;
  const isEditing = !!existingTask;

  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [status, setStatus] = useState(existingTask?.status || 'Pending');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: 'Please enter a task title',
        position: 'top',
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditing && existingTask) {
        await dispatch(
          updateTask({
            id: existingTask.id,
            title: title.trim(),
            description: description.trim(),
            status,
          })
        ).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Task Updated',
          text2: 'Changes saved successfully!',
          position: 'top',
        });
      } else {
        await dispatch(
          addTask({
            title: title.trim(),
            description: description.trim(),
          })
        ).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Task Created',
          text2: 'Your new task is ready!',
          position: 'top',
        });
      }
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while saving.',
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          {/* <Icon name="arrow-back-ios" size={sizes.fontMd} color={colors.dark} /> */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Task' : 'New Task'}
        </Text>
        <View style={{ width: sizes.fontLg + sizes.sm }} />
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={colors.gray}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor={colors.gray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {isEditing && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusContainer}>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    status === 'Pending' && styles.statusOptionActive,
                  ]}
                  onPress={() => setStatus('Pending')}>
                  <Icon
                    name="pending-actions"
                    size={sizes.fontMd}
                    color={status === 'Pending' ? colors.white : colors.dark}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === 'Pending' && styles.statusOptionTextActive,
                    ]}>
                    Pending
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    status === 'Completed' && styles.statusOptionActive,
                  ]}
                  onPress={() => setStatus('Completed')}>
                  <Icon
                    name="check-circle"
                    size={sizes.fontMd}
                    color={status === 'Completed' ? colors.white : colors.dark}
                  />
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === 'Completed' && styles.statusOptionTextActive,
                    ]}>
                    Completed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isEditing && existingTask && (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Icon name="event" size={sizes.fontSm} color={colors.gray} />
                <Text style={styles.infoText}>
                  Created: {new Date(existingTask.lastUpdated).toLocaleString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon
                  name={existingTask.isSynced ? "cloud-done" : "cloud-off"}
                  size={sizes.fontSm}
                  color={colors.gray}
                />
                <Text style={styles.infoText}>
                  Sync Status: {existingTask.isSynced ? 'Synced' : 'Unsynced'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}>
              <Icon name="close" size={sizes.fontMd} color={colors.dark} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}>
              <Icon name={isEditing ? "edit" : "add"} size={sizes.fontMd} color={colors.white} />
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.sm,
    paddingVertical: sizes.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: sizes.xs,
  },
  headerTitle: {
    fontSize: sizes.fontLg,
    fontWeight: 'bold',
    color: colors.dark,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: sizes.md,
  },
  inputGroup: {
    marginBottom: sizes.md,
  },
  label: {
    fontSize: sizes.fontSm,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: sizes.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: wp('3%'),
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    fontSize: sizes.fontMd,
    color: colors.dark,
    height: sizes.inputHeight + wp('2%'),
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textArea: {
    height: hp('15%'),
    paddingTop: sizes.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: sizes.sm,
  },
  statusOption: {
    flex: 1,
    paddingVertical: sizes.sm,
    paddingHorizontal: sizes.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    gap: sizes.xs,
  },
  statusOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusOptionText: {
    fontSize: sizes.fontSm,
    fontWeight: '600',
    color: colors.dark,
  },
  statusOptionTextActive: {
    color: colors.white,
  },
  infoContainer: {
    backgroundColor: colors.light,
    padding: sizes.sm,
    borderRadius: wp('2%'),
    marginBottom: sizes.md,
    gap: sizes.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  infoText: {
    fontSize: sizes.fontXs,
    color: colors.gray,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: sizes.sm,
    marginTop: sizes.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.light,
    paddingVertical: sizes.sm,
    borderRadius: wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    gap: sizes.xs,
  },
  cancelButtonText: {
    fontSize: sizes.fontMd,
    fontWeight: '600',
    color: colors.dark,
  },
  saveButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: sizes.sm,
    borderRadius: wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: sizes.xs,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: sizes.fontMd,
    fontWeight: '600',
    color: colors.white,
  },
});
