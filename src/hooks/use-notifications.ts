'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { toast } from './use-toast';

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = 600;
    oscillator.type = 'triangle';
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);

    const oscillator2 = ctx.createOscillator();
    const gainNode2 = ctx.createGain();
    oscillator2.connect(gainNode2);
    gainNode2.connect(ctx.destination);
    oscillator2.frequency.value = 900;
    oscillator2.type = 'triangle';
    gainNode2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    oscillator2.start(ctx.currentTime + 0.15);
    oscillator2.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio not supported
  }
}

export function useNotifications() {
  const { notifications, userProfile, markNotificationRead } = useStore();
  const [notificationCount, setNotificationCount] = useState(0);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!notifications || !userProfile) return;

    const isAdmin = userProfile.role === 'admin' || userProfile.role === 'super-admin';
    const relevant = notifications.filter(n => isAdmin || n.userId === userProfile.uid);

    const unreadCount = relevant.filter(n => !n.read).length;
    setNotificationCount(unreadCount);

    // On first run, just seed seen IDs without toasts
    if (!isInitializedRef.current) {
      relevant.forEach(n => seenIdsRef.current.add(n.id));
      isInitializedRef.current = true;
      return;
    }

    // Detect genuinely new notifications (not in seen set)
    const newOnes = relevant.filter(n => !seenIdsRef.current.has(n.id));
    if (newOnes.length === 0) return;

    newOnes.forEach(n => seenIdsRef.current.add(n.id));

    newOnes.slice(0, 3).forEach(n => {
      toast({ title: n.title, description: n.message, duration: 5000 });
    });
    playNotificationSound();
  }, [notifications, userProfile]);

  const markAsSeen = useCallback(() => {
    if (!notifications || !userProfile) return;

    const isAdmin = userProfile.role === 'admin' || userProfile.role === 'super-admin';
    const relevant = notifications.filter(n => isAdmin || n.userId === userProfile.uid);

    const unread = relevant.filter(n => !n.read);
    unread.forEach(n => markNotificationRead(n.id));
    setNotificationCount(0);
  }, [notifications, userProfile, markNotificationRead]);

  return { notificationCount, markAsSeen };
}
