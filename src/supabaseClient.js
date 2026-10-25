import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// IMPORTANT: Replace these with your actual Supabase project credentials
// Get these from: https://app.supabase.com/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Save monthly history to Supabase
 * @param {Array} historyData - Array of monthly history records
 * @param {string} userId - User ID
 * @returns {Promise} Supabase response
 */
export const saveMonthlyHistory = async (historyData, userId) => {
  try {
    // First, delete existing records for this user to avoid duplicates
    await supabase
      .from('monthly_history')
      .delete()
      .eq('user_id', userId);

    // Insert new records
    const recordsToInsert = historyData.map((record, index) => ({
      user_id: userId,
      month: record.month,
      date: record.date,
      inputs: record.inputs,
      results: record.results,
      comment: record.comment || '',
      commented_at: record.commentedAt || null,
      commented_by: record.commentedBy || null,
      last_edited_at: record.lastEditedAt || null,
      last_edited_by: record.lastEditedBy || null,
      edit_reason: record.editReason || null,
      order_index: index,
    }));

    const { data, error } = await supabase
      .from('monthly_history')
      .insert(recordsToInsert);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving monthly history:', error);
    return { success: false, error };
  }
};

/**
 * Load monthly history from Supabase
 * @param {string} userId - User ID
 * @returns {Promise} Array of monthly history records
 */
export const loadMonthlyHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('monthly_history')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true });

    if (error) throw error;

    // Transform data back to app format
    return data.map(record => ({
      month: record.month,
      date: record.date,
      inputs: record.inputs,
      results: record.results,
      comment: record.comment,
      commentedAt: record.commented_at,
      commentedBy: record.commented_by,
      lastEditedAt: record.last_edited_at,
      lastEditedBy: record.last_edited_by,
      editReason: record.edit_reason,
    }));
  } catch (error) {
    console.error('Error loading monthly history:', error);
    return [];
  }
};

/**
 * Save recycle bin to Supabase
 * @param {Array} recycleBinData - Array of deleted records
 * @param {string} userId - User ID
 * @returns {Promise} Supabase response
 */
export const saveRecycleBin = async (recycleBinData, userId) => {
  try {
    // Delete existing recycle bin records
    await supabase
      .from('recycle_bin')
      .delete()
      .eq('user_id', userId);

    // Insert new records
    const recordsToInsert = recycleBinData.map(record => ({
      user_id: userId,
      month: record.month,
      date: record.date,
      inputs: record.inputs,
      results: record.results,
      comment: record.comment || '',
      deleted_at: record.deletedAt,
      deletion_reason: record.deletionReason,
      deleted_by: record.deletedBy,
      deletion_type: record.deletionType || 'MANUAL',
    }));

    const { data, error } = await supabase
      .from('recycle_bin')
      .insert(recordsToInsert);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving recycle bin:', error);
    return { success: false, error };
  }
};

/**
 * Load recycle bin from Supabase
 * @param {string} userId - User ID
 * @returns {Promise} Array of deleted records
 */
export const loadRecycleBin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('recycle_bin')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Transform data back to app format
    return data.map(record => ({
      month: record.month,
      date: record.date,
      inputs: record.inputs,
      results: record.results,
      comment: record.comment,
      deletedAt: record.deleted_at,
      deletionReason: record.deletion_reason,
      deletedBy: record.deleted_by,
      deletionType: record.deletion_type,
    }));
  } catch (error) {
    console.error('Error loading recycle bin:', error);
    return [];
  }
};

/**
 * Save cycle archives to Supabase
 * @param {Array} archivesData - Array of archived cycles
 * @param {string} userId - User ID
 * @returns {Promise} Supabase response
 */
export const saveCycleArchives = async (archivesData, userId) => {
  try {
    // Delete existing archives
    await supabase
      .from('cycle_archives')
      .delete()
      .eq('user_id', userId);

    // Insert new records
    const recordsToInsert = archivesData.map(archive => ({
      user_id: userId,
      archived_at: archive.archivedAt,
      archived_by: archive.archivedBy,
      reason: archive.reason,
      cycle_data: archive.cycleData,
    }));

    const { data, error } = await supabase
      .from('cycle_archives')
      .insert(recordsToInsert);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving cycle archives:', error);
    return { success: false, error };
  }
};

/**
 * Load cycle archives from Supabase
 * @param {string} userId - User ID
 * @returns {Promise} Array of archived cycles
 */
export const loadCycleArchives = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('cycle_archives')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Transform data back to app format
    return data.map(archive => ({
      archivedAt: archive.archived_at,
      archivedBy: archive.archived_by,
      reason: archive.reason,
      cycleData: archive.cycle_data,
    }));
  } catch (error) {
    console.error('Error loading cycle archives:', error);
    return [];
  }
};

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

/**
 * Migrate data from localStorage to Supabase (one-time migration)
 * @param {string} userId - User ID
 * @returns {Promise} Migration status
 */
export const migrateFromLocalStorage = async (userId) => {
  try {
    console.log('Starting migration from localStorage to Supabase...');

    // Migrate monthly history
    const localHistory = JSON.parse(localStorage.getItem('vehicleAccountingHistory') || '[]');
    if (localHistory.length > 0) {
      await saveMonthlyHistory(localHistory, userId);
      console.log(`Migrated ${localHistory.length} monthly history records`);
    }

    // Migrate recycle bin
    const localRecycleBin = JSON.parse(localStorage.getItem('recycleBin') || '[]');
    if (localRecycleBin.length > 0) {
      await saveRecycleBin(localRecycleBin, userId);
      console.log(`Migrated ${localRecycleBin.length} recycle bin records`);
    }

    // Migrate cycle archives
    const localArchives = JSON.parse(localStorage.getItem('cycleArchives') || '[]');
    if (localArchives.length > 0) {
      await saveCycleArchives(localArchives, userId);
      console.log(`Migrated ${localArchives.length} cycle archives`);
    }

    // Mark migration as complete
    localStorage.setItem('migratedToSupabase', 'true');
    console.log('Migration completed successfully!');

    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error };
  }
};
