// Audit Log System for tracking all administrative actions

export const AUDIT_ACTIONS = {
  DELETE_MONTH: 'DELETE_MONTH',
  EDIT_MONTH: 'EDIT_MONTH',
  ADD_COMMENT: 'ADD_COMMENT',
  RESTORE_MONTH: 'RESTORE_MONTH',
  PERMANENT_DELETE: 'PERMANENT_DELETE',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
};

/**
 * Create an audit log entry
 * @param {string} action - Action type from AUDIT_ACTIONS
 * @param {Object} data - Additional data (monthId, reason, changes, etc.)
 * @param {Object} user - User performing the action
 * @returns {Object} Audit log entry
 */
export const createAuditLog = (action, data, user) => {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    action,
    timestamp: new Date().toISOString(),
    user: {
      username: user.username,
      name: user.name,
      role: user.role,
    },
    data: {
      ...data,
      userAgent: navigator.userAgent,
      ipAddress: 'N/A', // Would come from backend in production
    },
  };
};

/**
 * Save audit log to localStorage
 * @param {Object} logEntry - Audit log entry
 */
export const saveAuditLog = (logEntry) => {
  try {
    const logs = getAuditLogs();
    logs.unshift(logEntry);
    
    // Keep only last 1000 entries to prevent localStorage overflow
    const trimmedLogs = logs.slice(0, 1000);
    
    localStorage.setItem('auditLogs', JSON.stringify(trimmedLogs));
    return true;
  } catch (error) {
    console.error('Failed to save audit log:', error);
    return false;
  }
};

/**
 * Get all audit logs from localStorage
 * @returns {Array} Array of audit log entries
 */
export const getAuditLogs = () => {
  try {
    const logs = localStorage.getItem('auditLogs');
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Failed to retrieve audit logs:', error);
    return [];
  }
};

/**
 * Get audit logs for a specific month
 * @param {string} monthId - Month identifier
 * @returns {Array} Array of audit log entries for the month
 */
export const getMonthAuditLogs = (monthId) => {
  const logs = getAuditLogs();
  return logs.filter((log) => log.data.monthId === monthId);
};

/**
 * Format audit log for display
 * @param {Object} log - Audit log entry
 * @param {string} language - Display language ('english', 'amharic', 'both')
 * @returns {string} Formatted log message
 */
export const formatAuditLog = (log, language = 'english') => {
  const date = new Date(log.timestamp).toLocaleString();
  
  const messages = {
    [AUDIT_ACTIONS.DELETE_MONTH]: {
      en: `Deleted month "${log.data.monthName}" - Reason: ${log.data.reason}`,
      am: `ወሩ "${log.data.monthName}" ተሰርዟል - ምክንያት: ${log.data.reason}`,
    },
    [AUDIT_ACTIONS.EDIT_MONTH]: {
      en: `Edited month "${log.data.monthName}" - Reason: ${log.data.reason}`,
      am: `ወሩ "${log.data.monthName}" ተስተካክሏል - ምክንያት: ${log.data.reason}`,
    },
    [AUDIT_ACTIONS.ADD_COMMENT]: {
      en: `Added comment to "${log.data.monthName}"`,
      am: `ለ"${log.data.monthName}" አስተያየት ታክሏል`,
    },
    [AUDIT_ACTIONS.RESTORE_MONTH]: {
      en: `Restored month "${log.data.monthName}"`,
      am: `ወሩ "${log.data.monthName}" ተመልሷል`,
    },
    [AUDIT_ACTIONS.PERMANENT_DELETE]: {
      en: `Permanently deleted month "${log.data.monthName}"`,
      am: `ወሩ "${log.data.monthName}" ለዘለዓለም ተሰርዟል`,
    },
    [AUDIT_ACTIONS.CLEAR_HISTORY]: {
      en: `Cleared all history - Reason: ${log.data.reason}`,
      am: `ሁሉም ታሪክ ጠፍቷል - ምክንያት: ${log.data.reason}`,
    },
  };

  const msg = messages[log.action];
  let text = '';
  
  if (language === 'amharic') {
    text = msg?.am || log.action;
  } else if (language === 'both') {
    text = `${msg?.am || log.action} / ${msg?.en || log.action}`;
  } else {
    text = msg?.en || log.action;
  }

  return `[${date}] ${log.user.name}: ${text}`;
};
