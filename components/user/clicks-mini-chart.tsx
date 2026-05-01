'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type ClickData = {
  date: string
  clicks: number
}

type ClicksMiniChartProps = {
  data: ClickData[]
}

export function ClicksMiniChart({ data }: ClicksMiniChartProps) {
  return (
    <Card className="p-3 sm:p-4 lg:p-6">
      <CardHeader className="p-0">
        <CardTitle className="text-xs sm:text-base">Klik 7 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[160px] sm:h-[200px] overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                formatter={(value: number) => [`${value} klik`, 'Klik']}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#clicksGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
