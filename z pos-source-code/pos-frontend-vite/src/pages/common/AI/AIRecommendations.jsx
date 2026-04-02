import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, TrendingUp } from 'lucide-react';
import api from '@/utils/api';
import { useSelector } from 'react-redux';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get('/api/ai/recommendations', {
          params: { storeAdminId: userProfile?.id }
        });
        setRecommendations(response.data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.id) fetchRecommendations();
  }, [userProfile]);

  if (loading) return <div>Loading recommendations...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations.map((item, i) => (
        <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-video bg-muted relative">
            {item.image ? (
              <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground italic">
                No Image
              </div>
            )}
            <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Score: {item.score.toFixed(2)}
            </Badge>
          </div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription>{item.category}</CardDescription>
              </div>
              <p className="font-bold text-primary">₹{item.sellingPrice}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
              <p className="text-sm text-primary flex items-start gap-2">
                <TrendingUp className="h-4 w-4 mt-0.5 shrink-0" />
                <span><strong>AI Reason:</strong> {item.reason}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">SKU: {item.sku}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AIRecommendations;
