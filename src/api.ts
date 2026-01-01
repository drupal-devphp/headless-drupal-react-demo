// helper functions for API requests and included parsing
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost/drupal";

export type IncludedResource = {
  id: string;
  type: string;
  attributes?: any;
};

export function findIncluded(
  included: IncludedResource[] = [],
  type: string,
  id?: string
) {
  if (!included) return null;
  if (id) {
    return included.find((i) => i.type === type && i.id === id) || null;
  }
  return included.find((i) => i.type === type) || null;
}

export function getImageUrlFromIncluded(included: IncludedResource[], fileId?: string) {
  if (!included || !fileId) return null;
  const file = findIncluded(included, "file--file", fileId);
  const imageUrl = file?.attributes?.uri?.url;
  
  if (!imageUrl) return null;
  
  // If the URL is relative and starts with /drupal, convert it to an absolute URL
  if (imageUrl.startsWith("/drupal")) {
    // Remove the /drupal prefix and prepend the API_BASE
    const relativePath = imageUrl.substring(7); // Remove "/drupal"
    return API_BASE + relativePath;
  }
  
  // If it's already an absolute URL, return as-is
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  
  return imageUrl;
}
