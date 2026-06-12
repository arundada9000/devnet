const MIGRATIONS_KEY = "zustand-migrations";
const CURRENT_VERSION = 2;

const migrations = {
  1: (state) => {
    if (state.theme === "classic") {
      state.theme = "light";
    }
    return state;
  },
  2: (state) => {
    if (typeof state.fontSize === "number") {
      const map = { 14: "sm", 16: "base", 18: "lg", 20: "xl" };
      state.fontSize = map[state.fontSize] || "base";
    }
    return state;
  },
};

export function getStoredVersion() {
  try {
    return JSON.parse(localStorage.getItem(MIGRATIONS_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function migrateStore(name, raw) {
  let version = getStoredVersion();
  let state = raw;

  while (version < CURRENT_VERSION) {
    const next = version + 1;
    const migrateFn = migrations[next];
    if (migrateFn) {
      state = migrateFn(state);
    }
    version = next;
  }

  localStorage.setItem(MIGRATIONS_KEY, JSON.stringify(version));
  return state;
}
