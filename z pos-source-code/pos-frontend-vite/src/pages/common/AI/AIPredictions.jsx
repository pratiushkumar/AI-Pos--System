import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '@/utils/api';
import { useSelector } from 'react-redux';

const AIPredictions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/ai/sales-predictions', {
          params: { storeAdminId: userProfile?.id }
        });
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.id) fetchData();
  }, [userProfile]);

  if (loading) return <div>Loading predictions...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Forecast</CardTitle>
          <CardDescription>AI-generated sales predictions for the upcoming period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="predictedSales" 
                  stroke="var(--color-primary, #3b82f6)" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  strokeWidth={2}
                  name="Predicted Sales"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Predicted Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1,25,000</div>
            <p className="text-xs text-green-500">+12.5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confidence Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">High (92%)</div>
            <p className="text-xs text-muted-foreground">Based on historical seasonality</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Market Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">Bullish</div>
            <p className="text-xs text-muted-foreground">Local consumer demand rising</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIPredictions;
