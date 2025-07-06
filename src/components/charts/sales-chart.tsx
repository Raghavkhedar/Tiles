"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SalesChartProps {
  data: {
    month: string;
    revenue: number;
    orders: number;
    customers: number;
  }[];
  currentMonth: {
    revenue: number;
    orders: number;
    customers: number;
  };
  previousMonth: {
    revenue: number;
    orders: number;
    customers: number;
  };
}

export default function SalesChart({ data, currentMonth, previousMonth }: SalesChartProps) {
  const revenueGrowth = previousMonth.revenue > 0 
    ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 
    : 0;
  
  const ordersGrowth = previousMonth.orders > 0 
    ? ((currentMonth.orders - previousMonth.orders) / previousMonth.orders) * 100 
    : 0;
  
  const customersGrowth = previousMonth.customers > 0 
    ? ((currentMonth.customers - previousMonth.customers) / previousMonth.customers) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Performance</CardTitle>
        <CardDescription>Monthly sales trends and growth</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue Chart */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Revenue Trend</h3>
              <div className="flex items-center gap-2">
                {revenueGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-2xl font-bold text-foreground mb-2">
                  ₹{currentMonth.revenue.toLocaleString()}
                </div>
                <div className="text-sm">This Month's Revenue</div>
                <div className="text-xs mt-2">Chart visualization coming soon</div>
              </div>
            </div>
          </div>

          {/* Orders Chart */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Orders Trend</h3>
              <div className="flex items-center gap-2">
                {ordersGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ordersGrowth >= 0 ? '+' : ''}{ordersGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-xl font-bold text-foreground mb-1">
                  {currentMonth.orders}
                </div>
                <div className="text-sm">Orders This Month</div>
              </div>
            </div>
          </div>

          {/* Customers Chart */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Customers</h3>
              <div className="flex items-center gap-2">
                {customersGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${customersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {customersGrowth >= 0 ? '+' : ''}{customersGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-xl font-bold text-foreground mb-1">
                  {currentMonth.customers}
                </div>
                <div className="text-sm">Active Customers</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 