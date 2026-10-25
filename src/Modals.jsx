import React, { useState } from 'react';
import { X, AlertTriangle, Edit, MessageSquare, Trash2 } from 'lucide-react';

// Reason Modal for Delete/Edit actions
export const ReasonModal = ({ isOpen, onClose, onConfirm, action, monthName, language }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderLabel = (en, am) => {
    if (language === 'english') return en;
    if (language === 'amharic') return am;
    return `${am} / ${en}`;
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert(renderLabel('Please enter a reason', 'እባክዎ ምክንያት ያስገቡ'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (error) {
      alert(renderLabel('Failed to complete action', 'ድርጊቱን ማጠናቀቅ አልተቻለም'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isDelete = action === 'delete';
  const Icon = isDelete ? Trash2 : Edit;
  const colorClass = isDelete ? 'red' : 'blue';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 bg-${colorClass}-50`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${colorClass}-100 rounded-full`}>
                <Icon className={`text-${colorClass}-600`} size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {renderLabel(
                    isDelete ? 'Delete Confirmation' : 'Edit Confirmation',
                    isDelete ? 'የመሰረዝ ማረጋገጫ' : 'የማስተካከል ማረጋገጫ'
                  )}
                </h2>
                <p className="text-sm text-gray-600">{monthName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Warning Message */}
          {isDelete && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">
                  {renderLabel('3-Day Recovery Period', '3-ቀን የመመለሻ ጊዜ')}
                </p>
                <p>
                  {renderLabel(
                    'This record will be marked for deletion and can be recovered within 3 days. After that, it will be permanently removed.',
                    'ይህ መዝገብ ለመሰረዝ ምልክት የተደረገበት ሲሆን በ3 ቀናት ውስጥ ሊመለስ ይችላል። ከዚያ በኋላ ለዘለዓለም ይወገዳል።'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {renderLabel(
                `Reason for ${isDelete ? 'Deletion' : 'Edit'} (Required)`,
                `የ${isDelete ? 'መሰረዝ' : 'ማስተካከል'} ምክንያት (አስፈላጊ)`
              )}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows="4"
              placeholder={renderLabel(
                'Enter detailed reason for this action...',
                'ለዚህ ድርጊት ዝርዝር ምክንያት ያስገቡ...'
              )}
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {renderLabel(
                'This reason will be recorded in the audit log',
                'ይህ ምክንያት በኦዲት ምዝግብ ውስጥ ይመዘገባል'
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            disabled={isSubmitting}
          >
            {renderLabel('Cancel', 'ተወው')}
          </button>
          <button
            onClick={handleSubmit}
            className={`px-6 py-2 bg-${colorClass}-600 text-white rounded-lg hover:bg-${colorClass}-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {renderLabel('Processing...', 'በሂደት ላይ...')}
              </>
            ) : (
              <>
                <Icon size={18} />
                {renderLabel('Confirm', 'አረጋግጥ')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Comment Modal for adding/viewing comments
export const CommentModal = ({ isOpen, onClose, onSave, monthName, existingComment, language }) => {
  const [comment, setComment] = useState(existingComment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderLabel = (en, am) => {
    if (language === 'english') return en;
    if (language === 'amharic') return am;
    return `${am} / ${en}`;
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(comment.trim());
      onClose();
    } catch (error) {
      alert(renderLabel('Failed to save comment', 'አስተያየትን ማስቀመጥ አልተቻለም'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-lg max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-full">
                <MessageSquare className="text-indigo-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {renderLabel('Add/Edit Comment', 'አስተያየት ይጨምሩ/ያስተካክሉ')}
                </h2>
                <p className="text-sm text-gray-600">{monthName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {renderLabel('Comment / Note', 'አስተያየት / ማስታወሻ')}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows="6"
              placeholder={renderLabel(
                'Add notes, context, or important information about this month...',
                'ስለዚህ ወር ማስታወሻዎችን፣ አውድ ወይም አስፈላጊ መረጃ ይጨምሩ...'
              )}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {renderLabel(
                'This comment will be visible to all users who can view history',
                'ይህ አስተያየት ታሪክን ማየት ለሚችሉ ሁሉም ተጠቃሚዎች ይታያል'
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            disabled={isSubmitting}
          >
            {renderLabel('Cancel', 'ተወው')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {renderLabel('Saving...', 'በማስቀመጥ ላይ...')}
              </>
            ) : (
              <>
                <MessageSquare size={18} />
                {renderLabel('Save Comment', 'አስተያየት አስቀምጥ')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Month Modal
export const EditMonthModal = ({ isOpen, onClose, onSave, monthData, language }) => {
  const [inputs, setInputs] = useState(monthData?.inputs || {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderLabel = (en, am) => {
    if (language === 'english') return en;
    if (language === 'amharic') return am;
    return `${am} / ${en}`;
  };

  const formatNumberInput = (value) => {
    if (!value) return '';
    const numStr = value.toString().replace(/[^\d.]/g, '');
    const num = parseFloat(numStr);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleInputChange = (field, value) => {
    const cleanValue = value.toString().replace(/,/g, '');
    setInputs({ ...inputs, [field]: cleanValue });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(inputs);
      onClose();
    } catch (error) {
      alert(renderLabel('Failed to save changes', 'ለውጦችን ማስቀመጥ አልተቻለም'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full shadow-2xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Edit className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {renderLabel('Edit Month Data', 'የወር መረጃ ያስተካክሉ')}
                </h2>
                <p className="text-sm text-gray-600">{monthData?.month}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Gross Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {renderLabel('Gross Income', 'ጠቅላላ ገቢ')}
              </label>
              <input
                type="text"
                value={formatNumberInput(inputs.grossIncome)}
                onChange={(e) => handleInputChange('grossIncome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Overtime Income */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {renderLabel('Overtime Income', 'ኦቨርታይም ገቢ')}
              </label>
              <input
                type="text"
                value={formatNumberInput(inputs.overtimeIncome)}
                onChange={(e) => handleInputChange('overtimeIncome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Bank Installment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {renderLabel('Bank Loan', 'የባንክ እዳ')}
              </label>
              <input
                type="text"
                value={formatNumberInput(inputs.bankInstallment)}
                onChange={(e) => handleInputChange('bankInstallment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Add more fields as needed */}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            disabled={isSubmitting}
          >
            {renderLabel('Cancel', 'ተወው')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {renderLabel('Saving...', 'በማስቀመጥ ላይ...')}
              </>
            ) : (
              <>
                <Edit size={18} />
                {renderLabel('Save Changes', 'ለውጦችን አስቀምጥ')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
