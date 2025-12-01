'''
Business: API для синхронизации данных о зданиях и водоисточниках
Args: event - dict с httpMethod, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response с данными из БД или ошибкой
'''

import json
import os
import psycopg2
from typing import Dict, Any, List, Optional
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL not found in environment')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def get_buildings(conn) -> List[Dict]:
    with conn.cursor() as cur:
        cur.execute('''
            SELECT id, name, address, latitude, longitude, floors, area, 
                   people_capacity, building_type, risk_level, hydrants_count, notes
            FROM buildings
            ORDER BY name
        ''')
        return [dict(row) for row in cur.fetchall()]

def get_water_sources(conn) -> List[Dict]:
    with conn.cursor() as cur:
        cur.execute('''
            SELECT id, source_type, number, latitude, longitude, pressure, 
                   diameter, volume, depth, status, notes
            FROM water_sources
            ORDER BY number
        ''')
        return [dict(row) for row in cur.fetchall()]

def get_active_calls(conn) -> List[Dict]:
    with conn.cursor() as cur:
        cur.execute('''
            SELECT ac.id, ac.building_id, ac.call_type, ac.call_time, 
                   ac.status, ac.priority, ac.notes,
                   b.name as building_name, b.address as building_address,
                   b.latitude, b.longitude
            FROM active_calls ac
            LEFT JOIN buildings b ON ac.building_id = b.id
            WHERE ac.status = 'Активный'
            ORDER BY ac.call_time DESC
        ''')
        results = cur.fetchall()
        for row in results:
            if row['call_time']:
                row['call_time'] = row['call_time'].isoformat()
        return [dict(row) for row in results]

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    params = event.get('queryStringParameters') or {}
    data_type = params.get('type', 'all')
    
    conn = get_db_connection()
    
    try:
        response_data = {}
        
        if data_type in ['all', 'buildings']:
            response_data['buildings'] = get_buildings(conn)
        
        if data_type in ['all', 'water_sources']:
            response_data['water_sources'] = get_water_sources(conn)
        
        if data_type in ['all', 'calls']:
            response_data['active_calls'] = get_active_calls(conn)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps(response_data, ensure_ascii=False, default=str)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)}, ensure_ascii=False)
        }
    
    finally:
        conn.close()
