import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import YandexMap from '@/components/YandexMap';
import { offlineStorage, Building, WaterSource, ActiveCall } from '@/lib/offlineStorage';

const Index = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(1);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [waterSources, setWaterSources] = useState<WaterSource[]>([]);
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      loadData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [buildingsData, waterSourcesData, callsData] = await Promise.all([
        offlineStorage.getBuildings(),
        offlineStorage.getWaterSources(),
        offlineStorage.getActiveCalls(),
      ]);

      setBuildings(buildingsData);
      setWaterSources(waterSourcesData);
      setActiveCalls(callsData);
      setLastSync(offlineStorage.getLastSyncTime());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      await offlineStorage.syncWithServer();
      await loadData();
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentBuilding = buildings.find(b => b.id === selectedBuilding);
  const activeCall = activeCalls.length > 0 ? activeCalls[0] : null;

  const mapMarkers = [
    ...(activeCall && activeCall.latitude && activeCall.longitude ? [{
      id: 'fire-active',
      coordinates: [parseFloat(activeCall.longitude), parseFloat(activeCall.latitude)] as [number, number],
      type: 'fire' as const,
      title: 'Активный вызов',
      description: activeCall.building_name,
    }] : []),
    ...buildings.map((building) => ({
      id: `building-${building.id}`,
      coordinates: [parseFloat(building.longitude), parseFloat(building.latitude)] as [number, number],
      type: 'building' as const,
      title: building.name,
    })),
    ...waterSources.slice(0, 5).map((source) => ({
      id: `water-${source.id}`,
      coordinates: [parseFloat(source.longitude), parseFloat(source.latitude)] as [number, number],
      type: (source.source_type.includes('гидрант') ? 'hydrant' : 'water') as const,
      title: source.number,
    })),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Flame" size={32} className="text-accent" />
            <div>
              <h1 className="text-2xl font-bold">МЧС России</h1>
              <p className="text-sm opacity-90">Оперативная система пожаротушения</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-sm">{isOnline ? 'Онлайн' : 'Оффлайн'}</span>
              {lastSync && (
                <span className="text-xs opacity-75">
                  Синхронизация: {new Date(lastSync).toLocaleTimeString('ru')}
                </span>
              )}
              <Button size="sm" variant="outline" onClick={handleManualSync} disabled={isLoading}>
                <Icon name="RefreshCw" size={14} className={isLoading ? 'animate-spin' : ''} />
              </Button>
            </div>
            {activeCall && (
              <div className="flex items-center gap-4">
                <Badge variant="destructive" className="px-4 py-2 text-base animate-pulse">
                  <Icon name="AlertTriangle" size={16} className="mr-2" />
                  {activeCall.call_type}: {activeCall.building_name}
                </Badge>
                <Button variant="secondary" size="lg">
                  <Icon name="Navigation" size={20} className="mr-2" />
                  Маршрут
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-secondary text-secondary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Map" size={24} />
                Интерактивная карта района
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative">
              <div className="aspect-video bg-muted relative overflow-hidden">
                <YandexMap 
                  markers={mapMarkers}
                  center={[37.6173, 55.7558]}
                  zoom={15}
                  className="w-full h-full"
                />

                <div className="absolute bottom-4 left-4 bg-card p-3 rounded-lg shadow-lg border z-10">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Icon name="Navigation" size={16} className="text-primary" />
                    <span>Расстояние до объекта: 2.4 км</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Icon name="Clock" size={16} />
                    <span>Время прибытия: ~4 минуты</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {currentBuilding && (
            <Card>
              <CardHeader className="bg-secondary text-secondary-foreground">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Building2" size={24} />
                  {currentBuilding.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="info">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">Характеристики</TabsTrigger>
                    <TabsTrigger value="plan">Планировка</TabsTrigger>
                    <TabsTrigger value="evacuation">Эвакуация</TabsTrigger>
                  </TabsList>
                  <TabsContent value="info" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Этажность</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <Icon name="Layers" size={20} className="text-primary" />
                          {currentBuilding.floors}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Площадь</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <Icon name="Square" size={20} className="text-primary" />
                          {currentBuilding.area} м²
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Людей</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <Icon name="Users" size={20} className="text-primary" />
                          {currentBuilding.people_capacity}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Координаты</div>
                        <div className="text-sm font-medium">
                          {parseFloat(currentBuilding.latitude).toFixed(4)}°,<br />
                          {parseFloat(currentBuilding.longitude).toFixed(4)}°
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{currentBuilding.building_type}</Badge>
                      <Badge variant={currentBuilding.risk_level === 'Высокий' ? 'destructive' : 'secondary'}>
                        Риск: {currentBuilding.risk_level}
                      </Badge>
                      <Badge variant="outline">Гидранты: {currentBuilding.hydrants_count}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <Icon name="MapPin" size={16} className="inline mr-1" />
                      {currentBuilding.address}
                    </div>
                  </TabsContent>
                  <TabsContent value="plan" className="mt-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                      <div className="text-center">
                        <Icon name="FileText" size={48} className="mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">План здания загружается...</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="evacuation" className="mt-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                      <div className="text-center">
                        <Icon name="FileText" size={48} className="mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Схема эвакуации загружается...</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="bg-destructive text-destructive-foreground">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Siren" size={24} />
                Активные вызовы
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {activeCalls.length > 0 ? (
                activeCalls.map((call) => (
                  <div key={call.id} className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Flame" size={20} className="text-destructive" />
                        <span className="font-bold">{call.call_type}</span>
                      </div>
                      <Badge variant="destructive">{call.priority}</Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{call.building_name}</p>
                    <p className="text-xs text-muted-foreground">{call.building_address}</p>
                    {call.notes && (
                      <p className="text-xs mt-2 text-muted-foreground">{call.notes}</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Icon name="Navigation" size={14} className="mr-1" />
                        Маршрут
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Icon name="Phone" size={14} className="mr-1" />
                        Связь
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="CheckCircle" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Активных вызовов нет</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-secondary text-secondary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Droplets" size={24} />
                Водоисточники
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Loader2" size={32} className="mx-auto animate-spin mb-2" />
                  <p className="text-sm">Загрузка данных...</p>
                </div>
              ) : waterSources.length > 0 ? (
                waterSources.map((source) => (
                  <div key={source.id} className="border rounded-lg p-3 hover:bg-accent/5 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon name="Droplets" size={18} className="text-blue-600" />
                        <span className="font-semibold text-sm">{source.source_type}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs flex items-center gap-1">
                        <Icon name="Hash" size={12} />
                        <span className="font-medium">{source.number}</span>
                      </div>
                      {source.pressure && (
                        <div className="text-xs text-muted-foreground">
                          Давление: {source.pressure}, Ø {source.diameter}
                        </div>
                      )}
                      {source.volume && (
                        <div className="text-xs text-muted-foreground">
                          Объём: {source.volume}, Глубина: {source.depth}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${source.status === 'Исправен' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs">{source.status}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      <Icon name="Navigation" size={14} className="mr-1" />
                      Проложить маршрут
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Droplets" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Нет данных о водоисточниках</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-secondary text-secondary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Icon name="Truck" size={24} />
                Техника в части
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="Truck" size={20} className="text-primary" />
                  <div>
                    <div className="font-semibold text-sm">АЦ-40</div>
                    <div className="text-xs text-muted-foreground">Автоцистерна</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Готова</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="Truck" size={20} className="text-primary" />
                  <div>
                    <div className="font-semibold text-sm">АЛ-30</div>
                    <div className="text-xs text-muted-foreground">Автолестница</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Готова</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="Truck" size={20} className="text-primary" />
                  <div>
                    <div className="font-semibold text-sm">АНР-40</div>
                    <div className="text-xs text-muted-foreground">Насосная</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">На выезде</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;