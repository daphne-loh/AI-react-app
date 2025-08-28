// Utility functions for generating placeholder images

const colors = {
  'weird-cursed': '#8b5a2b',
  'global-street': '#f39c12', 
  'historical-desserts': '#9b59b6',
  'mythical-foods': '#f1c40f'
};

export const generatePlaceholderImage = (name: string, theme: string, width = 400, height = 300): string => {
  const color = colors[theme as keyof typeof colors] || '#6b7280';
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.max(14, width / 25)}" fill="white" text-anchor="middle" dy=".3em">${name}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const generateThumbnail = (name: string, theme: string): string => {
  return generatePlaceholderImage(name, theme, 200, 200);
};

export const generateHeroImage = (name: string, theme: string): string => {
  return generatePlaceholderImage(name, theme, 800, 600);
};