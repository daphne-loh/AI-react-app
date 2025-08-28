import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot
} from 'firebase/storage';
import app from '../../config/firebase';

const storage = getStorage(app);

export interface ImageUploadResult {
  original: string;
  thumbnail: string;
  card: string;
  hero: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export class FoodImageStorageService {
  private static readonly FOOD_IMAGES_PATH = 'food-items';
  private static readonly IMAGE_SIZES = {
    thumbnail: { width: 200, height: 200 },
    card: { width: 400, height: 300 },
    hero: { width: 800, height: 600 }
  };

  /**
   * Upload a food item image and create multiple optimized versions
   */
  static async uploadFoodItemImage(
    foodItemId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ImageUploadResult> {
    try {
      // Create reference for original image
      const originalRef = ref(storage, `${this.FOOD_IMAGES_PATH}/${foodItemId}/original.${this.getFileExtension(file)}`);
      
      // Upload original image with progress tracking
      const uploadTask = uploadBytesResumable(originalRef, file);
      
      if (onProgress) {
        uploadTask.on('state_changed', (snapshot: UploadTaskSnapshot) => {
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          };
          onProgress(progress);
        });
      }

      // Wait for upload to complete
      await uploadTask;
      
      // Get download URL for original
      const originalUrl = await getDownloadURL(originalRef);
      
      // For now, we'll use the same URL for all sizes
      // In a production environment, you would implement image resizing
      // using Cloud Functions or a service like Cloudinary
      return {
        original: originalUrl,
        thumbnail: originalUrl,
        card: originalUrl,
        hero: originalUrl
      };
      
    } catch (error) {
      console.error('Error uploading food item image:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete all images for a food item
   */
  static async deleteFoodItemImages(foodItemId: string): Promise<void> {
    try {
      const imagesToDelete = [
        `${this.FOOD_IMAGES_PATH}/${foodItemId}/original.jpg`,
        `${this.FOOD_IMAGES_PATH}/${foodItemId}/original.png`,
        `${this.FOOD_IMAGES_PATH}/${foodItemId}/original.webp`
      ];

      const deletePromises = imagesToDelete.map(async (path) => {
        try {
          const imageRef = ref(storage, path);
          await deleteObject(imageRef);
        } catch (error) {
          // Ignore errors for files that don't exist
          console.log(`Image not found: ${path}`);
        }
      });

      await Promise.allSettled(deletePromises);
    } catch (error) {
      console.error('Error deleting food item images:', error);
      throw new Error(`Failed to delete images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get optimized image URL based on size requirement
   */
  static getOptimizedImageUrl(imageUrl: string, size: 'thumbnail' | 'card' | 'hero' = 'card'): string {
    // For now, return the original URL
    // In production, this would return the appropriately sized image
    return imageUrl;
  }

  /**
   * Validate image file before upload
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.'
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Please upload images smaller than 10MB.'
      };
    }

    return { valid: true };
  }

  private static getFileExtension(file: File): string {
    const name = file.name;
    const lastDot = name.lastIndexOf('.');
    return lastDot !== -1 ? name.substring(lastDot + 1).toLowerCase() : 'jpg';
  }
}