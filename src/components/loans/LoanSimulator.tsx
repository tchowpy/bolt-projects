import { useState, useEffect } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

interface SimulationResult {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  schedule: {
    month: number;
    principal: number;
    interest: number;
    payment: number;
    balance: number;
  }[];
}

export function LoanSimulator() {
  const [formData, setFormData] = useState({
    principal: 1000000,
    interestRate: 12,
    durationMonths: 12,
    method: 'declining_balance',
  });

  const [result, setResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    calculateLoan();
  }, [formData]);

  const calculateLoan = () => {
    const { principal, interestRate, durationMonths, method } = formData;
    const monthlyRate = interestRate / 100 / 12;

    let schedule = [];
    let balance = principal;
    let totalInterest = 0;

    if (method === 'declining_balance') {
      const monthlyPayment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
        (Math.pow(1 + monthlyRate, durationMonths) - 1);

      for (let month = 1; month <= durationMonths; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        totalInterest += interestPayment;

        schedule.push({
          month,
          principal: principalPayment,
          interest: interestPayment,
          payment: monthlyPayment,
          balance: Math.max(0, balance),
        });
      }

      setResult({
        monthlyPayment,
        totalAmount: principal + totalInterest,
        totalInterest,
        schedule,
      });
    } else {
      const monthlyPrincipal = principal / durationMonths;

      for (let month = 1; month <= durationMonths; month++) {
        const interestPayment = balance * monthlyRate;
        const payment = monthlyPrincipal + interestPayment;
        balance -= monthlyPrincipal;
        totalInterest += interestPayment;

        schedule.push({
          month,
          principal: monthlyPrincipal,
          interest: interestPayment,
          payment,
          balance: Math.max(0, balance),
        });
      }

      setResult({
        monthlyPayment: schedule[0].payment,
        totalAmount: principal + totalInterest,
        totalInterest,
        schedule,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Loan Simulator</h2>
        <p className="text-gray-600 mt-1">Calculate loan repayment schedules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Loan Parameters</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principal Amount (CFA)
                </label>
                <input
                  type="number"
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interest Rate (% per year)
                </label>
                <input
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (months)
                </label>
                <input
                  type="number"
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calculation Method
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="declining_balance">Declining Balance</option>
                  <option value="flat_rate">Flat Rate</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {result && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ResultCard
                  label="Monthly Payment"
                  value={`${result.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })} CFA`}
                  color="text-blue-600"
                />
                <ResultCard
                  label="Total Interest"
                  value={`${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })} CFA`}
                  color="text-orange-600"
                />
                <ResultCard
                  label="Total Amount"
                  value={`${result.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} CFA`}
                  color="text-green-600"
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Repayment Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Principal</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Interest</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((item) => (
                        <tr key={item.month} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.month}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.principal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">
                            {item.payment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className={`w-5 h-5 ${color}`} />
        <h4 className="text-sm font-medium text-gray-600">{label}</h4>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
