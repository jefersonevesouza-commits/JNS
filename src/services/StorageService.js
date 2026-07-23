const PREFIX = 'nevesfinance_';

function read(key) {
  const raw = localStorage.getItem(PREFIX + key);
  return raw ? JSON.parse(raw) : [];
}

function write(key, items) {
  localStorage.setItem(PREFIX + key, JSON.stringify(items));
}

function genId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const StorageService = {
  list(key, sort) {
    let items = read(key);
    if (sort) {
      const field = sort.replace('-', '');
      const descending = sort.startsWith('-');
      items.sort((a, b) => {
        const av = a[field] || '';
        const bv = b[field] || '';
        return descending
          ? String(bv).localeCompare(String(av))
          : String(av).localeCompare(String(bv));
      });
    }
    return items;
  },

  filter(key, query) {
    return read(key).filter(item =>
      Object.entries(query).every(([k, v]) => item[k] === v)
    );
  },

  create(key, data) {
    const items = read(key);
    const newItem = {
      ...data,
      id: genId(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };
    items.unshift(newItem);
    write(key, items);
    return newItem;
  },

  update(key, id, data) {
    const items = read(key);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Item not found');
    items[idx] = { ...items[idx], ...data, updated_date: new Date().toISOString() };
    write(key, items);
    return items[idx];
  },

  delete(key, id) {
    write(key, read(key).filter(i => i.id !== id));
  },

  clear(key) {
    write(key, []);
  },
};