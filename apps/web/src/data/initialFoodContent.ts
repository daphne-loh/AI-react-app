import { FoodItem, ContentPack, ThemeCategory } from '@fooddrop/shared';
import { Timestamp } from 'firebase/firestore';
import { generatePlaceholderImage, generateThumbnail } from '../utils/placeholderImages';

// Sample food items for each theme category
export const initialFoodItems: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Weird/Cursed Foods
  {
    name: "Century Egg",
    description: "A preserved duck egg aged for weeks in clay, ash, salt, quicklime, and rice hulls. The yolk becomes dark green and creamy with a strong cheese-like flavor.",
    culturalBackground: "Century eggs, also known as thousand-year-old eggs, are a traditional Chinese delicacy dating back over 600 years. They were originally created as a method of preserving eggs without refrigeration during the Ming Dynasty. Despite their intimidating appearance, they're prized for their complex umami flavor and creamy texture.",
    recipe: {
      ingredients: [
        "1 century egg",
        "2 slices of pickled ginger",
        "1 tsp soy sauce",
        "Few drops of sesame oil",
        "Chopped green onions"
      ],
      instructions: [
        "Carefully peel the century egg and rinse gently",
        "Cut into wedges",
        "Arrange on plate with pickled ginger",
        "Drizzle with soy sauce and sesame oil",
        "Garnish with green onions"
      ],
      preparationTime: 5,
      servings: 1,
      difficulty: "easy",
      tips: ["Look for eggs with firm texture", "Serve at room temperature for best flavor"]
    },
    imageUrl: generatePlaceholderImage("Century Egg", "weird-cursed", 800, 600),
    thumbnailUrl: generateThumbnail("Century Egg", "weird-cursed"),
    theme: "weird-cursed" as ThemeCategory,
    rarity: "uncommon",
    origin: {
      country: "China",
      region: "Hunan Province",
      culturalPeriod: "Ming Dynasty (1368-1644)",
      significance: "A traditional preservation method that transformed necessity into delicacy"
    },
    tags: ["preserved", "umami", "traditional", "chinese", "protein"],
    isActive: true,
    contentVersion: 1
  },
  {
    name: "Balut",
    description: "A fertilized duck egg incubated for 14-21 days before being boiled and eaten whole. A beloved street food with a unique texture and rich, complex flavor.",
    culturalBackground: "Balut is an iconic Filipino street food that has been enjoyed for centuries. It's particularly popular as a late-night snack and is believed to have aphrodisiac properties. The preparation and consumption of balut is deeply embedded in Filipino culture and represents the resourceful use of available protein sources.",
    recipe: {
      ingredients: [
        "1 balut egg",
        "Salt or rock salt",
        "Chili vinegar or spicy vinegar",
        "Fresh chili peppers (optional)"
      ],
      instructions: [
        "Gently tap the larger end of the egg to create a small hole",
        "Sip the warm broth inside",
        "Peel away more shell to access the contents",
        "Season with salt and chili vinegar",
        "Eat in small bites, enjoying the different textures"
      ],
      preparationTime: 2,
      servings: 1,
      difficulty: "easy",
      tips: ["Best eaten warm", "Start with younger balut (14 days) for milder experience"]
    },
    imageUrl: generatePlaceholderImage("Balut", "weird-cursed", 800, 600),
    thumbnailUrl: generateThumbnail("Balut", "weird-cursed"),
    theme: "weird-cursed" as ThemeCategory,
    rarity: "rare",
    origin: {
      country: "Philippines",
      region: "Throughout Philippines",
      culturalPeriod: "Pre-colonial era",
      significance: "Symbol of Filipino street food culture and adventurous eating"
    },
    tags: ["street-food", "protein", "filipino", "traditional", "adventurous"],
    isActive: true,
    contentVersion: 1
  },

  // Global Street Foods
  {
    name: "Jianbing",
    description: "A crispy Chinese crepe made on a hot griddle, filled with egg, scallions, cilantro, and various sauces, then wrapped with a crispy wonton cracker inside.",
    culturalBackground: "Jianbing originated in Northern China during the Three Kingdoms period (220-280 AD) and has evolved into one of China's most beloved breakfast foods. Street vendors can be found throughout Chinese cities, each with their own secret sauce recipes passed down through generations.",
    recipe: {
      ingredients: [
        "1 cup wheat flour",
        "1/2 cup mung bean flour",
        "1.5 cups water",
        "2 eggs",
        "2 scallions, chopped",
        "2 tbsp cilantro, chopped",
        "Hoisin sauce",
        "Chili sauce",
        "Sesame seeds",
        "Crispy wonton crackers"
      ],
      instructions: [
        "Mix flours with water to make batter",
        "Pour batter on hot griddle in circular motion",
        "Crack egg on top and spread evenly",
        "Sprinkle scallions and cilantro",
        "Add sauces and sesame seeds",
        "Place wonton cracker on half",
        "Fold and serve hot"
      ],
      preparationTime: 15,
      servings: 1,
      difficulty: "medium",
      tips: ["Keep griddle at medium heat", "Work quickly while batter is wet"]
    },
    imageUrl: "data:image/svg+xml;base64," + btoa(`<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#64748b"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    thumbnailUrl: "data:image/svg+xml;base64," + btoa(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#94a3b8"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    theme: "global-street" as ThemeCategory,
    rarity: "common",
    origin: {
      country: "China",
      region: "Northern China",
      culturalPeriod: "Three Kingdoms period (220-280 AD)",
      significance: "Quintessential Chinese breakfast street food"
    },
    tags: ["breakfast", "crepe", "chinese", "street-food", "savory"],
    isActive: true,
    contentVersion: 1
  },
  {
    name: "Arepa",
    description: "A round, flat cornbread that's split open and stuffed with various fillings like cheese, meat, beans, or avocado. A staple food across Venezuela and Colombia.",
    culturalBackground: "Arepas have been a fundamental food in Venezuelan and Colombian culture for over 3,000 years, originally made by indigenous peoples. The name comes from the indigenous word 'erepa'. Each region has developed unique styles and fillings, making arepas a symbol of cultural identity and family tradition.",
    recipe: {
      ingredients: [
        "2 cups pre-cooked white corn flour (Harina PAN)",
        "2.5 cups warm water",
        "1 tsp salt",
        "1 tbsp vegetable oil",
        "Cheese, shredded chicken, or black beans for filling"
      ],
      instructions: [
        "Dissolve salt in warm water",
        "Gradually add corn flour while mixing",
        "Add oil and knead into smooth dough",
        "Form into balls and flatten into discs",
        "Cook on griddle for 7-8 minutes per side",
        "Split open and fill with desired ingredients"
      ],
      preparationTime: 25,
      servings: 4,
      difficulty: "easy",
      tips: ["Dough should be smooth, not sticky", "Don't overfill the arepas"]
    },
    imageUrl: "data:image/svg+xml;base64," + btoa(`<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#64748b"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    thumbnailUrl: "data:image/svg+xml;base64," + btoa(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#94a3b8"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    theme: "global-street" as ThemeCategory,
    rarity: "common",
    origin: {
      country: "Venezuela/Colombia",
      region: "Northern South America",
      culturalPeriod: "Pre-Columbian era",
      significance: "Fundamental staple food representing cultural identity"
    },
    tags: ["cornbread", "venezuelan", "colombian", "street-food", "gluten-free"],
    isActive: true,
    contentVersion: 1
  },

  // Historical Desserts
  {
    name: "Syllabub",
    description: "A frothy Elizabethan dessert made from wine or sherry beaten with cream and sugar. Popular in 16th-18th century England as a luxurious treat for special occasions.",
    culturalBackground: "Syllabub was a fashionable dessert in Tudor and Georgian England, often served at grand feasts and celebrations. The name possibly derives from 'Sille', a wine region in France, and 'bub', an Elizabethan term for a bubbling drink. It represented the height of culinary sophistication in its era.",
    recipe: {
      ingredients: [
        "1 cup heavy cream",
        "1/3 cup white wine or sherry",
        "3 tbsp sugar",
        "Zest of 1 lemon",
        "2 tbsp lemon juice",
        "Pinch of nutmeg"
      ],
      instructions: [
        "Combine wine, lemon juice, and sugar",
        "Stir until sugar dissolves",
        "Add cream and lemon zest",
        "Whisk vigorously until soft peaks form",
        "Spoon into glasses",
        "Chill for 2 hours before serving",
        "Dust with nutmeg before serving"
      ],
      preparationTime: 15,
      servings: 4,
      difficulty: "easy",
      tips: ["Don't overwhip or it will curdle", "Serve in elegant glasses for authenticity"]
    },
    imageUrl: "data:image/svg+xml;base64," + btoa(`<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#64748b"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    thumbnailUrl: "data:image/svg+xml;base64," + btoa(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#94a3b8"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    theme: "historical-desserts" as ThemeCategory,
    rarity: "uncommon",
    origin: {
      country: "England",
      region: "Throughout England",
      culturalPeriod: "Elizabethan era (1558-1603)",
      significance: "Symbol of aristocratic refinement and culinary sophistication"
    },
    tags: ["elizabethan", "cream", "wine", "historical", "elegant"],
    isActive: true,
    contentVersion: 1
  },
  {
    name: "Roman Honey Cakes",
    description: "Ancient Roman sweet cakes made with honey, flour, and eggs. These libum cakes were often offered to the gods in religious ceremonies.",
    culturalBackground: "Libum was a sacred cake in ancient Rome, mentioned by Cato the Elder in his agricultural writings around 160 BCE. These honey cakes were essential in religious rituals and were believed to please the gods. The recipe represents one of the earliest documented desserts in Western civilization.",
    recipe: {
      ingredients: [
        "2 cups flour",
        "1 cup honey",
        "4 eggs",
        "1/2 cup olive oil",
        "1 tsp ground anise seed",
        "Bay leaves for decoration"
      ],
      instructions: [
        "Beat eggs until frothy",
        "Gradually add honey while beating",
        "Mix in olive oil and anise",
        "Fold in flour until just combined",
        "Pour into oiled molds",
        "Top with bay leaves",
        "Bake at 350°F for 25-30 minutes"
      ],
      preparationTime: 45,
      servings: 8,
      difficulty: "medium",
      tips: ["Use high-quality honey for best flavor", "Bay leaves are traditional but can be omitted"]
    },
    imageUrl: "data:image/svg+xml;base64," + btoa(`<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#64748b"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    thumbnailUrl: "data:image/svg+xml;base64," + btoa(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#94a3b8"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    theme: "historical-desserts" as ThemeCategory,
    rarity: "rare",
    origin: {
      country: "Rome",
      region: "Roman Empire",
      culturalPeriod: "Ancient Rome (753 BCE - 476 CE)",
      significance: "Sacred offering cakes used in religious ceremonies"
    },
    tags: ["ancient", "roman", "honey", "religious", "historical"],
    isActive: true,
    contentVersion: 1
  },

  // Mythical Foods
  {
    name: "Ambrosia",
    description: "The food of the Greek gods, said to confer immortality upon those who consumed it. Often depicted as a fragrant, honey-like substance that glowed with divine light.",
    culturalBackground: "In Greek mythology, ambrosia was the divine food that sustained the gods of Mount Olympus and granted them eternal life. Homer described it as being nine times sweeter than honey. The concept of ambrosia has influenced literature and culture for millennia, symbolizing the ultimate nourishment.",
    imageUrl: "data:image/svg+xml;base64," + btoa(`<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#64748b"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    thumbnailUrl: "data:image/svg+xml;base64," + btoa(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#94a3b8"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    theme: "mythical-foods" as ThemeCategory,
    rarity: "legendary",
    origin: {
      country: "Greece",
      region: "Mount Olympus",
      culturalPeriod: "Ancient Greek mythology",
      significance: "Divine food that granted immortality to the gods"
    },
    tags: ["mythical", "greek", "immortality", "divine", "legendary"],
    isActive: true,
    contentVersion: 1
  },
  {
    name: "Golden Apple of Idunn",
    description: "Magical apples from Norse mythology that kept the gods young and vigorous. Idunn, goddess of youth, guarded these precious fruits that prevented aging.",
    culturalBackground: "In Norse mythology, Idunn's golden apples were essential for maintaining the youth and strength of the Æsir gods. The theft of these apples by Loki led to one of the most famous mythological tales. These apples represent the Norse understanding of vitality and the fear of aging.",
    imageUrl: "data:image/svg+xml;base64," + btoa(`<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#64748b"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    thumbnailUrl: "data:image/svg+xml;base64," + btoa(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#94a3b8"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">Food Item</text></svg>`),
    theme: "mythical-foods" as ThemeCategory,
    rarity: "legendary",
    origin: {
      country: "Scandinavia",
      region: "Asgard",
      culturalPeriod: "Norse mythology",
      significance: "Fruit of eternal youth for the Norse gods"
    },
    tags: ["mythical", "norse", "youth", "apple", "magical"],
    isActive: true,
    contentVersion: 1
  }
];

// Content packs for each theme
export const initialContentPacks: Omit<ContentPack, 'id' | 'createdAt'>[] = [
  {
    theme: "weird-cursed" as ThemeCategory,
    name: "Weird & Cursed Foods",
    description: "Dare to explore the world's most unusual and intimidating delicacies. These foods challenge your taste buds and expand your culinary horizons.",
    foodItemIds: [], // Will be populated when items are created
    releaseDate: Timestamp.now(),
    isActive: true,
    subscriberCount: 0
  },
  {
    theme: "global-street" as ThemeCategory,
    name: "Global Street Foods",
    description: "Experience the vibrant flavors of street food from around the world. From morning crepes to evening snacks, discover authentic recipes from local vendors.",
    foodItemIds: [], // Will be populated when items are created
    releaseDate: Timestamp.now(),
    isActive: true,
    subscriberCount: 0
  },
  {
    theme: "historical-desserts" as ThemeCategory,
    name: "Historical Desserts",
    description: "Journey through time with desserts from bygone eras. Taste the sweetness that delighted ancient civilizations and royal courts.",
    foodItemIds: [], // Will be populated when items are created
    releaseDate: Timestamp.now(),
    isActive: true,
    subscriberCount: 0
  },
  {
    theme: "mythical-foods" as ThemeCategory,
    name: "Mythical Foods",
    description: "Discover the legendary foods of gods, heroes, and mythical creatures. These divine delicacies exist only in stories but live forever in imagination.",
    foodItemIds: [], // Will be populated when items are created
    releaseDate: Timestamp.now(),
    isActive: true,
    subscriberCount: 0
  }
];

// Utility function to seed the database with initial content
export const seedFoodDatabase = async () => {
  // This would be implemented as a separate script or admin function
  console.log('Seeding database with initial food content...');
  console.log(`${initialFoodItems.length} food items prepared`);
  console.log(`${initialContentPacks.length} content packs prepared`);
};