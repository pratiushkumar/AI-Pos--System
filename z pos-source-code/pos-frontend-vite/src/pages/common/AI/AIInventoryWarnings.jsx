import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle } from 'lucide-react';
import api from '@/utils/api';
import { useSelector } from 'react-redux';

const AIInventoryWarnings = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchWarnings = async () => {
      try {
        const response = await api.get('/api/ai/inventory-warnings', {
          params: { storeAdminId: userProfile?.id }
        });
        setWarnings(response.data);
      } catch (error) {
        console.error('Failed to fetch warnings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.id) fetchWarnings();
  }, [userProfile]);

  if (loading) return <div>Loading warnings...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Inventory Insights</CardTitle>
        <CardDescription>Automated detection of stock-outs and low inventory based on supply chain trends.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>AI Insight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warnings.map((warn, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{warn.productName}</TableCell>
                <TableCell>{warn.sku}</TableCell>
                <TableCell>{warn.branchName}</TableCell>
                <TableCell>{warn.currentQty}</TableCell>
                <TableCell>
                  <Badge variant={warn.warningLevel === 'CRITICAL' ? 'destructive' : 'warning'}>
                    {warn.warningLevel === 'CRITICAL' ? (
                      <AlertCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {warn.warningLevel}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm italic text-muted-foreground">
                  {warn.message}
                </TableCell>
              </TableRow>
            ))}
            {warnings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                  No inventory warnings detected. Everything looks good!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AIInventoryWarnings;
