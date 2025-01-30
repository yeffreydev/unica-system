// components/Dashboard.tsx

import { Card, CardHeader, CardContent } from "@/components/ui/card"; // Example ShadCN components

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Data Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <h2 className="text-xl font-semibold">Data Overview</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>Total Assets</p>
              <h3 className="text-2xl font-bold">$1,000,000</h3>
            </div>
            <div>
              <p>Total Liabilities</p>
              <h3 className="text-2xl font-bold">$500,000</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incomes Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <h2 className="text-xl font-semibold">Incomes</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>Savings</p>
              <h3 className="text-2xl font-bold">$200,000</h3>
            </div>
            <div>
              <p>Stocks</p>
              <h3 className="text-2xl font-bold">$100,000</h3>
            </div>
            <div>
              <p>Capital Payments</p>
              <h3 className="text-2xl font-bold">$50,000</h3>
            </div>
            <div>
              <p>Interests</p>
              <h3 className="text-2xl font-bold">$25,000</h3>
            </div>
            <div>
              <p>Others</p>
              <h3 className="text-2xl font-bold">$15,000</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <h2 className="text-xl font-semibold">Expenses</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>Withdrawals</p>
              <h3 className="text-2xl font-bold">$50,000</h3>
            </div>
            <div>
              <p>Loans</p>
              <h3 className="text-2xl font-bold">$30,000</h3>
            </div>
            <div>
              <p>Administrative Expenses</p>
              <h3 className="text-2xl font-bold">$20,000</h3>
            </div>
            <div>
              <p>Dividends</p>
              <h3 className="text-2xl font-bold">$10,000</h3>
            </div>
            <div>
              <p>Others</p>
              <h3 className="text-2xl font-bold">$5,000</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
