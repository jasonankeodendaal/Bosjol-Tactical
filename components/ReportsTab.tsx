import React from 'react';
import type { GameEvent, InventoryItem } from '../types';
import { DashboardCard } from './DashboardCard';
import { CurrencyDollarIcon, ArchiveBoxIcon } from './icons/Icons';

interface ReportsTabProps {
    events: GameEvent[];
    inventory: InventoryItem[];
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ events, inventory }) => {
    // Financial calculations
    const completedEvents = events.filter(e => e.status === 'Completed');
    const totalRevenue = completedEvents.reduce((total, event) => {
        const eventRevenue = event.attendees
            .filter(a => a.paymentStatus.startsWith('Paid'))
            .reduce((sum) => sum + event.gameFee, 0);
        return total + eventRevenue;
    }, 0);

    // Inventory calculations
    const rentalItems = inventory.filter(i => i.isRental);
    const rentalCounts = rentalItems.reduce((acc, item) => {
        acc[item.id] = 0;
        return acc;
    }, {} as Record<string, number>);

    completedEvents.forEach(event => {
        event.attendees.forEach(attendee => {
            if (attendee.rentedGearIds) {
                attendee.rentedGearIds.forEach(gearId => {
                    if (rentalCounts.hasOwnProperty(gearId)) {
                        rentalCounts[gearId]++;
                    }
                });
            }
        });
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard title="Financial Summary" icon={<CurrencyDollarIcon className="w-6 h-6" />}>
                <div className="p-6">
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-400">Total Revenue from Completed Events</p>
                        <p className="text-4xl font-bold text-green-400">R{totalRevenue.toFixed(2)}</p>
                    </div>
                    <h4 className="font-bold text-gray-200 mb-3">Revenue Breakdown per Event</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {completedEvents.length > 0 ? completedEvents.map(event => {
                            const eventRevenue = event.attendees
                                .filter(a => a.paymentStatus.startsWith('Paid'))
                                .reduce((sum) => sum + event.gameFee, 0);
                            return (
                                <div key={event.id} className="bg-zinc-800/50 p-3 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-white">{event.title}</p>
                                        <p className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="font-bold text-green-400">R{eventRevenue.toFixed(2)}</p>
                                </div>
                            );
                        }) : (
                            <p className="text-center text-gray-500 py-4">No completed events with payment data.</p>
                        )}
                    </div>
                </div>
            </DashboardCard>
            <DashboardCard title="Inventory Usage Report" icon={<ArchiveBoxIcon className="w-6 h-6" />}>
                 <div className="p-6">
                    <h4 className="font-bold text-gray-200 mb-3">Rental Fleet Usage</h4>
                    <div className="space-y-2 max-h-[28rem] overflow-y-auto">
                        {rentalItems.length > 0 ? rentalItems.sort((a,b) => rentalCounts[b.id] - rentalCounts[a.id]).map(item => (
                             <div key={item.id} className="bg-zinc-800/50 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-white">{item.name}</p>
                                    <p className="text-xs text-gray-400">{item.category}</p>
                                </div>
                                <p className="font-bold text-amber-300">{rentalCounts[item.id]} times rented</p>
                            </div>
                        )) : (
                             <p className="text-center text-gray-500 py-4">No rental items in inventory.</p>
                        )}
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};
