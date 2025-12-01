import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import YandexMap from '@/components/YandexMap';

const Index = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(1);
  const [activeCall, setActiveCall] = useState(true);

  const buildings = [
    {
      id: 1,
      name: 'Торговый центр "Галерея"',
      address: 'ул. Ленина, 45',
      floors: 5,
      area: 12500,
      people: 250,
      type: 'Общественное',
      risk: 'Высокий',
      hydrants: 4,
      distance: 450,
    },
    {
      id: 2,
      name: 'Жилой дом №12',
      address: 'ул. Победы, 12',
      floors: 9,
      area: 5400,
      people: 108,
      type: 'Жилое',
      risk: 'Средний',
      hydrants: 2,
      distance: 280,
    },
  ];

  const waterSources = [
    {
      id: 1,
      type: 'Пожарный гидрант',
      number: 'ПГ-45',
      pressure: '4.5 атм',
      diameter: '100 мм',
      status: 'Исправен',
      distance: 120,
      coords: '55.7558° N, 37.6173° E',
    },
    {
      id: 2,
      type: 'Пожарный водоём',
      number: 'ПВ-12',
      volume: '250 м³',
      depth: '3.5 м',
      status: 'Исправен',
      distance: 340,
      coords: '55.7542° N, 37.6189° E',
    },
    {
      id: 3,
      type: 'Пожарный гидрант',
      number: 'ПГ-46',
      pressure: '5.0 атм',
      diameter: '150 мм',
      status: 'Исправен',
      distance: 450,
      coords: '55.7565° N, 37.6155° E',
    },
  ];

  const currentBuilding = buildings.find(b => b.id === selectedBuilding);

  const mapMarkers = [
    {
      id: 'fire-1',
      coordinates: [37.6173, 55.7558] as [number, number],
      type: 'fire' as const,
      title: 'Место пожара',
      description: buildings[0].name,
    },
    {
      id: 'hydrant-1',
      coordinates: [37.6155, 55.7565] as [number, number],
      type: 'hydrant' as const,
      title: 'ПГ-46',
    },
    {
      id: 'hydrant-2',
      coordinates: [37.6189, 55.7542] as [number, number],
      type: 'water' as const,
      title: 'ПВ-12',
    },
    {
      id: 'building-1',
      coordinates: [37.6160, 55.7548] as [number, number],
      type: 'building' as const,
      title: buildings[1].name,
    },
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
          {activeCall && (
            <div className="flex items-center gap-4">
              <Badge variant="destructive" className="px-4 py-2 text-base animate-pulse">
                <Icon name="AlertTriangle" size={16} className="mr-2" />
                Активный вызов: 00:12:34
              </Badge>
              <Button variant="secondary" size="lg">
                <Icon name="Navigation" size={20} className="mr-2" />
                Маршрут
              </Button>
            </div>
          )}
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
                          {currentBuilding.people}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">Расстояние</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <Icon name="MapPin" size={20} className="text-primary" />
                          {currentBuilding.distance} м
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{currentBuilding.type}</Badge>
                      <Badge variant={currentBuilding.risk === 'Высокий' ? 'destructive' : 'secondary'}>
                        Риск: {currentBuilding.risk}
                      </Badge>
                      <Badge variant="outline">Гидранты: {currentBuilding.hydrants}</Badge>
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
              <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="Flame" size={20} className="text-destructive" />
                    <span className="font-bold">Пожар</span>
                  </div>
                  <Badge variant="destructive">00:12:34</Badge>
                </div>
                <p className="text-sm font-medium mb-1">{buildings[0].name}</p>
                <p className="text-xs text-muted-foreground">{buildings[0].address}</p>
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
              {waterSources.map((source) => (
                <div key={source.id} className="border rounded-lg p-3 hover:bg-accent/5 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="Droplets" size={18} className="text-blue-600" />
                      <span className="font-semibold text-sm">{source.type}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{source.distance} м</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs flex items-center gap-1">
                      <Icon name="Hash" size={12} />
                      <span className="font-medium">{source.number}</span>
                    </div>
                    {'pressure' in source && (
                      <div className="text-xs text-muted-foreground">
                        Давление: {source.pressure}, Ø {source.diameter}
                      </div>
                    )}
                    {'volume' in source && (
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
              ))}
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