import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { AppText } from '@/components/ui/text';
import { usePalette, radius, spacing } from '@/constants/theme';
import { addCallRecord } from '@/lib/call-store';
import { useAuth } from '@/providers/auth-provider';
import type { CallDirection, CallKind, CallStatus, Contact } from '@/types';
import { formatDuration } from '@/utils/format';

type CallScreenProps = {
  contact: Contact;
  kind: CallKind;
  direction: CallDirection;
};

type ControlTone = 'default' | 'active' | 'danger' | 'success';

type CallControlProps = {
  name: ComponentProps<typeof SymbolView>['name'];
  label: string;
  onPress: () => void;
  tone?: ControlTone;
  size?: number;
  iconSize?: number;
};

function CallControl({
  name,
  label,
  onPress,
  tone = 'default',
  size = 60,
  iconSize = 24,
}: CallControlProps) {
  const palette = usePalette();
  const backgroundColor =
    tone === 'danger'
      ? palette.danger
      : tone === 'success'
        ? palette.success
        : tone === 'active'
          ? palette.accent
          : palette.surfaceMuted;
  const tintColor = tone === 'active' ? palette.onAccent : palette.text;

  return (
    <View style={styles.controlGroup}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [
          styles.control,
          { width: size, height: size, borderRadius: size / 2, backgroundColor },
          pressed && styles.controlPressed,
        ]}>
        <SymbolView
          name={name}
          tintColor={tintColor}
          size={iconSize}
          style={{ width: iconSize, height: iconSize }}
        />
      </Pressable>
      <AppText variant="tiny" color={palette.textSecondary} style={styles.controlLabel}>
        {label}
      </AppText>
    </View>
  );
}

export function CallScreen({ contact, kind, direction }: CallScreenProps) {
  const { user } = useAuth();
  const palette = usePalette();
  const [status, setStatus] = useState<CallStatus>(
    direction === 'incoming' ? 'incoming' : 'ringing'
  );
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(kind === 'video');
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [speakerOn, setSpeakerOn] = useState(kind === 'audio');

  const startedAtRef = useRef(0);
  const connectedAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const callIdRef = useRef('');
  const acceptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const now = Date.now();
    startedAtRef.current = now;
    callIdRef.current = `${now}-${Math.random().toString(36).slice(2, 8)}`;
  }, []);

  const complete = useCallback(
    (outcome: CallStatus, delay = 900) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setStatus(outcome);

      const connectedAt = connectedAtRef.current;
      const durationSeconds = connectedAt
        ? Math.max(0, Math.floor((Date.now() - connectedAt) / 1000))
        : 0;

      void addCallRecord({
        id: callIdRef.current,
        contactId: contact.id,
        kind,
        direction,
        status: outcome,
        startedAt: startedAtRef.current,
        durationSeconds,
      });

      setTimeout(() => router.back(), delay);
    },
    [contact.id, direction, kind]
  );

  useEffect(() => {
    if (direction !== 'outgoing') return;

    const connectingTimer = setTimeout(() => {
      if (!finishedRef.current) setStatus('connecting');
    }, 1600);
    const connectedTimer = setTimeout(() => {
      if (!finishedRef.current) setStatus('connected');
    }, 2600);

    return () => {
      clearTimeout(connectingTimer);
      clearTimeout(connectedTimer);
    };
  }, [direction]);

  useEffect(() => {
    if (status !== 'connected') return;

    if (!connectedAtRef.current) connectedAtRef.current = Date.now();
    const connectedAt = connectedAtRef.current;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - connectedAt) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== 'incoming') return;

    const timer = setTimeout(() => complete('missed', 1200), 25000);
    return () => clearTimeout(timer);
  }, [status, complete]);

  useEffect(() => {
    return () => {
      if (acceptTimerRef.current) clearTimeout(acceptTimerRef.current);
    };
  }, []);

  function handleAccept() {
    setStatus('connecting');
    acceptTimerRef.current = setTimeout(() => {
      if (!finishedRef.current) setStatus('connected');
    }, 700);
  }

  const handleEnd = useCallback(() => {
    if (direction === 'incoming' && status === 'incoming') {
      complete('declined');
      return;
    }

    complete(status === 'connected' ? 'ended' : 'cancelled');
  }, [complete, direction, status]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleEnd();
      return true;
    });

    return () => subscription.remove();
  }, [handleEnd]);

  function statusText() {
    switch (status) {
      case 'incoming':
        return `Incoming ${kind} call`;
      case 'ringing':
        return 'Ringing…';
      case 'connecting':
        return 'Connecting…';
      case 'connected':
        return formatDuration(elapsed);
      case 'declined':
        return 'Call declined';
      case 'missed':
        return 'Missed call';
      case 'cancelled':
        return 'Call cancelled';
      default:
        return 'Call ended';
    }
  }

  const ownInitialName = user?.name ?? 'You';

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <View style={[styles.kindPill, { backgroundColor: palette.surfaceMuted }]}>
            <SymbolView
              name={
                kind === 'video'
                  ? { ios: 'video.fill', android: 'videocam', web: 'videocam' }
                  : { ios: 'phone.fill', android: 'phone', web: 'phone' }
              }
              tintColor={palette.textSecondary}
              size={11}
              style={styles.kindIcon}
            />
            <AppText variant="tiny" color={palette.textSecondary} style={styles.kindLabel}>
              LIMO {kind === 'video' ? 'VIDEO' : 'AUDIO'}
            </AppText>
          </View>

          <AppText variant="title" style={styles.name}>
            {contact.name}
          </AppText>
          <AppText
            variant="subhead"
            color={status === 'connected' ? palette.online : palette.textSecondary}
            style={styles.status}>
            {statusText()}
          </AppText>
        </View>

        <View style={styles.stage}>
          {kind === 'video' ? (
            <View style={[styles.remote, { backgroundColor: palette.decorative }]}>
              <Avatar name={contact.name} color={contact.color} size={92} />
              <AppText variant="subhead" color={palette.textSecondary}>
                {status === 'connected' ? 'Camera preview unavailable' : 'Waiting for video…'}
              </AppText>

              <View style={[styles.localPreview, { backgroundColor: palette.surfaceStrong, borderColor: palette.borderStrong }]}>
                {cameraOn ? (
                  <Avatar name={ownInitialName} color={palette.surfaceStrong} size={54} />
                ) : (
                  <SymbolView
                    name={{ ios: 'video.slash.fill', android: 'videocam_off', web: 'videocam_off' }}
                    tintColor={palette.textTertiary}
                    size={22}
                    style={styles.localIcon}
                  />
                )}
                <AppText variant="tiny" color={palette.textTertiary} style={styles.localLabel}>
                  {cameraOn ? (facing === 'front' ? 'Front' : 'Rear') : 'Camera off'}
                </AppText>
              </View>
            </View>
          ) : (
            <View style={styles.audioStage}>
              <View style={styles.ringsLayer} pointerEvents="none">
                <View style={styles.rings}>
                  <View style={styles.ringOuter} />
                  <View style={styles.ringInner} />
                </View>
              </View>
              <Avatar name={contact.name} color={contact.color} size={120} />
            </View>
          )}
        </View>

        <View style={styles.controls}>
          {status === 'incoming' ? (
            <View style={styles.incomingControls}>
              <CallControl
                name={{ ios: 'phone.down.fill', android: 'call_end', web: 'call_end' }}
                label="Decline"
                onPress={() => complete('declined')}
                tone="danger"
                size={72}
                iconSize={28}
              />
              <CallControl
                name={{ ios: 'phone.fill', android: 'phone', web: 'phone' }}
                label="Accept"
                onPress={handleAccept}
                tone="success"
                size={72}
                iconSize={28}
              />
            </View>
          ) : (
            <View style={styles.activeControls}>
              <CallControl
                name={
                  muted
                    ? { ios: 'mic.slash.fill', android: 'mic_off', web: 'mic_off' }
                    : { ios: 'mic.fill', android: 'mic', web: 'mic' }
                }
                label={muted ? 'Unmute' : 'Mute'}
                onPress={() => setMuted((value) => !value)}
                tone={muted ? 'active' : 'default'}
              />

              {kind === 'video' ? (
                <>
                  <CallControl
                    name={
                      cameraOn
                        ? { ios: 'video.fill', android: 'videocam', web: 'videocam' }
                        : { ios: 'video.slash.fill', android: 'videocam_off', web: 'videocam_off' }
                    }
                    label={cameraOn ? 'Camera off' : 'Camera on'}
                    onPress={() => setCameraOn((value) => !value)}
                    tone={cameraOn ? 'default' : 'active'}
                  />
                  <CallControl
                    name={{
                      ios: 'arrow.triangle.2.circlepath.camera',
                      android: 'flip_camera_android',
                      web: 'flip_camera_android',
                    }}
                    label="Flip"
                    onPress={() =>
                      setFacing((value) => (value === 'front' ? 'back' : 'front'))
                    }
                  />
                </>
              ) : (
                <CallControl
                  name={
                    speakerOn
                      ? { ios: 'speaker.wave.2.fill', android: 'volume_up', web: 'volume_up' }
                      : { ios: 'speaker.slash.fill', android: 'volume_off', web: 'volume_off' }
                  }
                  label={speakerOn ? 'Speaker off' : 'Speaker on'}
                  onPress={() => setSpeakerOn((value) => !value)}
                  tone={speakerOn ? 'default' : 'active'}
                />
              )}

              <CallControl
                name={{ ios: 'phone.down.fill', android: 'call_end', web: 'call_end' }}
                label="End"
                onPress={handleEnd}
                tone="danger"
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  top: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    gap: spacing.xs,
  },
  kindPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  kindIcon: {
    width: 11,
    height: 11,
  },
  kindLabel: {
    letterSpacing: 1,
  },
  name: {
    marginTop: spacing.md,
  },
  status: {
    fontVariant: ['tabular-nums'],
  },
  stage: {
    flex: 1,
    paddingVertical: spacing.lg,
  },
  remote: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: 28,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  localPreview: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 96,
    height: 132,
    borderRadius: radius.xl,
    borderCurve: 'continuous',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  localIcon: {
    width: 22,
    height: 22,
  },
  localLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  audioStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringsLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rings: {
    width: 240,
    height: 240,
  },
  ringOuter: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 120,
    borderWidth: 1,
  },
  ringInner: {
    position: 'absolute',
    top: 28,
    left: 28,
    width: 184,
    height: 184,
    borderRadius: 92,
    borderWidth: 1,
  },
  controls: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  incomingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  controlGroup: {
    alignItems: 'center',
    gap: spacing.sm,
    width: 62,
  },
  control: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlPressed: {
    opacity: 0.72,
  },
  controlLabel: {
    textAlign: 'center',
  },
});
