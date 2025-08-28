import React from 'react';
import { FoodItem } from '@fooddrop/shared';

interface FoodItemCardProps {
  foodItem: FoodItem;
  onClick?: (foodItem: FoodItem) => void;
  className?: string;
}

const rarityColors = {
  common: 'border-gray-300 bg-gray-50',
  uncommon: 'border-green-400 bg-green-50',
  rare: 'border-blue-400 bg-blue-50',
  legendary: 'border-purple-400 bg-purple-50'
};

const rarityTextColors = {
  common: 'text-gray-600',
  uncommon: 'text-green-600',
  rare: 'text-blue-600',
  legendary: 'text-purple-600'
};

const themeLabels = {
  'weird-cursed': 'Weird & Cursed',
  'global-street': 'Global Street',
  'historical-desserts': 'Historical Desserts',
  'mythical-foods': 'Mythical Foods'
};

export const FoodItemCard: React.FC<FoodItemCardProps> = ({ 
  foodItem, 
  onClick, 
  className = '' 
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(foodItem);
    }
  };

  const cardClasses = `
    ${rarityColors[foodItem.rarity]} 
    border-2 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 
    cursor-pointer transform hover:scale-105 ${className}
  `;

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Image */}
      <div className="aspect-w-4 aspect-h-3 bg-gray-200">
        <img
          src={foodItem.thumbnailUrl || foodItem.imageUrl}
          alt={foodItem.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Create a simple SVG placeholder
            const svg = `
              <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" style="background: #f1f5f9;">
                <rect width="100%" height="100%" fill="#e2e8f0"/>
                <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#64748b" text-anchor="middle" dy=".3em">${foodItem.name}</text>
              </svg>
            `;
            target.src = `data:image/svg+xml;base64,${btoa(svg)}`;
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
            {foodItem.name}
          </h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${rarityTextColors[foodItem.rarity]} bg-white border`}>
            {foodItem.rarity.charAt(0).toUpperCase() + foodItem.rarity.slice(1)}
          </span>
        </div>

        {/* Theme and Origin */}
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
            {themeLabels[foodItem.theme]}
          </span>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
            {foodItem.origin.country}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          {foodItem.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {foodItem.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index} 
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
          {foodItem.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{foodItem.tags.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};