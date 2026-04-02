import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { authFetch } from '../../../services/api';

/**
 * Pan/zoom: `Gesture.Pan()` + `Gesture.Pinch()` + `Gesture.Simultaneous` with `GestureDetector`
 * (RNGH 2). This is the supported pairing with Reanimated 4; it replaces wiring
 * `PanGestureHandler` / `PinchGestureHandler` manually with `useAnimatedGestureHandler`
 * (removed in Reanimated 3+).
 */

const colors = {
  primary: '#3a5a40',
  sage: '#588157',
  sageLight: '#a3b18a',
  bg: '#f5f5f4',
  text: '#44403c',
  muted: '#a8a29e',
  white: '#ffffff',
};

const CANVAS_BG = '#f7f3ee';
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CANVAS_W = Math.max(SCREEN_W * 2, 1600);
const CANVAS_H = Math.max(SCREEN_H * 2, 1600);

type StickyNote = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  emoji?: string;
};

type DashboardPayload = {
  name?: string;
  notes?: StickyNote[];
  collaborators?: unknown[];
};

export type CanvasScreenParams = {
  Canvas: { dashboardId: string; tripName?: string };
};

type Props = NativeStackScreenProps<CanvasScreenParams, 'Canvas'>;

function truncateText(s: string, max: number) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export default function CanvasScreen({ route, navigation }: Props) {
  const { dashboardId, tripName } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [selectedNote, setSelectedNote] = useState<StickyNote | null>(null);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const pinchStartScale = useSharedValue(1);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await authFetch(`/api/boards/${dashboardId}`);
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        data?: { dashboard?: DashboardPayload };
        message?: string;
      };
      if (!res.ok) {
        throw new Error(json.message ?? 'Failed to load board');
      }
      setDashboard(json.data?.dashboard ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load board');
      setDashboard(null);
    }
  }, [dashboardId]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await load();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [load]);

  const title = dashboard?.name?.trim() || tripName || 'Planning board';

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  const panGesture = Gesture.Pan()
    .minDistance(12)
    .onStart(() => {
      panStartX.value = translateX.value;
      panStartY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = panStartX.value + e.translationX;
      translateY.value = panStartY.value + e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(translateX.value, { damping: 20, stiffness: 200 });
      translateY.value = withSpring(translateY.value, { damping: 20, stiffness: 200 });
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      pinchStartScale.value = scale.value;
    })
    .onUpdate((e) => {
      const next = pinchStartScale.value * e.scale;
      scale.value = Math.min(3, Math.max(0.3, next));
    })
    .onEnd(() => {
      scale.value = withSpring(scale.value, { damping: 18, stiffness: 220 });
    });

  const canvasGestures = Gesture.Simultaneous(panGesture, pinchGesture);

  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const notes = dashboard?.notes ?? [];
  const collaboratorCount = dashboard?.collaborators?.length ?? 0;

  const openNote = useCallback((note: StickyNote) => {
    setSelectedNote(note);
  }, []);

  const onAddNote = () => {
    Alert.alert(
      'Add note',
      'Adding a sticky note will call POST /api/boards/:id when the endpoint is wired up.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.screenTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{collaboratorCount} collaborators</Text>
        </View>
      </View>

      {error ? <Text style={styles.bannerError}>{error}</Text> : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingHint}>Loading board…</Text>
        </View>
      ) : (
        <View style={styles.canvasViewport}>
          <GestureDetector gesture={canvasGestures}>
            <Animated.View style={[styles.canvas, canvasStyle]}>
              {notes.map((note) => {
                const doubleTap = Gesture.Tap()
                  .numberOfTaps(2)
                  .onEnd(() => {
                    runOnJS(openNote)(note);
                  });
                return (
                  <GestureDetector key={note.id} gesture={doubleTap}>
                    <View
                      style={[
                        styles.note,
                        {
                          left: note.x,
                          top: note.y,
                          width: note.width,
                          height: note.height,
                          backgroundColor: note.color || colors.sageLight,
                        },
                      ]}
                    >
                      {note.emoji ? <Text style={styles.noteEmoji}>{note.emoji}</Text> : null}
                      <Text style={styles.noteText} numberOfLines={4} ellipsizeMode="tail">
                        {truncateText(note.content, 120)}
                      </Text>
                    </View>
                  </GestureDetector>
                );
              })}
            </Animated.View>
          </GestureDetector>
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={onAddNote}
        activeOpacity={0.85}
        accessibilityLabel="Add note"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={selectedNote != null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNote(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedNote(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Note</Text>
            {selectedNote?.emoji ? (
              <Text style={styles.modalEmoji}>{selectedNote.emoji}</Text>
            ) : null}
            <Text style={styles.modalBody}>{selectedNote?.content ?? ''}</Text>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedNote(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  screenTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.sageLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  bannerError: {
    color: '#b91c1c',
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingHint: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 15,
  },
  canvasViewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: CANVAS_BG,
  },
  canvas: {
    width: CANVAS_W,
    height: CANVAS_H,
    backgroundColor: CANVAS_BG,
  },
  note: {
    position: 'absolute',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(68, 64, 60, 0.12)',
    justifyContent: 'flex-start',
  },
  noteEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(68, 64, 60, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  modalClose: {
    marginTop: 20,
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalCloseText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
});
