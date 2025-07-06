"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

interface FinancialChartProps {
  type: 'profit-loss' | 'cash-flow';
  data: {
    revenue?: number;
    costOfGoodsSold?: number;
    grossProfit?: number;
    operatingExpenses?: Record<string, number>;
    totalOperatingExpenses?: number;
    netProfit?: number;
    profitMargin?: number;
    // Cash flow data
    inflows?: {
      customerPayments: number;
      cashSales: number;
      other: number;
    };
    outflows?: {
      inventoryPurchases: number;
      operatingExpenses: number;
      taxes: number;
      other: number;
    };
    totalInflows?: number;
    totalOutflows?: number;
    netCashFlow?: number;
  };
}

export default function FinancialChart({ type, data }: FinancialChartProps) {
  if (type === 'profit-loss') {
    const profitGrowth = data.netProfit && data.revenue 
      ? ((data.netProfit / data.revenue) * 100) 
      : 0;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Analysis</CardTitle>
          <CardDescription>Financial performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Revenue vs Expenses */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{data.revenue?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Total Expenses</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    ₹{((data.costOfGoodsSold || 0) + (data.totalOperatingExpenses || 0)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Margin */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Profit Margin</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Net Profit Margin</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {data.profitMargin?.toFixed(1) || '0'}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Net Profit: ₹{data.netProfit?.toLocaleString() || '0'}
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cost of Goods Sold</span>
                  <span className="font-medium">₹{data.costOfGoodsSold?.toLocaleString() || '0'}</span>
                </div>
                {data.operatingExpenses && Object.entries(data.operatingExpenses).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm">{category}</span>
                    <span className="font-medium">₹{amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Operating Expenses</span>
                    <span>₹{data.totalOperatingExpenses?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'cash-flow') {
    const cashFlowGrowth = data.totalInflows && data.totalOutflows 
      ? ((data.totalInflows - data.totalOutflows) / data.totalInflows) * 100 
      : 0;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
          <CardDescription>Cash movement and liquidity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Cash Inflows */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Cash Inflows</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Customer Payments</span>
                  <span className="font-medium text-green-600">
                    ₹{data.inflows?.customerPayments.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cash Sales</span>
                  <span className="font-medium text-green-600">
                    ₹{data.inflows?.cashSales.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Inflows</span>
                    <span className="text-green-600">
                      ₹{data.totalInflows?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Outflows */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Cash Outflows</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inventory Purchases</span>
                  <span className="font-medium text-red-600">
                    ₹{data.outflows?.inventoryPurchases.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Operating Expenses</span>
                  <span className="font-medium text-red-600">
                    ₹{data.outflows?.operatingExpenses.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxes</span>
                  <span className="font-medium text-red-600">
                    ₹{data.outflows?.taxes.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Outflows</span>
                    <span className="text-red-600">
                      ₹{data.totalOutflows?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Cash Flow */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Net Cash Flow</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Net Cash Flow</span>
                </div>
                <div className={`text-2xl font-bold ${data.netCashFlow && data.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{data.netCashFlow?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {cashFlowGrowth >= 0 ? 'Positive' : 'Negative'} cash flow
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
} 