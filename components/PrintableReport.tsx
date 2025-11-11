import React, { useMemo } from 'react';
import type { Transaction, Player, GameEvent, CompanyDetails } from '../types';

interface PrintableReportProps {
    transactions: Transaction[];
    metrics: {
        totalRevenue: number;
        expenses: number;
        netProfit: number;
    };
    filters: {
        timeFilterLabel: string;
        playerFilterLabel: string;
        eventFilterLabel: string;
        locationFilterLabel: string;
    };
    companyDetails: CompanyDetails;
    players: Player[];
    events: GameEvent[];
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
    transactions, metrics, filters, companyDetails, players, events
}) => {
    const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);
    
    return (
        <div id="printable-report" className="p-8 font-sans text-black bg-white">
            <header className="flex justify-between items-start pb-4 border-b-2 border-black">
                <div>
                    <h1 className="text-3xl font-bold">{companyDetails.name}</h1>
                    <h2 className="text-xl">Financial Report</h2>
                </div>
                {companyDetails.logoUrl && (
                    <img src={companyDetails.logoUrl} alt="Company Logo" className="h-16" />
                )}
            </header>

            <section className="my-6">
                <h3 className="text-lg font-bold mb-2">Report Summary</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div><strong>Date Range:</strong> {filters.timeFilterLabel}</div>
                    <div><strong>Player:</strong> {filters.playerFilterLabel}</div>
                    <div><strong>Event:</strong> {filters.eventFilterLabel}</div>
                    <div><strong>Location:</strong> {filters.locationFilterLabel}</div>
                </div>

                <div className="flex justify-around mt-6 text-center border-t border-b border-gray-300 py-4">
                    <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-700">R {metrics.totalRevenue.toFixed(2)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-600">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-700">R {metrics.expenses.toFixed(2)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-600">Net Profit</p>
                        <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-black' : 'text-red-700'}`}>R {metrics.netProfit.toFixed(2)}</p>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-bold mb-2">Transaction Details</h3>
                <table className="w-full text-left text-sm table-auto">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                        <tr>
                            <th className="p-2">Date</th>
                            <th className="p-2">Description</th>
                            <th className="p-2">Player</th>
                            <th className="p-2">Type</th>
                            <th className="p-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id} className="border-b border-gray-200">
                                <td className="p-2">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="p-2">{t.description}</td>
                                <td className="p-2">{playerMap.get(t.relatedPlayerId || '')?.name || 'N/A'}</td>
                                <td className="p-2">{t.type}</td>
                                <td className={`p-2 text-right font-mono ${t.type === 'Expense' ? 'text-red-600' : 'text-green-600'}`}>
                                    {t.type === 'Expense' ? '-' : ''}R {t.amount.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {transactions.length === 0 && <p className="text-center text-gray-500 py-4">No transactions found for the selected filters.</p>}
            </section>
            
            <footer className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                <p>Report generated on {new Date().toLocaleString()}.</p>
            </footer>
        </div>
    );
};