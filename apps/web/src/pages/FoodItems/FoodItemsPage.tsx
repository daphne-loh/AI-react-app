import React, { useState, useMemo, useCallback } from 'react';
import { FoodItemCard } from '../../components/food';
import { StaticFoodSearchBar, type FoodSearchFilters } from '../../components/food/StaticFoodSearchBar';
import { FoodItem } from '@fooddrop/shared';
import { initialFoodItems } from '../../data/initialFoodContent';
import { Timestamp } from 'firebase/firestore';

export const FoodItemsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FoodSearchFilters>({});
  const [loading] = useState(false);

  // Convert initial food items to full FoodItem objects with IDs
  const mockFoodItems: FoodItem[] = useMemo(() => 
    initialFoodItems.map((item, index) => ({
      ...item,
      id: `mock-${index}`,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })), []
  );

  // Filter and search the mock data
  const filteredFoodItems = useMemo(() => {
    let result = mockFoodItems;

    // Apply theme filter
    if (filters.theme) {
      result = result.filter(item => item.theme === filters.theme);
    }

    // Apply rarity filter
    if (filters.rarity) {
      result = result.filter(item => item.rarity === filters.rarity);
    }

    // Apply tag filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(item => 
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(lowerSearchTerm) ||
        item.description.toLowerCase().includes(lowerSearchTerm) ||
        item.culturalBackground.toLowerCase().includes(lowerSearchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }

    return result;
  }, [mockFoodItems, filters, searchTerm]);

  const handleFiltersUpdate = useCallback((searchTerm: string, filters: Omit<FoodSearchFilters, 'searchTerm'>) => {
    setSearchTerm(searchTerm);
    setFilters(filters);
  }, []);

  const handleReset = () => {
    setSearchTerm('');
    setFilters({});
  };

  const handleFoodItemClick = (foodItem: FoodItem) => {
    console.log('Food item clicked:', foodItem);
    // TODO: Navigate to food item detail page or open modal
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Item Database</h1>
          <p className="text-gray-600">
            Discover and explore food items from around the world across different themes and cultures.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <StaticFoodSearchBar
            onFiltersUpdate={handleFiltersUpdate}
            onReset={handleReset}
            loading={loading}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Found ${filteredFoodItems.length} food items`}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Food Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredFoodItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoodItems.map((foodItem) => (
              <FoodItemCard
                key={foodItem.id}
                foodItem={foodItem}
                onClick={handleFoodItemClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No food items found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Development Note */}
        <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Development Note</h4>
          <p className="text-blue-700 text-sm">
            This page demonstrates the Food Item Database implementation for Story 2.1. 
            The food items shown are sample data created for testing. In production, 
            this would be connected to the Firebase database with real content.
          </p>
        </div>
      </div>
    </div>
  );
};