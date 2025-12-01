-- Создание таблицы зданий
CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    floors INTEGER NOT NULL,
    area INTEGER NOT NULL,
    people_capacity INTEGER,
    building_type VARCHAR(100),
    risk_level VARCHAR(50),
    hydrants_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы водоисточников
CREATE TABLE IF NOT EXISTS water_sources (
    id SERIAL PRIMARY KEY,
    source_type VARCHAR(100) NOT NULL,
    number VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    pressure VARCHAR(50),
    diameter VARCHAR(50),
    volume VARCHAR(50),
    depth VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Исправен',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы активных вызовов
CREATE TABLE IF NOT EXISTS active_calls (
    id SERIAL PRIMARY KEY,
    building_id INTEGER REFERENCES buildings(id),
    call_type VARCHAR(100) NOT NULL,
    call_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Активный',
    priority VARCHAR(50) DEFAULT 'Высокий',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_buildings_coords ON buildings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_water_sources_coords ON water_sources(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_active_calls_status ON active_calls(status);
