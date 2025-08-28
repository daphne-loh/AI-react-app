import React, { useState, useEffect } from 'react';
import { FoodItem, ThemeCategory } from '@fooddrop/shared';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { TextArea } from '../../common/TextArea';

interface Recipe {
  ingredients: string[];
  instructions: string[];
  preparationTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string[];
}

interface FormData {
  name: string;
  description: string;
  culturalBackground: string;
  recipe?: Recipe;
  imageUrl: string;
  thumbnailUrl: string;
  theme: ThemeCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  origin: {
    country: string;
    region?: string;
    culturalPeriod?: string;
    significance: string;
  };
  tags: string[];
  isActive: boolean;
  contentVersion: number;
}

interface FoodItemFormProps {
  initialData?: Partial<FoodItem>;
  onSubmit: (data: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const FoodItemForm: React.FC<FoodItemFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    culturalBackground: '',
    imageUrl: '',
    thumbnailUrl: '',
    theme: 'weird-cursed',
    rarity: 'common',
    origin: {
      country: '',
      significance: ''
    },
    tags: [],
    isActive: true,
    contentVersion: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [includeRecipe, setIncludeRecipe] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        culturalBackground: initialData.culturalBackground || '',
        recipe: initialData.recipe,
        imageUrl: initialData.imageUrl || '',
        thumbnailUrl: initialData.thumbnailUrl || '',
        theme: initialData.theme || 'weird-cursed',
        rarity: initialData.rarity || 'common',
        origin: initialData.origin || { country: '', significance: '' },
        tags: initialData.tags || [],
        isActive: initialData.isActive ?? true,
        contentVersion: initialData.contentVersion || 1
      });
      setIncludeRecipe(!!initialData.recipe);
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.name.length > 100) newErrors.name = 'Name must be 100 characters or less';
    
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (formData.description.length > 1000) newErrors.description = 'Description must be 1000 characters or less';
    
    if (!formData.culturalBackground.trim()) newErrors.culturalBackground = 'Cultural background is required';
    if (formData.culturalBackground.length < 10) newErrors.culturalBackground = 'Cultural background must be at least 10 characters';
    
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'Image URL is required';
    if (!formData.thumbnailUrl.trim()) newErrors.thumbnailUrl = 'Thumbnail URL is required';
    
    if (!formData.origin.country.trim()) newErrors['origin.country'] = 'Country is required';
    if (!formData.origin.significance.trim()) newErrors['origin.significance'] = 'Cultural significance is required';
    
    if (formData.tags.length === 0) newErrors.tags = 'At least one tag is required';

    if (includeRecipe && formData.recipe) {
      if (formData.recipe.ingredients.length === 0) newErrors.ingredients = 'At least one ingredient is required';
      if (formData.recipe.instructions.length === 0) newErrors.instructions = 'At least one instruction is required';
      if (formData.recipe.preparationTime <= 0) newErrors.preparationTime = 'Preparation time must be greater than 0';
      if (formData.recipe.servings <= 0) newErrors.servings = 'Servings must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      recipe: includeRecipe ? formData.recipe : undefined
    };

    await onSubmit(submitData);
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOriginChange = (field: keyof FormData['origin']) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      origin: { ...prev.origin, [field]: e.target.value }
    }));
    if (errors[`origin.${field}`]) {
      setErrors(prev => ({ ...prev, [`origin.${field}`]: '' }));
    }
  };

  const handleRecipeChange = (field: keyof Recipe) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormData(prev => ({
      ...prev,
      recipe: { ...prev.recipe!, [field]: value }
    }));
  };

  const handleArrayInput = (field: 'ingredients' | 'instructions' | 'tips') => (
    value: string
  ) => {
    const items = value.split('\n').filter(item => item.trim());
    setFormData(prev => ({
      ...prev,
      recipe: { ...prev.recipe!, [field]: items }
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const initializeRecipe = () => {
    if (!formData.recipe) {
      setFormData(prev => ({
        ...prev,
        recipe: {
          ingredients: [],
          instructions: [],
          preparationTime: 0,
          servings: 1,
          difficulty: 'easy',
          tips: []
        }
      }));
    }
  };

  useEffect(() => {
    if (includeRecipe) {
      initializeRecipe();
    }
  }, [includeRecipe]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name*"
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={errors.name}
            placeholder="Enter food item name"
          />
          
          <Select
            label="Theme*"
            value={formData.theme}
            onChange={handleInputChange('theme')}
            error={errors.theme}
            options={[
              { value: 'weird-cursed', label: 'Weird & Cursed' },
              { value: 'global-street', label: 'Global Street Foods' },
              { value: 'historical-desserts', label: 'Historical Desserts' },
              { value: 'mythical-foods', label: 'Mythical Foods' }
            ]}
          />
        </div>

        <TextArea
          label="Description*"
          value={formData.description}
          onChange={handleInputChange('description')}
          error={errors.description}
          placeholder="Describe the food item (10-1000 characters)"
          rows={3}
        />

        <TextArea
          label="Cultural Background*"
          value={formData.culturalBackground}
          onChange={handleInputChange('culturalBackground')}
          error={errors.culturalBackground}
          placeholder="Provide cultural context and historical background (minimum 10 characters)"
          rows={4}
        />
      </div>

      {/* Origin Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Origin Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Country*"
            type="text"
            value={formData.origin.country}
            onChange={handleOriginChange('country')}
            error={errors['origin.country']}
            placeholder="Country of origin"
          />
          
          <Input
            label="Region"
            type="text"
            value={formData.origin.region || ''}
            onChange={handleOriginChange('region')}
            placeholder="Specific region (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cultural Period"
            type="text"
            value={formData.origin.culturalPeriod || ''}
            onChange={handleOriginChange('culturalPeriod')}
            placeholder="e.g., Ming Dynasty, Victorian Era (optional)"
          />
          
          <Select
            label="Rarity*"
            value={formData.rarity}
            onChange={handleInputChange('rarity')}
            options={[
              { value: 'common', label: 'Common' },
              { value: 'uncommon', label: 'Uncommon' },
              { value: 'rare', label: 'Rare' },
              { value: 'legendary', label: 'Legendary' }
            ]}
          />
        </div>

        <TextArea
          label="Cultural Significance*"
          value={formData.origin.significance}
          onChange={handleOriginChange('significance')}
          error={errors['origin.significance']}
          placeholder="Explain the cultural importance and significance"
          rows={3}
        />
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Images</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Image URL*"
            type="url"
            value={formData.imageUrl}
            onChange={handleInputChange('imageUrl')}
            error={errors.imageUrl}
            placeholder="Full size image URL"
          />
          
          <Input
            label="Thumbnail URL*"
            type="url"
            value={formData.thumbnailUrl}
            onChange={handleInputChange('thumbnailUrl')}
            error={errors.thumbnailUrl}
            placeholder="Thumbnail image URL"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
        
        <div className="flex space-x-2">
          <Input
            label=""
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addTag}>
            Add Tag
          </Button>
        </div>
        
        {errors.tags && <p className="text-sm text-red-600">{errors.tags}</p>}
        
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Recipe (Optional) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="includeRecipe"
            checked={includeRecipe}
            onChange={(e) => setIncludeRecipe(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="includeRecipe" className="text-lg font-semibold text-gray-900">
            Include Recipe
          </label>
        </div>

        {includeRecipe && formData.recipe && (
          <div className="space-y-4 pl-6 border-l-2 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Preparation Time (minutes)*"
                type="number"
                min="1"
                value={formData.recipe.preparationTime.toString()}
                onChange={handleRecipeChange('preparationTime')}
                error={errors.preparationTime}
              />
              
              <Input
                label="Servings*"
                type="number"
                min="1"
                value={formData.recipe.servings.toString()}
                onChange={handleRecipeChange('servings')}
                error={errors.servings}
              />
              
              <Select
                label="Difficulty*"
                value={formData.recipe.difficulty}
                onChange={handleRecipeChange('difficulty')}
                options={[
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' }
                ]}
              />
            </div>

            <TextArea
              label="Ingredients* (one per line)"
              value={formData.recipe.ingredients.join('\n')}
              onChange={(e) => handleArrayInput('ingredients')(e.target.value)}
              error={errors.ingredients}
              placeholder="1 cup flour&#10;2 eggs&#10;1 tsp salt"
              rows={4}
            />

            <TextArea
              label="Instructions* (one per line)"
              value={formData.recipe.instructions.join('\n')}
              onChange={(e) => handleArrayInput('instructions')(e.target.value)}
              error={errors.instructions}
              placeholder="Mix dry ingredients&#10;Beat eggs and add to mixture&#10;Bake for 30 minutes"
              rows={4}
            />

            <TextArea
              label="Tips (optional, one per line)"
              value={formData.recipe.tips?.join('\n') || ''}
              onChange={(e) => handleArrayInput('tips')(e.target.value)}
              placeholder="Use room temperature ingredients&#10;Don't overmix the batter"
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Status */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={handleInputChange('isActive')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active (visible to users)
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
};