import { useState, useEffect, useCallback } from 'react';
import { FoodItem, ContentPack, ThemeCategory, PaginatedResponse, QueryOptions } from '@fooddrop/shared';
import { FoodItemService } from '../services/food/foodItemService';

export interface FoodSearchFilters {
  theme?: ThemeCategory;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  tags?: string[];
  searchTerm?: string;
}

export interface UseFoodItemsOptions {
  filters?: FoodSearchFilters;
  autoLoad?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface UseFoodItemsReturn {
  foodItems: FoodItem[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  loadFoodItems: () => Promise<void>;
  searchFoodItems: (searchTerm: string) => Promise<void>;
  applyFilters: (filters: FoodSearchFilters) => Promise<void>;
  resetFilters: () => Promise<void>;
  loadNextPage: () => Promise<void>;
  loadPreviousPage: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useFoodItems = (options: UseFoodItemsOptions = {}): UseFoodItemsReturn => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<FoodSearchFilters>(options.filters || {});
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('');

  const loadFoodItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryOptions: QueryOptions & {
        theme?: ThemeCategory;
        rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
        tags?: string[];
        isActive?: boolean;
      } = {
        limit: options.limit || 20,
        offset: options.offset || 0,
        orderBy: options.orderBy || 'createdAt',
        orderDirection: options.orderDirection || 'desc',
        isActive: true,
        ...currentFilters
      };

      const response = await FoodItemService.getFoodItems(queryOptions);
      
      setFoodItems(response.items);
      setTotalCount(response.totalCount);
      setHasNextPage(response.hasNextPage);
      setHasPreviousPage(response.hasPreviousPage);
      setCurrentPage(response.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load food items');
      setFoodItems([]);
    } finally {
      setLoading(false);
    }
  }, [options.limit, options.offset, options.orderBy, options.orderDirection, currentFilters]);

  const searchFoodItems = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setCurrentSearchTerm('');
      await loadFoodItems();
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentSearchTerm(searchTerm);
    
    try {
      const queryOptions: QueryOptions = {
        limit: options.limit || 20,
        orderBy: options.orderBy || 'createdAt',
        orderDirection: options.orderDirection || 'desc'
      };

      const response = await FoodItemService.searchFoodItems(searchTerm, queryOptions);
      
      setFoodItems(response.items);
      setTotalCount(response.totalCount);
      setHasNextPage(response.hasNextPage);
      setHasPreviousPage(response.hasPreviousPage);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search food items');
      setFoodItems([]);
    } finally {
      setLoading(false);
    }
  }, [options.limit, options.orderBy, options.orderDirection, loadFoodItems]);

  const applyFilters = useCallback(async (filters: FoodSearchFilters) => {
    setCurrentFilters(filters);
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(async () => {
    setCurrentFilters({});
    setCurrentSearchTerm('');
    setCurrentPage(1);
  }, []);

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage) return;
    
    // Implementation would depend on pagination strategy
    // For now, we'll increment the offset
    const newOffset = (currentPage * (options.limit || 20));
    // This would require refactoring to support pagination tokens
  }, [hasNextPage, currentPage, options.limit]);

  const loadPreviousPage = useCallback(async () => {
    if (!hasPreviousPage || currentPage <= 1) return;
    
    // Implementation for previous page
    const newOffset = Math.max(0, ((currentPage - 2) * (options.limit || 20)));
    // This would require refactoring to support pagination tokens
  }, [hasPreviousPage, currentPage, options.limit]);

  const refresh = useCallback(async () => {
    if (currentSearchTerm) {
      await searchFoodItems(currentSearchTerm);
    } else {
      await loadFoodItems();
    }
  }, [currentSearchTerm, searchFoodItems, loadFoodItems]);

  // Load food items on mount or when filters change
  useEffect(() => {
    if (options.autoLoad !== false) {
      if (currentSearchTerm) {
        searchFoodItems(currentSearchTerm);
      } else {
        loadFoodItems();
      }
    }
  }, [currentFilters, searchFoodItems, loadFoodItems, options.autoLoad]);

  return {
    foodItems,
    loading,
    error,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    currentPage,
    loadFoodItems,
    searchFoodItems,
    applyFilters,
    resetFilters,
    loadNextPage,
    loadPreviousPage,
    refresh
  };
};

export interface UseContentPacksReturn {
  contentPacks: ContentPack[];
  loading: boolean;
  error: string | null;
  loadContentPacks: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useContentPacks = (): UseContentPacksReturn => {
  const [contentPacks, setContentPacks] = useState<ContentPack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContentPacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await FoodItemService.getActiveContentPacks();
      
      if (response.success && response.data) {
        setContentPacks(response.data);
      } else {
        setError(response.error || 'Failed to load content packs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content packs');
      setContentPacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadContentPacks();
  }, [loadContentPacks]);

  // Load content packs on mount
  useEffect(() => {
    loadContentPacks();
  }, [loadContentPacks]);

  return {
    contentPacks,
    loading,
    error,
    loadContentPacks,
    refresh
  };
};