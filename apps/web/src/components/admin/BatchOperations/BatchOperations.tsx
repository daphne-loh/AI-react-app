import React, { useState } from 'react';
import { FoodItem } from '@fooddrop/shared';
import { FoodItemService } from '../../../services/food/foodItemService';
import { Button } from '../../common/Button';
import { Select } from '../../common/Select';

interface BatchOperationsProps {
  selectedItems: FoodItem[];
  onOperationComplete: () => void;
  onClearSelection: () => void;
}

type BatchOperation = 'activate' | 'deactivate' | 'delete' | 'update-theme' | 'update-rarity';

export const BatchOperations: React.FC<BatchOperationsProps> = ({
  selectedItems,
  onOperationComplete,
  onClearSelection
}) => {
  const [operation, setOperation] = useState<BatchOperation>('activate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // For update operations
  const [targetTheme, setTargetTheme] = useState<string>('weird-cursed');
  const [targetRarity, setTargetRarity] = useState<string>('common');

  if (selectedItems.length === 0) {
    return null;
  }

  const executeBatchOperation = async () => {
    if (selectedItems.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to ${operation.replace('-', ' ')} ${selectedItems.length} food item(s)?`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const total = selectedItems.length;
      let completed = 0;

      for (const item of selectedItems) {
        try {
          switch (operation) {
            case 'activate':
              await FoodItemService.updateFoodItem(item.id, { isActive: true });
              break;
              
            case 'deactivate':
              await FoodItemService.updateFoodItem(item.id, { isActive: false });
              break;
              
            case 'delete':
              await FoodItemService.deleteFoodItem(item.id);
              break;
              
            case 'update-theme':
              await FoodItemService.updateFoodItem(item.id, { 
                theme: targetTheme as any 
              });
              break;
              
            case 'update-rarity':
              await FoodItemService.updateFoodItem(item.id, { 
                rarity: targetRarity as any 
              });
              break;
          }
          
          completed++;
          setProgress((completed / total) * 100);
          
          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (itemError) {
          console.error(`Failed to process item ${item.id}:`, itemError);
          // Continue with other items even if one fails
        }
      }

      onOperationComplete();
      onClearSelection();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch operation failed');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const getOperationLabel = (op: BatchOperation): string => {
    switch (op) {
      case 'activate': return 'Activate';
      case 'deactivate': return 'Deactivate';
      case 'delete': return 'Delete';
      case 'update-theme': return 'Update Theme';
      case 'update-rarity': return 'Update Rarity';
      default: return op;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-900">
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            </span>
            
            <Select
              value={operation}
              onChange={(e) => setOperation(e.target.value as BatchOperation)}
              options={[
                { value: 'activate', label: 'Activate Items' },
                { value: 'deactivate', label: 'Deactivate Items' },
                { value: 'update-theme', label: 'Update Theme' },
                { value: 'update-rarity', label: 'Update Rarity' },
                { value: 'delete', label: 'Delete Items' }
              ]}
              disabled={isProcessing}
            />

            {operation === 'update-theme' && (
              <Select
                value={targetTheme}
                onChange={(e) => setTargetTheme(e.target.value)}
                options={[
                  { value: 'weird-cursed', label: 'Weird & Cursed' },
                  { value: 'global-street', label: 'Global Street Foods' },
                  { value: 'historical-desserts', label: 'Historical Desserts' },
                  { value: 'mythical-foods', label: 'Mythical Foods' }
                ]}
                disabled={isProcessing}
              />
            )}

            {operation === 'update-rarity' && (
              <Select
                value={targetRarity}
                onChange={(e) => setTargetRarity(e.target.value)}
                options={[
                  { value: 'common', label: 'Common' },
                  { value: 'uncommon', label: 'Uncommon' },
                  { value: 'rare', label: 'Rare' },
                  { value: 'legendary', label: 'Legendary' }
                ]}
                disabled={isProcessing}
              />
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isProcessing && (
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {Math.round(progress)}%
                </span>
              </div>
            )}

            <Button
              variant="secondary"
              onClick={onClearSelection}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            <Button
              variant={operation === 'delete' ? 'danger' : 'primary'}
              onClick={executeBatchOperation}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : getOperationLabel(operation)}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};