const KEY = "cap-or-no-cap-player-id";
const NAME_KEY = "cap-or-no-cap-player-name";

export function getPlayerId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function getSavedName(): string {
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function saveName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}
