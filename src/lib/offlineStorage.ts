interface Building {
  id: number;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  floors: number;
  area: number;
  people_capacity: number;
  building_type: string;
  risk_level: string;
  hydrants_count: number;
  notes?: string;
}

interface WaterSource {
  id: number;
  source_type: string;
  number: string;
  latitude: string;
  longitude: string;
  pressure?: string;
  diameter?: string;
  volume?: string;
  depth?: string;
  status: string;
  notes?: string;
}

interface ActiveCall {
  id: number;
  building_id: number;
  call_type: string;
  call_time: string;
  status: string;
  priority: string;
  building_name?: string;
  building_address?: string;
  latitude?: string;
  longitude?: string;
  notes?: string;
}

interface FirefighterData {
  buildings: Building[];
  water_sources: WaterSource[];
  active_calls: ActiveCall[];
  last_sync: string;
}

const STORAGE_KEY = 'firefighter_data';
const API_URL = 'https://functions.poehali.dev/d5b4a2cf-7069-4d46-a89f-13a472bf9e81';

export const offlineStorage = {
  saveData(data: Partial<FirefighterData>): void {
    try {
      const existingData = this.getData();
      const updatedData = {
        ...existingData,
        ...data,
        last_sync: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  getData(): FirefighterData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    return {
      buildings: [],
      water_sources: [],
      active_calls: [],
      last_sync: '',
    };
  },

  async syncWithServer(): Promise<FirefighterData> {
    try {
      const response = await fetch(`${API_URL}?type=all`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      this.saveData(data);
      return data;
    } catch (error) {
      console.error('Error syncing with server:', error);
      return this.getData();
    }
  },

  async getBuildings(): Promise<Building[]> {
    const data = this.getData();
    if (data.buildings.length === 0 || this.shouldSync(data.last_sync)) {
      const freshData = await this.syncWithServer();
      return freshData.buildings;
    }
    return data.buildings;
  },

  async getWaterSources(): Promise<WaterSource[]> {
    const data = this.getData();
    if (data.water_sources.length === 0 || this.shouldSync(data.last_sync)) {
      const freshData = await this.syncWithServer();
      return freshData.water_sources;
    }
    return data.water_sources;
  },

  async getActiveCalls(): Promise<ActiveCall[]> {
    const data = this.getData();
    if (this.shouldSync(data.last_sync)) {
      const freshData = await this.syncWithServer();
      return freshData.active_calls;
    }
    return data.active_calls;
  },

  shouldSync(lastSync: string): boolean {
    if (!lastSync) return true;
    
    const lastSyncTime = new Date(lastSync).getTime();
    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    return (now - lastSyncTime) > fiveMinutes;
  },

  clearCache(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  getLastSyncTime(): string | null {
    const data = this.getData();
    return data.last_sync || null;
  },

  isOnline(): boolean {
    return navigator.onLine;
  },
};

export type { Building, WaterSource, ActiveCall, FirefighterData };
