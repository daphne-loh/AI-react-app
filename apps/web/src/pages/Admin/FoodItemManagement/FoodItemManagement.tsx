import React, { useState, useEffect } from 'react';
import { FoodItem } from '@fooddrop/shared';
import { FoodItemService } from '../../../services/food/foodItemService';
import { FoodItemForm } from '../../../components/admin/FoodItemForm';
import { FoodItemTable } from '../../../components/admin/FoodItemTable';
import { BatchOperations } from '../../../components/admin/BatchOperations';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';

type ViewMode = 'list' | 'create' | 'edit';

export const FoodItemManagement: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    loadFoodItems();
  }, [themeFilter, statusFilter]);

  const loadFoodItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await FoodItemService.getFoodItems({
        theme: themeFilter || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        limit: 100,
        orderBy: 'updatedAt',
        orderDirection: 'desc'
      });

      setFoodItems(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setViewMode('create');
  };

  const handleEdit = (item: FoodItem) => {
    setSelectedItem(item);
    setViewMode('edit');
  };

  const handleDelete = async (item: FoodItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await FoodItemService.deleteFoodItem(item.id);
        await loadFoodItems();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete item');
      }
    }
  };

  const handleFormSubmit = async (formData: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (viewMode === 'create') {
        await FoodItemService.createFoodItem(formData);
      } else if (viewMode === 'edit' && selectedItem) {
        await FoodItemService.updateFoodItem(selectedItem.id, formData);
      }
      
      setViewMode('list');
      setSelectedItem(null);
      await loadFoodItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedItem(null);
  };

  const handleItemSelect = (item: FoodItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([]);
    }
  };

  const handleBatchOperationComplete = () => {
    loadFoodItems();
    setSelectedItems([]);
    setSelectionMode(false);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
    setSelectionMode(false);
  };

  const filteredItems = foodItems.filter(item =>
    searchTerm === '' || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">
                {viewMode === 'create' ? 'Create New Food Item' : 'Edit Food Item'}
              </h1>
            </div>
            
            <div className="p-6">
              <FoodItemForm
                initialData={selectedItem || undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSubmitting={loading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Food Item Management</h1>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button
                  variant={selectionMode ? "secondary" : "outline"}
                  onClick={() => {
                    setSelectionMode(!selectionMode);
                    setSelectedItems([]);
                  }}
                  className="text-sm sm:text-base px-3 py-2"
                >
                  {selectionMode ? 'Cancel' : 'Select'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base px-3 py-2"
                >
                  <span>+</span>
                  <span className="hidden sm:inline">Create New Item</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or tags..."
              />
              
              <Select
                label="Theme"
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Themes' },
                  { value: 'weird-cursed', label: 'Weird & Cursed' },
                  { value: 'global-street', label: 'Global Street Foods' },
                  { value: 'historical-desserts', label: 'Historical Desserts' },
                  { value: 'mythical-foods', label: 'Mythical Foods' }
                ]}
              />
              
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'active', label: 'Active Only' },
                  { value: 'inactive', label: 'Inactive Only' },
                  { value: '', label: 'All Status' }
                ]}
              />

              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={loadFoodItems}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading food items...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredItems.length} Food Items
                {searchTerm && ` matching "${searchTerm}"`}
              </h2>
            </div>
            
            <FoodItemTable
              items={filteredItems}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
              onSelectAll={handleSelectAll}
              selectionMode={selectionMode}
            />
          </div>
        )}

        {/* Batch Operations */}
        {selectionMode && (
          <BatchOperations
            selectedItems={selectedItems}
            onOperationComplete={handleBatchOperationComplete}
            onClearSelection={handleClearSelection}
          />
        )}
      </div>
    </div>
  );
};