import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { wp, hp, sizes, colors } from '../utils/responsive';
import {
  loadTasks,
  deleteTask,
  toggleTaskStatus,
  syncTasks,
} from '../store/slices/taskSlice';

const TaskItem = React.memo(({ item, index, onEdit, onDelete, onToggle }) => {
  const cardColor = colors.cardPalette[index % colors.cardPalette.length];

  return (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: cardColor }]}
      onPress={() => onEdit(item)}
      activeOpacity={0.8}>
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.isSynced && (
            <View style={styles.unsyncedBadge}>
              <Icon name="sync-problem" size={sizes.fontXs} color={colors.white} />
              <Text style={styles.unsyncedText}>Unsynced</Text>
            </View>
          )}
        </View>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.taskFooter}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              item.status === 'Completed'
                ? styles.completedButton
                : styles.pendingButton,
            ]}
            onPress={() => onToggle(item.id)}>
            <Icon
              name={item.status === 'Completed' ? 'check-circle' : 'pending-actions'}
              size={sizes.fontSm}
              color={colors.white}
            />
            <Text style={styles.statusText}>{item.status}</Text>
          </TouchableOpacity>
          <View style={styles.timeContainer}>
            <Icon name="access-time" size={sizes.fontXs} color={colors.gray} />
            <Text style={styles.timestamp}>
              {new Date(item.lastUpdated).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}>
        <Icon name="delete-outline" size={sizes.fontLg} color={colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export const TaskListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { tasks, loading, syncing } = useSelector(
    state => state.tasks
  );

  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState(null);

  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const animationRef = React.useRef(null);

  useEffect(() => {
    dispatch(loadTasks());
  }, [dispatch]);

  useEffect(() => {
    if (syncing) {
      rotateAnim.setValue(0);
      animationRef.current = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animationRef.current.start();
    } else {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      rotateAnim.setValue(0);
    }
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [syncing, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleAddTask = React.useCallback(() => {
    navigation.navigate('TaskDetail', {});
  }, [navigation]);

  const handleEditTask = React.useCallback((task) => {
    navigation.navigate('TaskDetail', { task });
  }, [navigation]);

  const requestDeleteTask = React.useCallback((id) => {
    setTaskToDelete(id);
    setDeleteModalVisible(true);
  }, []);

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      await dispatch(deleteTask(taskToDelete)).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Task Deleted',
        text2: 'The task has been successfully removed.',
        position: 'top',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete task',
        position: 'top',
      });
    } finally {
      setDeleteModalVisible(false);
      setTaskToDelete(null);
    }
  };

  const handleToggleStatus = React.useCallback(async (id) => {
    try {
      const result = await dispatch(toggleTaskStatus(id)).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Status Updated',
        text2: `Task marked as ${result.status}`,
        position: 'top',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update status',
        position: 'top',
      });
    }
  }, [dispatch]);

  const handleSync = React.useCallback(async () => {
    try {
      await dispatch(syncTasks()).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Sync Successful',
        text2: 'All tasks are up to date.',
        position: 'top',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: 'Please try again later.',
        position: 'top',
      });
    }
  }, [dispatch]);

  const renderTask = React.useCallback(({ item, index }) => (
    <TaskItem
      item={item}
      index={index}
      onEdit={handleEditTask}
      onDelete={requestDeleteTask}
      onToggle={handleToggleStatus}
    />
  ), [handleEditTask, requestDeleteTask, handleToggleStatus]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.syncButton, syncing && styles.syncingButton]}
            onPress={handleSync}
            disabled={syncing}>
            <Animated.View style={syncing && { transform: [{ rotate }] }}>
              <Icon name="sync" size={sizes.fontMd} color={colors.white} />
            </Animated.View>
            <Text style={styles.syncButtonText}>
              {syncing ? 'Syncing...' : 'Sync'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => dispatch(loadTasks())}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <LottieView
              source={require('../assets/animations/No_Data_Animation.json')}
              autoPlay
              loop
              style={styles.emptyLottie}
            />
            <Text style={styles.emptyText}>No Tasks Found</Text>
            <Text style={styles.emptySubText}>
              Start by adding your first task today!
            </Text>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddTask}
        activeOpacity={0.8}>
        <Icon name="add" size={sizes.fontXl} color={colors.white} />
      </TouchableOpacity>

      {/* Syncing Overlay */}
      <Modal transparent visible={syncing} animationType="fade">
        <View style={styles.syncModalContainer}>
          <View style={styles.syncContent}>
            <LottieView
              source={require('../assets/animations/sync.json')}
              autoPlay
              loop
              style={styles.syncLottie}
            />
            <Text style={styles.syncTitle}>Syncing in progress...</Text>
            <Text style={styles.syncSubTitle}>Please wait while we update your tasks</Text>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={deleteModalVisible}
        animationType="slide"
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteIconContainer}>
              <LottieView
                source={require('../assets/animations/delete.json')}
                autoPlay
                loop
                style={styles.deleteLottie}
              />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Task?</Text>
            <Text style={styles.deleteModalText}>
              This action cannot be undone. Are you sure you want to delete this task?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={confirmDeleteTask}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sizes.md,
    paddingVertical: sizes.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: sizes.fontLg,
    fontWeight: 'bold',
    color: colors.dark,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: sizes.sm,
  },
  syncButton: {
    backgroundColor: colors.info,
    paddingHorizontal: sizes.sm,
    paddingVertical: sizes.xs,
    borderRadius: wp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  syncingButton: {
    opacity: 0.7,
  },
  syncButtonText: {
    color: colors.white,
    fontSize: sizes.fontSm,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: hp('4%'),
    right: wp('6%'),
    backgroundColor: colors.primary,
    width: wp('16%'),
    height: wp('16%'),
    borderRadius: wp('8%'),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  listContainer: {
    padding: sizes.md,
    paddingBottom: hp('10%'),
  },
  taskCard: {
    borderRadius: wp('5%'),
    marginBottom: sizes.md,
    padding: sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.xs,
  },
  taskTitle: {
    fontSize: sizes.fontMd,
    fontWeight: 'bold',
    color: colors.dark,
    flex: 1,
    marginRight: sizes.sm,
  },
  unsyncedBadge: {
    backgroundColor: colors.unsynced,
    paddingHorizontal: sizes.xs,
    paddingVertical: wp('0.5%'),
    borderRadius: wp('1%'),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
  },
  unsyncedText: {
    color: colors.white,
    fontSize: sizes.fontXs,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: sizes.fontSm,
    color: colors.gray,
    marginBottom: sizes.sm,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
  },
  statusButton: {
    paddingHorizontal: sizes.sm,
    paddingVertical: wp('1.5%'),
    borderRadius: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.xs,
    elevation: 2,
  },
  pendingButton: {
    backgroundColor: 'rgba(240, 173, 78, 0.9)',
  },
  completedButton: {
    backgroundColor: 'rgba(92, 184, 92, 0.9)',
  },
  statusText: {
    color: colors.white,
    fontSize: sizes.fontXs,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: sizes.fontXs,
    color: colors.gray,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: sizes.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('10%'),
  },
  emptyLottie: {
    width: wp('80%'),
    height: wp('80%'),
  },
  emptyText: {
    fontSize: sizes.fontLg,
    fontWeight: 'bold',
    color: colors.dark,
    marginTop: sizes.md,
    marginBottom: sizes.xs,
  },
  emptySubText: {
    fontSize: sizes.fontSm,
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: sizes.xl,
  },
  syncModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncContent: {
    backgroundColor: colors.white,
    padding: sizes.xl,
    borderRadius: wp('4%'),
    alignItems: 'center',
    width: wp('80%'),
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  syncLottie: {
    width: wp('40%'),
    height: wp('40%'),
    marginBottom: sizes.md,
  },
  syncTitle: {
    fontSize: sizes.fontMd,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: sizes.xs,
  },
  syncSubTitle: {
    fontSize: sizes.fontSm,
    color: colors.gray,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: sizes.xl,
  },
  deleteModalContent: {
    backgroundColor: colors.white,
    borderRadius: wp('6%'),
    padding: sizes.lg,
    width: wp('85%'),
    alignItems: 'center',
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  deleteIconContainer: {
    width: wp('20%'),
    height: wp('20%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: sizes.sm,
  },
  deleteLottie: {
    width: '100%',
    height: '100%',
  },
  deleteModalTitle: {
    fontSize: sizes.fontLg,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: sizes.sm,
  },
  deleteModalText: {
    fontSize: sizes.fontMd,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: sizes.xl,
    lineHeight: sizes.fontLg,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: wp('3%'),
  },
  modalCancelButton: {
    flex: 1,
    height: sizes.buttonHeight,
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  modalCancelText: {
    fontSize: sizes.fontMd,
    fontWeight: 'bold',
    color: colors.dark,
  },
  modalDeleteButton: {
    flex: 1,
    height: sizes.buttonHeight,
    borderRadius: wp('3%'),
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  modalDeleteText: {
    fontSize: sizes.fontMd,
    fontWeight: 'bold',
    color: colors.white,
  },
});
