import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');

class DataStore {
  constructor() {
    this.data = {
      users: [],
      bloggers: [],
      bookings: [],
      applications: [],
      expenses: [],
      budgets: []
    };
  }

  async load() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });

      const files = ['users', 'bloggers', 'bookings', 'applications', 'expenses', 'budgets'];
      for (const file of files) {
        const filePath = path.join(DATA_DIR, `${file}.json`);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          this.data[file] = JSON.parse(content);
        } catch (err) {
          this.data[file] = [];
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async save(type) {
    try {
      const filePath = path.join(DATA_DIR, `${type}.json`);
      await fs.writeFile(filePath, JSON.stringify(this.data[type], null, 2));
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
    }
  }

  get(type) {
    return this.data[type] || [];
  }

  add(type, item) {
    this.data[type].push(item);
    this.save(type).catch(err => console.error('Save error:', err));
    return item;
  }

  update(type, id, updates) {
    const items = this.data[type];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, id };
      this.save(type).catch(err => console.error('Save error:', err));
      return items[index];
    }
    return null;
  }

  delete(type, id) {
    const items = this.data[type];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = items.splice(index, 1)[0];
      this.save(type).catch(err => console.error('Save error:', err));
      return deleted;
    }
    return null;
  }

  find(type, predicate) {
    return this.data[type].find(predicate);
  }

  findAll(type, predicate) {
    return this.data[type].filter(predicate);
  }
}

export default new DataStore();
