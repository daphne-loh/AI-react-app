import React, { useState } from 'react';
import { FoodItem } from '@fooddrop/shared';
import { Button } from '../../common/Button';
import { TextArea } from '../../common/TextArea';

interface ApprovalWorkflowProps {
  item: FoodItem;
  onApprove: (item: FoodItem, notes?: string) => Promise<void>;
  onReject: (item: FoodItem, reason: string) => Promise<void>;
  onRequestChanges: (item: FoodItem, changes: string) => Promise<void>;
  isProcessing?: boolean;
}

type WorkflowAction = 'approve' | 'reject' | 'request-changes' | null;

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  item,
  onApprove,
  onReject,
  onRequestChanges,
  isProcessing = false
}) => {
  const [action, setAction] = useState<WorkflowAction>(null);
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleActionSelect = (selectedAction: WorkflowAction) => {
    setAction(selectedAction);
    setShowForm(selectedAction !== 'approve');
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!action) return;

    try {
      switch (action) {
        case 'approve':
          await onApprove(item, notes || undefined);
          break;
        case 'reject':
          if (!notes.trim()) {
            alert('Please provide a reason for rejection');
            return;
          }
          await onReject(item, notes);
          break;
        case 'request-changes':
          if (!notes.trim()) {
            alert('Please specify what changes are needed');
            return;
          }
          await onRequestChanges(item, notes);
          break;
      }
      
      setAction(null);
      setNotes('');
      setShowForm(false);
    } catch (error) {
      console.error('Workflow action failed:', error);
    }
  };

  const getActionColor = (actionType: WorkflowAction) => {
    switch (actionType) {
      case 'approve': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'reject': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'request-changes': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      default: return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const getActionLabel = (actionType: WorkflowAction) => {
    switch (actionType) {
      case 'approve': return 'Approve';
      case 'reject': return 'Reject';
      case 'request-changes': return 'Request Changes';
      default: return '';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Content Approval</h3>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          item.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {item.isActive ? 'Published' : 'Draft'}
        </span>
      </div>

      {!action && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Review this food item and choose an action:
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleActionSelect('approve')}
              disabled={isProcessing}
              className={getActionColor('approve')}
            >
              ✓ Approve & Publish
            </Button>
            
            <Button
              onClick={() => handleActionSelect('request-changes')}
              disabled={isProcessing}
              className={getActionColor('request-changes')}
            >
              ⚠ Request Changes
            </Button>
            
            <Button
              onClick={() => handleActionSelect('reject')}
              disabled={isProcessing}
              className={getActionColor('reject')}
            >
              ✗ Reject
            </Button>
          </div>
        </div>
      )}

      {action && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Action:</span>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              action === 'approve' ? 'bg-green-100 text-green-800' :
              action === 'reject' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {getActionLabel(action)}
            </span>
          </div>

          {showForm && (
            <TextArea
              label={
                action === 'reject' ? 'Rejection Reason*' :
                action === 'request-changes' ? 'Required Changes*' :
                'Notes (optional)'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                action === 'reject' ? 'Explain why this item should be rejected...' :
                action === 'request-changes' ? 'Specify what changes are needed...' :
                'Optional notes about this approval...'
              }
              rows={4}
              required={action !== 'approve'}
            />
          )}

          {action === 'approve' && (
            <TextArea
              label="Approval Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this approval..."
              rows={3}
            />
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setAction(null);
                setNotes('');
                setShowForm(false);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isProcessing || (showForm && !notes.trim())}
              className={getActionColor(action)}
            >
              {isProcessing ? 'Processing...' : `Confirm ${getActionLabel(action)}`}
            </Button>
          </div>
        </div>
      )}

      {/* Content Quality Checklist */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Quality Checklist</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className={item.culturalBackground?.length >= 50 ? 'text-green-600' : 'text-red-600'}>
              {item.culturalBackground?.length >= 50 ? '✓' : '✗'}
            </span>
            <span className="text-gray-600">Cultural background is detailed (50+ characters)</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={item.tags?.length >= 3 ? 'text-green-600' : 'text-red-600'}>
              {item.tags?.length >= 3 ? '✓' : '✗'}
            </span>
            <span className="text-gray-600">Has at least 3 relevant tags</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={item.origin?.significance?.length >= 20 ? 'text-green-600' : 'text-red-600'}>
              {item.origin?.significance?.length >= 20 ? '✓' : '✗'}
            </span>
            <span className="text-gray-600">Cultural significance explained</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={item.imageUrl && item.thumbnailUrl ? 'text-green-600' : 'text-red-600'}>
              {item.imageUrl && item.thumbnailUrl ? '✓' : '✗'}
            </span>
            <span className="text-gray-600">Images provided</span>
          </div>
        </div>
      </div>
    </div>
  );
};