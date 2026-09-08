const SAVED_LOOKS_KEY = 'pawlook_saved_looks';

export interface SavedLook {
  id: string;
  styleId: string;
  resultImage: string;
  savedAt: number;
}

export function saveLook(look: SavedLook): void {
  const existing = getSavedLooks();
  existing.unshift(look);
  localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify(existing.slice(0, 20)));
}

export function getSavedLooks(): SavedLook[] {
  try {
    const raw = localStorage.getItem(SAVED_LOOKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
