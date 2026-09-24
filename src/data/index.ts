import { isSupabaseConfigured } from '../lib/supabase';
import type { DataProvider } from './provider';
import { MockDataProvider } from './mockDataProvider';
import { SupabaseDataProvider } from './supabaseDataProvider';

export const dataProvider: DataProvider = isSupabaseConfigured
  ? new SupabaseDataProvider()
  : new MockDataProvider();
