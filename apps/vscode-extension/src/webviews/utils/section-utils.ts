export interface SectionFileData {
  path: string;
  type: string;
  target: string;
}

export interface Section {
  id: string;
  name: string;
  count: number;
  items: Item[];
}

export interface SectionMetaData {
  id: string;
  name: string;
  count: number;
}

export interface Item {
  name: string;
  description: string;
  type: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: SectionFileData[];
  cssVars?: any;
  css?: any;
  meta: {
    category: string;
    section: string;
    title: string;
    isPro?: boolean;
    isNew?: boolean;
    isBasic?: boolean;
  };
}

export interface groupedItem {
  [key: string]: Item[];
}

const SECTION_IMAGES_URL =
  'https://cdn.allframer.club/af-assets/hero-slider/sectiondetails.json';

let sectionImagesCache: { [key: string]: string } = {};

// Helper to format section names
const formatSectionName = (section: string): string => {
  return section
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Fetches section images from the remote JSON on every call so newly added
 * sections on the CDN are reflected immediately without requiring a restart.
 * Falls back to the last successful cache if the fetch fails.
 */
export const initSectionImages = async (): Promise<void> => {
  try {
    const response = await fetch(SECTION_IMAGES_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch section images: ${response.status}`);
    }
    sectionImagesCache = (await response.json()) as { [key: string]: string };
    console.log(
      'Section images loaded successfully from remote.',
      sectionImagesCache,
    );
  } catch (error) {
    console.error('Could not load section images from remote:', error);
  }
};

export const getImageForSection = (sectionId: string): string => {
  return sectionImagesCache[sectionId] || '';
};

export const getSections = (items: Item[]): Section[] => {
  const sectionMap = new Map();

  items.forEach((item) => {
    const section = item.meta.section;
    if (!sectionMap.has(section)) {
      sectionMap.set(section, {
        id: section,
        name: formatSectionName(section),
        count: 0,
        img: getImageForSection(section),
        items: [],
      });
    }

    const sectionData = sectionMap.get(section);
    sectionData.count++;
    sectionData.items.push(item);
  });

  return Array.from(sectionMap.values());
};

export const getItemsBySection = (items: Item[], sectionId: string): Item[] => {
  return items.filter((item) => item.meta.section === sectionId);
};

export const getSectionsMetaData = (sections: Section[]): SectionMetaData[] => {
  return sections.map((section) => {
    return {
      id: section.id,
      name: section.name,
      count: section.count,
    };
  });
};

// Search sections by name
export const searchSections = (
  sections: Section[],
  query: string,
): Section[] => {
  const lowerQuery = query.toLowerCase();
  return sections.filter((section) =>
    section.name.toLowerCase().includes(lowerQuery),
  );
};

// Search items by name or description
export const searchItems = (items: Item[], query: string): Item[] => {
  const lowerQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.meta.title.toLowerCase().includes(lowerQuery),
  );
};

// const sections = getSections(items)
// const sectionsMetaData = getSectionsMetaData(sections)

// const aboutusItems = getItemBySection(items, 'about-us-page')
// Example usage
// console.log("Sections:", sections)
// console.log("Sections MetaData:", sectionsMetaData)
// console.log("Items in 'about-us-page' section:", getItemBySection(items, 'about-us-page'))
// console.log("Search Sections for 'app':", searchSections(sections, 'contact'))
// console.log("Search Items for 'blog':", searchItems(aboutusItems, 'centered'))
