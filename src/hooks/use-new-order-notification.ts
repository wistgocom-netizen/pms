'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import * as db from '@/lib/db';
import { toast } from './use-toast';

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);

    const oscillator2 = ctx.createOscillator();
    const gainNode2 = ctx.createGain();
    oscillator2.connect(gainNode2);
    gainNode2.connect(ctx.destination);
    oscillator2.frequency.value = 1200;
    oscillator2.type = 'sine';
    gainNode2.gain.setValueAtTime(0.3, ctx.currentTime + 0.1);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    oscillator2.start(ctx.currentTime + 0.1);
    oscillator2.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio not supported
  }
}

export function useNewOrderNotifications() {
  const { sales, userProfile } = useStore();
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);
  const seededRef = useRef(false);

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';

  const markOrdersAsSeen = useCallback(() => {
    setNewOrderCount(0);
    setRecentOrders([]);
  }, []);

  // Mark all seen IDs from store on mount & detect same-tab additions
  useEffect(() => {
    if (!sales) return;
    if (!isAdmin) {
      setNewOrderCount(0);
      setRecentOrders([]);
      return;
    }
    // Only seed on the first data load that has items
    if (!seededRef.current) {
      sales.forEach((s: any) => seenOrderIdsRef.current.add(s.id));
      seededRef.current = true;
      isInitializedRef.current = true;
      return;
    }
    const newOnes = sales.filter((s: any) => !seenOrderIdsRef.current.has(s.id));
    if (newOnes.length === 0) return;

    newOnes.forEach((s: any) => seenOrderIdsRef.current.add(s.id));
    setNewOrderCount(prev => prev + newOnes.length);
    setRecentOrders(prev => [...newOnes.slice(0, 5), ...prev].slice(0, 5));

    const orderNames = newOnes.slice(0, 3).map((o: any) => o.customerName || o.id).join(', ');
    toast({
      title: `New Order${newOnes.length > 1 ? 's' : ''} Received!`,
      description: `${orderNames}${newOnes.length > 3 ? ` and ${newOnes.length - 3} more` : ''}`,
      duration: 5000,
    });
    playNotificationSound();
  }, [sales, isAdmin]);

  // Poll Supabase every 4s for cross-tab orders
  useEffect(() => {
    const orgId = userProfile?.organizationId;
    if (!orgId) return;
    if (!isAdmin) return;

    const poll = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('sales')
          .select('*')
          .eq('organization_id', orgId)
          .order('sale_date', { ascending: false });

        if (!data) return;
        const latest = data.map((r: any) => db.keysToCamel<any>({ ...r, saleDate: r.sale_date, items: [] }));

        const newOnes = latest.filter((s: any) => !seenOrderIdsRef.current.has(s.id));
        if (newOnes.length === 0) return;
        if (!isInitializedRef.current) {
          newOnes.forEach((s: any) => seenOrderIdsRef.current.add(s.id));
          return;
        }

        newOnes.forEach((s: any) => seenOrderIdsRef.current.add(s.id));
        setNewOrderCount(prev => prev + newOnes.length);
        setRecentOrders(prev => [...newOnes.slice(0, 5), ...prev].slice(0, 5));

        const orderNames = newOnes.slice(0, 3).map((o: any) => o.customerName || o.id).join(', ');
        toast({
          title: `New Order${newOnes.length > 1 ? 's' : ''} Received!`,
          description: `${orderNames}${newOnes.length > 3 ? ` and ${newOnes.length - 3} more` : ''}`,
          duration: 5000,
        });
        playNotificationSound();
      } catch {
        // ignore polling errors
      }
    }, 4000);

    return () => clearInterval(poll);
  }, [userProfile?.organizationId, isAdmin]);

  return { newOrderCount, recentOrders, markOrdersAsSeen };
}
