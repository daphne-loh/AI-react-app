import React, { useState, useEffect, useCallback } from 'react';
import { ThemeCategory } from '@fooddrop/shared';

export interface FoodSearchFilters {
  theme?: ThemeCategory;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  tags?: string[];
  searchTerm?: string;
}

interface FoodSearchBarProps {
  onSearch: (searchTerm: string) => void;
  onFiltersChange: (filters: FoodSearchFilters) => void;
  onReset: () => void;
  loading?: boolean;
  className?: string;
}

const themeOptions = [
  { value: '', label: 'All Themes' },
  { value: 'weird-cursed', label: 'Weird & Cursed' },
  { value: 'global-street', label: 'Global Street Foods' },
  { value: 'historical-desserts', label: 'Historical Desserts' },
  { value: 'mythical-foods', label: 'Mythical Foods' }
];

const rarityOptions = [
  { value: '', label: 'All Rarities' },
  { value: 'common', label: 'Common' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'rare', label: 'Rare' },
  { value: 'legendary', label: 'Legendary' }
];

const commonTags = [
  'street-food', 'traditional', 'dessert', 'spicy', 'sweet', 'savory', 
  'vegetarian', 'protein', 'fermented', 'historical', 'mythical'
];

export const FoodSearchBar: React.FC<FoodSearchBarProps> = ({
  onSearch,
  onFiltersChange,
  onReset,
  loading = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch]);

  // Update filters when any filter value changes
  useEffect(() => {
    const filters: FoodSearchFilters = {};
    
    if (selectedTheme) {
      filters.theme = selectedTheme as ThemeCategory;
    }
    
    if (selectedRarity) {
      filters.rarity = selectedRarity as 'common' | 'uncommon' | 'rare' | 'legendary';
    }
    
    if (selectedTags.length > 0) {
      filters.tags = selectedTags;
    }
    
    if (searchTerm) {
      filters.searchTerm = searchTerm;
    }

    // Only call onFiltersChange if there are actually filters or if we're resetting
    const hasFilters = selectedTheme || selectedRarity || selectedTags.length > 0 || searchTerm;
    if (hasFilters || Object.keys(filters).length === 0) {
      onFiltersChange(filters);
    }
  }, [selectedTheme, selectedRarity, selectedTags, searchTerm]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedTheme('');
    setSelectedRarity('');
    setSelectedTags([]);
    setShowFilters(false);
    onReset();
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const hasActiveFilters = selectedTheme || selectedRarity || selectedTags.length > 0 || searchTerm;

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search food items by name, description, or cultural background..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filters
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Theme Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {themeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rarity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rarity
            </label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {rarityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {commonTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedTheme && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Theme: {themeOptions.find(t => t.value === selectedTheme)?.label}
                <button
                  onClick={() => setSelectedTheme('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedRarity && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Rarity: {rarityOptions.find(r => r.value === selectedRarity)?.label}
                <button
                  onClick={() => setSelectedRarity('')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedTags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                #{tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};