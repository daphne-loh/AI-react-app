import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  FoodItem, 
  ContentPack, 
  ThemeCategory, 
  DatabaseResponse, 
  PaginatedResponse,
  QueryOptions,
  FoodItemValidation
} from '@fooddrop/shared';
import { validateDocument } from '../database/validation';
import { logPerformance } from '../database/performanceMonitor';
import { logUserAction } from '../database/auditLogger';

export class FoodItemService {
  private static readonly COLLECTION_NAME = 'food-items';
  private static readonly CONTENT_PACKS_COLLECTION = 'content-packs';

  /**
   * Create a new food item
   */
  static async createFoodItem(foodItem: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseResponse<FoodItem>> {
    const startTime = Date.now();
    
    try {
      // Validate food item data
      const validation = validateDocument(foodItem, FoodItemValidation);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          timestamp: new Date()
        };
      }

      const now = Timestamp.now();
      const newFoodItem: Omit<FoodItem, 'id'> = {
        ...foodItem,
        createdAt: now,
        updatedAt: now,
        contentVersion: 1
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newFoodItem);
      const createdItem: FoodItem = {
        id: docRef.id,
        ...newFoodItem
      };

      // Log performance
      await logPerformance({
        operation: 'createFoodItem',
        duration: Date.now() - startTime,
        documentCount: 1,
        cached: false
      });

      return {
        success: true,
        data: createdItem,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error creating food item:', error);
      
      await logPerformance({
        operation: 'createFoodItem',
        duration: Date.now() - startTime,
        documentCount: 0,
        cached: false,
        errorCode: error instanceof Error ? error.message : 'unknown'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create food item',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get a food item by ID
   */
  static async getFoodItem(id: string): Promise<DatabaseResponse<FoodItem>> {
    const startTime = Date.now();
    
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Food item not found',
          timestamp: new Date()
        };
      }

      const foodItem: FoodItem = {
        id: docSnap.id,
        ...docSnap.data()
      } as FoodItem;

      await logPerformance({
        operation: 'getFoodItem',
        duration: Date.now() - startTime,
        documentCount: 1,
        cached: false
      });

      return {
        success: true,
        data: foodItem,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error fetching food item:', error);
      
      await logPerformance({
        operation: 'getFoodItem',
        duration: Date.now() - startTime,
        documentCount: 0,
        cached: false,
        errorCode: error instanceof Error ? error.message : 'unknown'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch food item',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get food items with filtering and pagination
   */
  static async getFoodItems(options: QueryOptions & {
    theme?: ThemeCategory;
    rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
    tags?: string[];
    isActive?: boolean;
  } = {}): Promise<PaginatedResponse<FoodItem>> {
    const startTime = Date.now();
    
    try {
      let q = query(collection(db, this.COLLECTION_NAME));

      // Apply filters
      if (options.theme) {
        q = query(q, where('theme', '==', options.theme));
      }
      
      if (options.rarity) {
        q = query(q, where('rarity', '==', options.rarity));
      }

      if (options.isActive !== undefined) {
        q = query(q, where('isActive', '==', options.isActive));
      }

      if (options.tags && options.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', options.tags));
      }

      // Apply ordering
      const orderField = options.orderBy || 'createdAt';
      const orderDir = options.orderDirection || 'desc';
      q = query(q, orderBy(orderField, orderDir));

      // Apply pagination
      const limitCount = options.limit || 20;
      q = query(q, limit(limitCount + 1)); // Get one extra to check if there's a next page

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      
      // Check if there's a next page
      const hasNextPage = docs.length > limitCount;
      const items = docs.slice(0, limitCount);

      const foodItems: FoodItem[] = items.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FoodItem));

      await logPerformance({
        operation: 'getFoodItems',
        duration: Date.now() - startTime,
        documentCount: foodItems.length,
        cached: false
      });

      return {
        items: foodItems,
        totalCount: foodItems.length, // Note: For accurate total count, you'd need a separate query
        pageSize: limitCount,
        currentPage: Math.floor((options.offset || 0) / limitCount) + 1,
        hasNextPage,
        hasPreviousPage: (options.offset || 0) > 0,
        nextPageToken: hasNextPage ? docs[limitCount - 1].id : undefined
      };

    } catch (error) {
      console.error('Error fetching food items:', error);
      
      await logPerformance({
        operation: 'getFoodItems',
        duration: Date.now() - startTime,
        documentCount: 0,
        cached: false,
        errorCode: error instanceof Error ? error.message : 'unknown'
      });

      return {
        items: [],
        totalCount: 0,
        pageSize: options.limit || 20,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  }

  /**
   * Update a food item
   */
  static async updateFoodItem(id: string, updates: Partial<Omit<FoodItem, 'id' | 'createdAt'>>): Promise<DatabaseResponse<FoodItem>> {
    const startTime = Date.now();
    
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      
      // Get current version
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        return {
          success: false,
          error: 'Food item not found',
          timestamp: new Date()
        };
      }

      const currentData = currentDoc.data() as FoodItem;
      const updatedData = {
        ...updates,
        updatedAt: Timestamp.now(),
        contentVersion: increment(1)
      };

      // Validate updated data
      const validation = validateDocument({ ...currentData, ...updatedData }, FoodItemValidation);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
          timestamp: new Date()
        };
      }

      await updateDoc(docRef, updatedData);

      // Get updated document
      const updatedDoc = await getDoc(docRef);
      const updatedFoodItem: FoodItem = {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as FoodItem;

      await logPerformance({
        operation: 'updateFoodItem',
        duration: Date.now() - startTime,
        documentCount: 1,
        cached: false
      });

      return {
        success: true,
        data: updatedFoodItem,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error updating food item:', error);
      
      await logPerformance({
        operation: 'updateFoodItem',
        duration: Date.now() - startTime,
        documentCount: 0,
        cached: false,
        errorCode: error instanceof Error ? error.message : 'unknown'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update food item',
        timestamp: new Date()
      };
    }
  }

  /**
   * Delete a food item (soft delete by setting isActive to false)
   */
  static async deleteFoodItem(id: string): Promise<DatabaseResponse<boolean>> {
    const startTime = Date.now();
    
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      
      // Soft delete by setting isActive to false
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });

      await logPerformance({
        operation: 'deleteFoodItem',
        duration: Date.now() - startTime,
        documentCount: 1,
        cached: false
      });

      return {
        success: true,
        data: true,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error deleting food item:', error);
      
      await logPerformance({
        operation: 'deleteFoodItem',
        duration: Date.now() - startTime,
        documentCount: 0,
        cached: false,
        errorCode: error instanceof Error ? error.message : 'unknown'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete food item',
        timestamp: new Date()
      };
    }
  }

  /**
   * Search food items by text query
   */
  static async searchFoodItems(searchTerm: string, options: QueryOptions = {}): Promise<PaginatedResponse<FoodItem>> {
    const startTime = Date.now();
    
    try {
      // For basic text search, we'll search in name and tags
      // In production, you would use Algolia or another search service
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('isActive', '==', true)
      );

      if (options.orderBy) {
        q = query(q, orderBy(options.orderBy, options.orderDirection || 'asc'));
      }

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      
      // Filter results client-side for text search
      const foodItems: FoodItem[] = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FoodItem))
        .filter(item => 
          item.name.toLowerCase().includes(lowerSearchTerm) ||
          item.description.toLowerCase().includes(lowerSearchTerm) ||
          item.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
          item.culturalBackground.toLowerCase().includes(lowerSearchTerm)
        );

      await logPerformance({
        operation: 'searchFoodItems',
        duration: Date.now() - startTime,
        documentCount: foodItems.length,
        cached: false
      });

      return {
        items: foodItems,
        totalCount: foodItems.length,
        pageSize: options.limit || foodItems.length,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };

    } catch (error) {
      console.error('Error searching food items:', error);
      
      await logPerformance({
        operation: 'searchFoodItems',
        duration: Date.now() - startTime,
        documentCount: 0,
        cached: false,
        errorCode: error instanceof Error ? error.message : 'unknown'
      });

      return {
        items: [],
        totalCount: 0,
        pageSize: options.limit || 20,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  }

  /**
   * Create a content pack
   */
  static async createContentPack(contentPack: Omit<ContentPack, 'id' | 'createdAt'>): Promise<DatabaseResponse<ContentPack>> {
    const startTime = Date.now();
    
    try {
      const now = Timestamp.now();
      const newContentPack: Omit<ContentPack, 'id'> = {
        ...contentPack,
        createdAt: now
      };

      const docRef = await addDoc(collection(db, this.CONTENT_PACKS_COLLECTION), newContentPack);
      const createdPack: ContentPack = {
        id: docRef.id,
        ...newContentPack
      };

      await logPerformance({
        operation: 'createContentPack',
        duration: Date.now() - startTime,
        documentCount: 1,
        cached: false
      });

      return {
        success: true,
        data: createdPack,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error creating content pack:', error);
      
      await logPerformance({
        operation: 'createContentPack',
        duration: Date.now() - startTime,
        documentCount: 0,
        cached: false,
        errorCode: error instanceof Error ? error.message : 'unknown'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create content pack',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get active content packs
   */
  static async getActiveContentPacks(): Promise<DatabaseResponse<ContentPack[]>> {
    const startTime = Date.now();
    
    try {
      const q = query(
        collection(db, this.CONTENT_PACKS_COLLECTION),
        where('isActive', '==', true),
        orderBy('releaseDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const contentPacks: ContentPack[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ContentPack));

      await logPerformance({
        operation: 'getActiveContentPacks',
        duration: Date.now() - startTime,
        documentCount: contentPacks.length,
        cached: false
      });

      return {
        success: true,
        data: contentPacks,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error fetching content packs:', error);
      
      await logPerformance({
        operation: 'getActiveContentPacks',
        duration: Date.now() - startTime,
        documentCount: 0,
        cached: false,
        errorCode: error instanceof Error ? error.message : 'unknown'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch content packs',
        timestamp: new Date()
      };
    }
  }
}