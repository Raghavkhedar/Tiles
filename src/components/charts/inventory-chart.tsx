"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface InventoryChartProps {
  type: 'stock-levels' | 'low-stock' | 'dead-stock';
  data: {
    // Stock levels data
    totalItems?: number;
    lowStockCount?: number;
    overstockedCount?: number;
    normalStockCount?: number;
    totalStockValue?: number;
    // Low stock data
    lowStockData?: Array<{
      name: string;
      currentStock: number;
      minStock: number;
      urgency: string;
    }>;
    criticalCount?: number;
    lowCount?: number;
    // Dead stock data
    deadStockData?: Array<{
      name: string;
      currentStock: number;
      stockValue: number;
      stockAge: number;
    }>;
    totalDeadStockValue?: number;
    criticalDeadStock?: number;
    moderateDeadStock?: number;
  };
}

export default function InventoryChart({ type, data }: InventoryChartProps) {
  if (type === 'stock-levels') {
    const lowStockPercentage = data.totalItems 
      ? (data.lowStockCount || 0) / data.totalItems * 100 
      : 0;
    const overstockedPercentage = data.totalItems 
      ? (data.overstockedCount || 0) / data.totalItems * 100 
      : 0;
    const normalStockPercentage = data.totalItems 
      ? (data.normalStockCount || 0) / data.totalItems * 100 
      : 0;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Level Overview</CardTitle>
          <CardDescription>Current inventory status and value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Stock Status Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stock Status Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Low Stock</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {data.lowStockCount || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {lowStockPercentage.toFixed(1)}% of total
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Normal</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.normalStockCount || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {normalStockPercentage.toFixed(1)}% of total
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Overstocked</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.overstockedCount || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {overstockedPercentage.toFixed(1)}% of total
                  </div>
                </div>
              </div>
            </div>

            {/* Total Stock Value */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Total Stock Value</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Total Inventory Value</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{data.totalStockValue?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {data.totalItems || 0} items in stock
                </div>
              </div>
            </div>

            {/* Stock Level Chart Placeholder */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stock Level Trends</h3>
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2" />
                  <p>Stock Level Chart</p>
                  <p className="text-sm">Chart visualization coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'low-stock') {
    const criticalPercentage = data.lowStockData 
      ? (data.criticalCount || 0) / data.lowStockData.length * 100 
      : 0;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Analysis</CardTitle>
          <CardDescription>Items requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Critical vs Low Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Stock Urgency</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Critical</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {data.criticalCount || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {criticalPercentage.toFixed(1)}% of low stock items
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">Low</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {data.lowCount || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(100 - criticalPercentage).toFixed(1)}% of low stock items
                  </div>
                </div>
              </div>
            </div>

            {/* Top Critical Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Critical Stock Items</h3>
              <div className="space-y-3">
                {data.lowStockData?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Current: {item.currentStock} | Min: {item.minStock}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${item.urgency === 'Critical' ? 'text-red-600' : 'text-orange-600'}`}>
                        {item.urgency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Deficit: {Math.max(item.minStock - item.currentStock, 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'dead-stock') {
    const criticalPercentage = data.deadStockData 
      ? (data.criticalDeadStock || 0) / data.deadStockData.length * 100 
      : 0;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Dead Stock Analysis</CardTitle>
          <CardDescription>Non-moving inventory requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Dead Stock Value */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Dead Stock Value</h3>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Total Dead Stock Value</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  ₹{data.totalDeadStockValue?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {data.deadStockData?.length || 0} items identified
                </div>
              </div>
            </div>

            {/* Critical vs Moderate */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Dead Stock Severity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Critical</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {data.criticalDeadStock || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {criticalPercentage.toFixed(1)}% of dead stock
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">Moderate</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {data.moderateDeadStock || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(100 - criticalPercentage).toFixed(1)}% of dead stock
                  </div>
                </div>
              </div>
            </div>

            {/* Top Dead Stock Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">High-Value Dead Stock</h3>
              <div className="space-y-3">
                {data.deadStockData?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Stock: {item.currentStock} | Age: {item.stockAge} days
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{item.stockValue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.stockAge > 180 ? 'Critical' : 'Moderate'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
} 