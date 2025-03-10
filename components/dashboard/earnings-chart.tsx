import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Payment {
  amount: number;
  created_at: string;
}

interface EarningsChartProps {
  data: Payment[];
}

export function EarningsChart({ data }: EarningsChartProps) {
  // Process data to group by month
  const monthlyData = data.reduce((acc: any[], payment) => {
    const date = new Date(payment.created_at);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    const existingMonth = acc.find(item => item.month === monthYear);
    if (existingMonth) {
      existingMonth.amount += payment.amount;
    } else {
      acc.push({
        month: monthYear,
        amount: payment.amount
      });
    }
    
    return acc;
  }, []).sort((a, b) => {
    const [monthA, yearA] = a.month.split('/');
    const [monthB, yearB] = b.month.split('/');
    return yearA === yearB ? Number(monthA) - Number(monthB) : Number(yearA) - Number(yearB);
  });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tickFormatter={(value) => {
              const [month, year] = value.split('/');
              return `${month}/${year.slice(-2)}`;
            }}
          />
          <YAxis 
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
            labelFormatter={(label) => {
              const [month, year] = label.split('/');
              return `${month}/${year}`;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 