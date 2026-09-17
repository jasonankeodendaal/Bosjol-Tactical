import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Shield, 
    Crosshair, 
    Check, 
    CheckCircle2, 
    AlertCircle, 
    AlertTriangle, 
    Users, 
    Package, 
    Search, 
    Printer, 
    Copy, 
    Download,
    Calendar, 
    Clock, 
    MapPin, 
    FileText, 
    Filter,
    Layers,
    Receipt,
    HelpCircle
} from 'lucide-react';
import type { GameEvent, Player, Signup, InventoryItem, PaymentStatus, EventAttendee } from '../types';
import { Button } from './Button';

export interface EquipmentRentalsSummaryModalProps {
    event: GameEvent;
    player?: Player | null;
    players?: Player[];
    signups?: Signup[];
    inventory?: InventoryItem[];
    onClose: () => void;
    isAdmin?: boolean;
    initialTab?: 'my-gear' | 'admin-manifest';
    selectedGearIds?: string[]; // Currently picked gear in form (if not yet confirmed)
    operatorNote?: string;
}

interface NormalizedOperatorRental {
    playerId: string;
    player?: Player;
    gearIds: string[];
    status: 'Checked In' | 'Signed Up' | 'Current Selection';
    paymentStatus?: PaymentStatus;
    note?: string;
    totalGearCost: number;
}

export const EquipmentRentalsSummaryModal: React.FC<EquipmentRentalsSummaryModalProps> = ({
    event,
    player,
    players = [],
    signups = [],
    inventory = [],
    onClose,
    isAdmin = false,
    initialTab,
    selectedGearIds,
    operatorNote = ''
}) => {
    // Determine active tab: if user is admin and player is not set or requested, default to 'admin-manifest'
    const [activeTab, setActiveTab] = useState<'my-gear' | 'admin-manifest'>(
        initialTab || (isAdmin && !player ? 'admin-manifest' : 'my-gear')
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
    const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

    // Map of inventory by ID for fast lookup
    const inventoryMap = useMemo(() => {
        return new Map<string, InventoryItem>(inventory.map(item => [item.id, item]));
    }, [inventory]);

    // Function to calculate rental price for an item in this event
    const getItemRentalPrice = (itemId: string): number => {
        if (event.rentalPriceOverrides?.[itemId] !== undefined) {
            return event.rentalPriceOverrides[itemId];
        }
        const item = inventoryMap.get(itemId);
        return item?.salePrice || 0;
    };

    // Helper to get item details
    const getItemDetails = (itemId: string) => {
        const item = inventoryMap.get(itemId);
        const price = getItemRentalPrice(itemId);
        return {
            id: itemId,
            name: item?.name || `Gear Item (${itemId})`,
            category: item?.category || 'Equipment',
            price,
            stock: item?.stock ?? 1,
            imageUrl: item?.imageUrl
        };
    };

    // Find current player's confirmed or active signup
    const playerSignup = useMemo(() => {
        if (!player) return null;
        return signups.find(s => s.eventId === event.id && s.playerId === player.id);
    }, [signups, event.id, player]);

    // Find current player's attendee record if checked in
    const playerAttendee = useMemo(() => {
        if (!player || !event.attendees) return null;
        return event.attendees.find(a => a.playerId === player.id);
    }, [event.attendees, player]);

    // Determine current player's active gear IDs:
    // 1. If currently editing selection, use selectedGearIds
    // 2. Else if checked in attendee, use attendee.rentedGearIds
    // 3. Else if signup exists, use signup.requestedGearIds
    // 4. Else empty array
    const playerGearIds = useMemo(() => {
        if (selectedGearIds && selectedGearIds.length > 0) {
            return selectedGearIds;
        }
        if (playerAttendee?.rentedGearIds && playerAttendee.rentedGearIds.length > 0) {
            return playerAttendee.rentedGearIds;
        }
        if (playerSignup?.requestedGearIds && playerSignup.requestedGearIds.length > 0) {
            return playerSignup.requestedGearIds;
        }
        return [];
    }, [selectedGearIds, playerAttendee, playerSignup]);

    const playerStatus = useMemo(() => {
        if (playerAttendee) return 'Checked In & Issued';
        if (playerSignup) return 'Confirmed Reservation';
        if (selectedGearIds && selectedGearIds.length > 0) return 'Pending Confirmation';
        return 'Not Reserved';
    }, [playerAttendee, playerSignup, selectedGearIds]);

    // Current player's reserved items list
    const playerReservedItems = useMemo(() => {
        return playerGearIds.map(id => getItemDetails(id));
    }, [playerGearIds, inventoryMap, event]);

    const playerTotalGearCost = useMemo(() => {
        return playerReservedItems.reduce((sum, item) => sum + item.price, 0);
    }, [playerReservedItems]);

    const playerGrandTotal = useMemo(() => {
        return event.gameFee + playerTotalGearCost;
    }, [event.gameFee, playerTotalGearCost]);

    // --- Admin: Aggregate all operators who rented gear ---
    const allOperatorRentals = useMemo(() => {
        const records: NormalizedOperatorRental[] = [];
        const seenPlayerIds = new Set<string>();

        // 1. First add from checked-in attendees
        (event.attendees || []).forEach(attendee => {
            const gear = attendee.rentedGearIds || [];
            if (gear.length > 0 || attendee.paymentStatus) {
                seenPlayerIds.add(attendee.playerId);
                const foundPlayer = players.find(p => p.id === attendee.playerId);
                const gearCost = gear.reduce((sum, id) => sum + getItemRentalPrice(id), 0);
                records.push({
                    playerId: attendee.playerId,
                    player: foundPlayer,
                    gearIds: gear,
                    status: 'Checked In',
                    paymentStatus: attendee.paymentStatus,
                    note: attendee.note,
                    totalGearCost: gearCost
                });
            }
        });

        // 2. Add from signups who are not yet checked in
        const eventSignups = signups.filter(s => s.eventId === event.id);
        eventSignups.forEach(signup => {
            if (!seenPlayerIds.has(signup.playerId)) {
                const gear = signup.requestedGearIds || [];
                if (gear.length > 0) {
                    seenPlayerIds.add(signup.playerId);
                    const foundPlayer = players.find(p => p.id === signup.playerId);
                    const gearCost = gear.reduce((sum, id) => sum + getItemRentalPrice(id), 0);
                    records.push({
                        playerId: signup.playerId,
                        player: foundPlayer,
                        gearIds: gear,
                        status: 'Signed Up',
                        paymentStatus: 'Unpaid',
                        note: signup.note,
                        totalGearCost: gearCost
                    });
                }
            }
        });

        // 3. If currently previewing as a player who hasn't submitted yet but picked gear
        if (player && selectedGearIds && selectedGearIds.length > 0 && !seenPlayerIds.has(player.id)) {
            const gearCost = selectedGearIds.reduce((sum, id) => sum + getItemRentalPrice(id), 0);
            records.push({
                playerId: player.id,
                player: player,
                gearIds: selectedGearIds,
                status: 'Current Selection',
                paymentStatus: 'Unpaid',
                note: operatorNote,
                totalGearCost: gearCost
            });
        }

        return records;
    }, [event.attendees, signups, event.id, players, player, selectedGearIds, operatorNote, inventoryMap]);

    // --- Admin: Item-by-item aggregated manifest ---
    const aggregatedGearSummary = useMemo(() => {
        const itemCounts: Record<string, { count: number; renterNames: string[] }> = {};

        allOperatorRentals.forEach(record => {
            const name = record.player?.callsign || record.player?.name || 'Operator';
            record.gearIds.forEach(gearId => {
                if (!itemCounts[gearId]) {
                    itemCounts[gearId] = { count: 0, renterNames: [] };
                }
                itemCounts[gearId].count += 1;
                itemCounts[gearId].renterNames.push(name);
            });
        });

        // Convert to detailed list
        const items = Object.entries(itemCounts).map(([gearId, data]) => {
            const details = getItemDetails(gearId);
            const remaining = Math.max(0, details.stock - data.count);
            const totalRevenue = details.price * data.count;
            return {
                ...details,
                reservedCount: data.count,
                renterNames: data.renterNames,
                remainingStock: remaining,
                totalRevenue
            };
        });

        // Also add any gear items specified in event.gearForRent that have 0 rentals yet
        (event.gearForRent || []).forEach(gearId => {
            if (!itemCounts[gearId]) {
                const details = getItemDetails(gearId);
                items.push({
                    ...details,
                    reservedCount: 0,
                    renterNames: [],
                    remainingStock: details.stock,
                    totalRevenue: 0
                });
            }
        });

        return items.sort((a, b) => b.reservedCount - a.reservedCount || a.name.localeCompare(b.name));
    }, [allOperatorRentals, event.gearForRent, inventoryMap]);

    // Totals for Admin
    const totalItemsRentedCount = useMemo(() => {
        return allOperatorRentals.reduce((sum, r) => sum + r.gearIds.length, 0);
    }, [allOperatorRentals]);

    const totalRentingOperatorsCount = useMemo(() => {
        return allOperatorRentals.filter(r => r.gearIds.length > 0).length;
    }, [allOperatorRentals]);

    const totalRentalRevenue = useMemo(() => {
        return allOperatorRentals.reduce((sum, r) => sum + r.totalGearCost, 0);
    }, [allOperatorRentals]);

    // Filtered operators for Admin View
    const filteredOperators = useMemo(() => {
        return allOperatorRentals.filter(record => {
            const nameMatch = (record.player?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (record.player?.callsign || '').toLowerCase().includes(searchQuery.toLowerCase());
            
            if (!nameMatch) {
                // Check if any rented item matches search query
                const hasItemMatch = record.gearIds.some(id => {
                    const item = inventoryMap.get(id);
                    return item?.name.toLowerCase().includes(searchQuery.toLowerCase());
                });
                if (!hasItemMatch) return false;
            }

            if (selectedCategoryFilter === 'all') return true;
            if (selectedCategoryFilter === 'checked-in') return record.status === 'Checked In';
            if (selectedCategoryFilter === 'signed-up') return record.status === 'Signed Up' || record.status === 'Current Selection';
            if (selectedCategoryFilter === 'unpaid') return record.paymentStatus === 'Unpaid';
            if (selectedCategoryFilter === 'paid') return record.paymentStatus && record.paymentStatus !== 'Unpaid';
            return true;
        });
    }, [allOperatorRentals, searchQuery, selectedCategoryFilter, inventoryMap]);

    // Copy to clipboard handlers
    const copyPlayerSummary = () => {
        const text = [
            `📋 EQUIPMENT RENTAL RESERVATION - ${event.title}`,
            `Operator: ${player?.callsign || player?.name || 'Operator'} (${player?.playerCode || 'ID'})`,
            `Date: ${new Date(event.date).toLocaleDateString()} @ ${event.startTime}`,
            `Location: ${event.location}`,
            `Status: ${playerStatus}`,
            `-------------------------------------------`,
            `RESERVED EQUIPMENT:`,
            ...playerReservedItems.map(item => `• ${item.name} (${item.category}) - R${item.price.toFixed(2)}`),
            `-------------------------------------------`,
            `Equipment Rental Subtotal: R${playerTotalGearCost.toFixed(2)}`,
            `Field Entry Fee: R${event.gameFee.toFixed(2)}`,
            `GRAND TOTAL DUE ON-SITE: R${playerGrandTotal.toFixed(2)}`,
            operatorNote ? `Note to Armory: ${operatorNote}` : '',
            `-------------------------------------------`,
            `Armory Instructions: Arrive 15 min early. Collect gear at the Armory desk upon check-in.`
        ].filter(Boolean).join('\n');

        navigator.clipboard.writeText(text);
        setCopiedNotification('Reserved gear summary copied to clipboard!');
        setTimeout(() => setCopiedNotification(null), 3000);
    };

    const copyAdminManifest = () => {
        const text = [
            `📋 ARMORY RENTAL MANIFEST - ${event.title}`,
            `Date: ${new Date(event.date).toLocaleDateString()} @ ${event.startTime}`,
            `Location: ${event.location}`,
            `Total Rented Items: ${totalItemsRentedCount} | Operators: ${totalRentingOperatorsCount}`,
            `Projected Rental Revenue: R${totalRentalRevenue.toFixed(2)}`,
            `===========================================`,
            `INVENTORY BREAKDOWN:`,
            ...aggregatedGearSummary.map(item => `[${item.reservedCount} Reserved / ${item.stock} Total] ${item.name} (R${item.price} ea) -> R${item.totalRevenue.toFixed(2)}`),
            `===========================================`,
            `OPERATOR ROSTER:`,
            ...allOperatorRentals.map(op => {
                const itemsStr = op.gearIds.map(id => getItemDetails(id).name).join(', ');
                return `• ${op.player?.callsign || op.player?.name || 'Operator'} [${op.status} - ${op.paymentStatus || 'Unpaid'}]: ${itemsStr} (Total R${op.totalGearCost.toFixed(2)})${op.note ? ` - Note: "${op.note}"` : ''}`;
            })
        ].join('\n');

        navigator.clipboard.writeText(text);
        setCopiedNotification('Full armory manifest copied to clipboard!');
        setTimeout(() => setCopiedNotification(null), 3000);
    };

    // State for printing
    const [printingMode, setPrintingMode] = useState<'receipt' | 'manifest' | null>(null);

    const downloadTextFile = (filename: string, content: string) => {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    };

    const handleSavePlayerReceipt = () => {
        const text = [
            `================================================================`,
            `           BOSJOL AIRSOFT - EQUIPMENT RENTAL RECEIPT            `,
            `================================================================`,
            `Operator:     ${player?.callsign || player?.name || 'Operator'} (${player?.playerCode || 'ID'})`,
            `Event:        ${event.title}`,
            `Date & Time:  ${new Date(event.date).toLocaleDateString()} @ ${event.startTime || 'TBD'}`,
            `Location:     ${event.location}`,
            `Status:       ${playerStatus}`,
            `----------------------------------------------------------------`,
            `RESERVED EQUIPMENT:`,
            ...(playerReservedItems.length > 0 
                ? playerReservedItems.map((item, idx) => `  ${idx + 1}. ${item.name.padEnd(35)} [${item.category}]   R${item.price.toFixed(2)}`)
                : ['  No rental gear reserved (Playing with personal equipment)']),
            `----------------------------------------------------------------`,
            `FINANCIAL BREAKDOWN:`,
            `  Equipment Rentals Subtotal:        R${playerTotalGearCost.toFixed(2)}`,
            `  Field Match Entry Fee:             R${event.gameFee.toFixed(2)}`,
            `  --------------------------------------------------------------`,
            `  GRAND TOTAL DUE AT REGISTRATION:   R${playerGrandTotal.toFixed(2)}`,
            `----------------------------------------------------------------`,
            operatorNote ? `Note to Armory: "${operatorNote}"\n----------------------------------------------------------------` : '',
            `ARMORY PROTOCOL:`,
            `  1. Arrive 15 minutes before mission briefing.`,
            `  2. Present this receipt or your Player Pass at the Armory Desk.`,
            `  3. Chronograph inspection required prior to staging entry.`,
            `  4. Return all replicas and safety equipment at match conclusion.`,
            `================================================================`,
            `Generated on: ${new Date().toLocaleString()}`,
            `Bosjol Tactical Operations System`
        ].filter(Boolean).join('\n');

        const cleanName = (player?.callsign || player?.name || 'Operator').replace(/[^a-zA-Z0-9_-]/g, '_');
        downloadTextFile(`Equipment_Rental_Receipt_${cleanName}_${event.date}.txt`, text);
    };

    const handleSaveAdminManifest = () => {
        const text = [
            `================================================================================`,
            `                     BOSJOL AIRSOFT - ARMORY RENTAL MANIFEST                    `,
            `================================================================================`,
            `Event:        ${event.title}`,
            `Date & Time:  ${new Date(event.date).toLocaleDateString()} @ ${event.startTime || 'TBD'}`,
            `Location:     ${event.location}`,
            `--------------------------------------------------------------------------------`,
            `EXECUTIVE SUMMARY:`,
            `  Total Rented Gear Units:     ${totalItemsRentedCount}`,
            `  Operators Renting Gear:      ${totalRentingOperatorsCount}`,
            `  Projected Rental Revenue:    R${totalRentalRevenue.toFixed(2)}`,
            `--------------------------------------------------------------------------------`,
            `INVENTORY ALLOCATION BREAKDOWN:`,
            `  ${'Equipment'.padEnd(32)} ${'Reserved'.padEnd(10)} ${'Total Stock'.padEnd(12)} ${'Remaining'.padEnd(10)} ${'Unit Price'.padEnd(12)} Revenue`,
            `  ${'-'.repeat(78)}`,
            ...aggregatedGearSummary.map(item => {
                return `  ${item.name.slice(0, 30).padEnd(32)} ${String(item.reservedCount).padEnd(10)} ${String(item.stock).padEnd(12)} ${String(item.remainingStock).padEnd(10)} R${item.price.toFixed(2).padEnd(11)} R${item.totalRevenue.toFixed(2)}`;
            }),
            `--------------------------------------------------------------------------------`,
            `OPERATOR ALLOCATION ROSTER:`,
            `  ${'Operator / Callsign'.padEnd(25)} ${'Status'.padEnd(14)} ${'Payment'.padEnd(10)} Items Reserved`,
            `  ${'-'.repeat(78)}`,
            ...allOperatorRentals.map(op => {
                const name = (op.player?.callsign || op.player?.name || 'Operator').slice(0, 23);
                const itemsStr = op.gearIds.map(id => getItemDetails(id).name).join(', ') || 'None';
                return `  ${name.padEnd(25)} ${op.status.padEnd(14)} ${(op.paymentStatus || 'Unpaid').padEnd(10)} ${itemsStr} (R${op.totalGearCost.toFixed(2)})${op.note ? ` [Note: ${op.note}]` : ''}`;
            }),
            `================================================================================`,
            `Field Marshal Sign-off: ________________________   Date: ________________________`,
            `Armory Officer Sign-off: _______________________   Date: ________________________`,
            `Generated on: ${new Date().toLocaleString()}`,
            `Bosjol Tactical Operations System`
        ].join('\n');

        const cleanTitle = event.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        downloadTextFile(`Armory_Rental_Manifest_${cleanTitle}_${event.date}.txt`, text);
    };

    const handlePrintReceipt = () => {
        setPrintingMode('receipt');
        document.body.classList.add('printing-report');
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                setPrintingMode(null);
                document.body.classList.remove('printing-report');
            }, 800);
        }, 200);
    };

    const handlePrintManifest = () => {
        setPrintingMode('manifest');
        document.body.classList.add('printing-report');
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                setPrintingMode(null);
                document.body.classList.remove('printing-report');
            }, 800);
        }, 200);
    };

    const printableReceipt = (
        <div id="printable-report" className="p-8 font-sans text-black bg-white max-w-3xl mx-auto border-2 border-black">
            <div className="border-b-4 border-black pb-4 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider">Bosjol Airsoft</h1>
                    <h2 className="text-xl font-bold uppercase mt-1">Equipment Rental Receipt</h2>
                    <p className="text-sm text-gray-700 mt-1">Tactical Battlefield Armory Division</p>
                </div>
                <div className="text-right text-xs">
                    <span className="block font-mono font-bold text-sm">RECEIPT #{event.id.slice(0, 6).toUpperCase()}</span>
                    <span className="block text-gray-600">Date: {new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6 text-sm">
                <div className="p-3 border border-gray-300 rounded bg-gray-50">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-1">Operator Info</h3>
                    <p className="font-bold text-base">{player?.callsign || player?.name || 'Operator'}</p>
                    <p className="text-xs text-gray-700">Player ID: {player?.playerCode || player?.id?.slice(0, 8) || 'N/A'}</p>
                    <p className="text-xs mt-1"><strong>Reservation Status:</strong> {playerStatus}</p>
                </div>
                <div className="p-3 border border-gray-300 rounded bg-gray-50">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-1">Event Details</h3>
                    <p className="font-bold text-base">{event.title}</p>
                    <p className="text-xs text-gray-700">{new Date(event.date).toLocaleDateString()} @ {event.startTime || 'TBD'}</p>
                    <p className="text-xs mt-1"><strong>Location:</strong> {event.location}</p>
                </div>
            </div>

            <div className="my-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Reserved Equipment Breakdown</h3>
                <table className="w-full text-left text-sm border border-collapse border-black">
                    <thead className="bg-gray-100 border-b-2 border-black">
                        <tr>
                            <th className="p-2 border border-black">#</th>
                            <th className="p-2 border border-black">Equipment Name</th>
                            <th className="p-2 border border-black">Category</th>
                            <th className="p-2 border border-black text-right">Rental Fee</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerReservedItems.length > 0 ? (
                            playerReservedItems.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-300">
                                    <td className="p-2 border border-black text-center">{idx + 1}</td>
                                    <td className="p-2 border border-black font-semibold">{item.name}</td>
                                    <td className="p-2 border border-black">{item.category}</td>
                                    <td className="p-2 border border-black text-right font-mono">R{item.price.toFixed(2)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500 italic border border-black">
                                    No rental equipment selected (Personal gear in use)
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end my-6">
                <div className="w-72 space-y-1.5 text-sm">
                    <div className="flex justify-between py-1 border-b border-gray-300">
                        <span>Equipment Rental Subtotal:</span>
                        <span className="font-mono font-bold">R{playerTotalGearCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-300">
                        <span>Field Entry Fee:</span>
                        <span className="font-mono font-bold">R{event.gameFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b-2 border-black text-base font-black">
                        <span>Total Due At Desk:</span>
                        <span className="font-mono text-lg">R{playerGrandTotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {operatorNote && (
                <div className="p-3 border border-gray-300 rounded bg-gray-50 my-4 text-xs">
                    <strong>Special Armory Note:</strong> <em>"{operatorNote}"</em>
                </div>
            )}

            <div className="mt-8 border-t-2 border-black pt-4">
                <h4 className="font-bold text-xs uppercase tracking-wider mb-2">Armory Marshal Inspection & Check-off</h4>
                <div className="grid grid-cols-4 gap-2 text-xs text-center border border-black p-3 bg-gray-50">
                    <div>[ ] Gear Issued</div>
                    <div>[ ] Chrono Passed (____ FPS)</div>
                    <div>[ ] Eye Pro Verified</div>
                    <div>[ ] Gear Returned</div>
                </div>
                <div className="grid grid-cols-2 gap-8 mt-6 text-xs">
                    <div className="border-t border-black pt-2">
                        <span>Operator Signature: _______________________</span>
                    </div>
                    <div className="border-t border-black pt-2 text-right">
                        <span>Armory Marshal: _______________________</span>
                    </div>
                </div>
            </div>

            <div className="text-[10px] text-gray-500 mt-6 text-center">
                Printed on {new Date().toLocaleString()} • Bosjol Airsoft Operations System
            </div>
        </div>
    );

    const printableManifest = (
        <div id="printable-report" className="p-8 font-sans text-black bg-white max-w-4xl mx-auto border-2 border-black">
            <div className="border-b-4 border-black pb-4 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider">Bosjol Airsoft</h1>
                    <h2 className="text-xl font-bold uppercase mt-1">Armory Equipment Manifest</h2>
                    <p className="text-sm text-gray-700 mt-1">Official Event Logistics & Armory Allocation</p>
                </div>
                <div className="text-right text-xs">
                    <span className="block font-mono font-bold text-sm">EVENT #{event.id.slice(0, 8).toUpperCase()}</span>
                    <span className="block text-gray-600">Printed: {new Date().toLocaleDateString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 my-6 text-center text-sm border-2 border-black p-3 bg-gray-50">
                <div>
                    <span className="text-xs text-gray-600 block uppercase font-bold">Total Rented Units</span>
                    <span className="text-2xl font-black">{totalItemsRentedCount}</span>
                </div>
                <div>
                    <span className="text-xs text-gray-600 block uppercase font-bold">Renting Operators</span>
                    <span className="text-2xl font-black">{totalRentingOperatorsCount}</span>
                </div>
                <div>
                    <span className="text-xs text-gray-600 block uppercase font-bold">Projected Revenue</span>
                    <span className="text-2xl font-black">R{totalRentalRevenue.toFixed(2)}</span>
                </div>
                <div>
                    <span className="text-xs text-gray-600 block uppercase font-bold">Event Date</span>
                    <span className="text-base font-bold">{new Date(event.date).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="my-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2">1. Inventory Allocation Summary</h3>
                <table className="w-full text-left text-xs border border-collapse border-black">
                    <thead className="bg-gray-100 border-b-2 border-black">
                        <tr>
                            <th className="p-1.5 border border-black">Equipment Name</th>
                            <th className="p-1.5 border border-black">Category</th>
                            <th className="p-1.5 border border-black text-center">Reserved</th>
                            <th className="p-1.5 border border-black text-center">Stock</th>
                            <th className="p-1.5 border border-black text-center">Remaining</th>
                            <th className="p-1.5 border border-black text-right">Unit Price</th>
                            <th className="p-1.5 border border-black text-right">Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregatedGearSummary.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-300">
                                <td className="p-1.5 border border-black font-semibold">{item.name}</td>
                                <td className="p-1.5 border border-black">{item.category}</td>
                                <td className="p-1.5 border border-black text-center font-bold">{item.reservedCount}</td>
                                <td className="p-1.5 border border-black text-center">{item.stock}</td>
                                <td className="p-1.5 border border-black text-center font-semibold">{item.remainingStock}</td>
                                <td className="p-1.5 border border-black text-right font-mono">R{item.price.toFixed(2)}</td>
                                <td className="p-1.5 border border-black text-right font-mono font-bold">R{item.totalRevenue.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="my-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2">2. Operator Roster & Gear Allocation</h3>
                <table className="w-full text-left text-xs border border-collapse border-black">
                    <thead className="bg-gray-100 border-b-2 border-black">
                        <tr>
                            <th className="p-1.5 border border-black">Operator</th>
                            <th className="p-1.5 border border-black">Status</th>
                            <th className="p-1.5 border border-black">Payment</th>
                            <th className="p-1.5 border border-black">Rented Equipment</th>
                            <th className="p-1.5 border border-black text-right">Gear Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allOperatorRentals.map((op, idx) => {
                            const itemsStr = op.gearIds.map(id => getItemDetails(id).name).join(', ') || 'None';
                            return (
                                <tr key={idx} className="border-b border-gray-300">
                                    <td className="p-1.5 border border-black font-bold">
                                        {op.player?.callsign || op.player?.name || 'Operator'}
                                    </td>
                                    <td className="p-1.5 border border-black">{op.status}</td>
                                    <td className="p-1.5 border border-black font-semibold">{op.paymentStatus || 'Unpaid'}</td>
                                    <td className="p-1.5 border border-black">
                                        {itemsStr}
                                        {op.note && <span className="block text-[10px] text-gray-600 italic">Note: {op.note}</span>}
                                    </td>
                                    <td className="p-1.5 border border-black text-right font-mono font-bold">
                                        R{op.totalGearCost.toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 border-t-2 border-black pt-4">
                <div className="grid grid-cols-2 gap-8 text-xs">
                    <div className="border-t border-black pt-2">
                        <span>Field Marshal: _______________________ Date: _________</span>
                    </div>
                    <div className="border-t border-black pt-2 text-right">
                        <span>Armory Officer: _______________________ Date: _________</span>
                    </div>
                </div>
            </div>

            <div className="text-[10px] text-gray-500 mt-6 text-center">
                Printed on {new Date().toLocaleString()} • Bosjol Airsoft Operations System
            </div>
        </div>
    );

    const modalContent = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[99999] w-full h-[100dvh] bg-zinc-950 flex flex-col overflow-hidden text-zinc-100"
        >
            {/* Header with Title & Tab Navigation */}
            <div className="px-3 py-2.5 sm:px-6 sm:py-3.5 border-b border-white/10 bg-zinc-900/95 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shrink-0">
                <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0 w-full sm:w-auto">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                            <Crosshair className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <h2 className="text-xs sm:text-base font-black uppercase tracking-wider text-white truncate">
                                    Equipment Rentals Summary
                                </h2>
                                <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase bg-white/[0.06] text-zinc-300 border border-white/10 shrink-0">
                                    {event.theme || 'Tactical Skirmish'}
                                </span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate max-w-[220px] sm:max-w-md">
                                {event.title} • {new Date(event.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Mobile Close Button on top row */}
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:hidden rounded-xl bg-white/[0.05] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors shrink-0"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    {/* Tab Switcher - full width on mobile for easy tapping */}
                    <div className="flex bg-black/60 p-1 rounded-xl border border-white/10 text-xs w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('my-gear')}
                            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 text-center ${
                                activeTab === 'my-gear'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <Receipt className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">My Gear</span>
                            {playerReservedItems.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono shrink-0">
                                    {playerReservedItems.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('admin-manifest')}
                            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 text-center ${
                                activeTab === 'admin-manifest'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Manifest {isAdmin ? '(Admin)' : ''}</span>
                            {totalItemsRentedCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono shrink-0">
                                    {totalItemsRentedCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Desktop Close Button */}
                    <button
                        onClick={onClose}
                        className="hidden sm:flex p-1.5 rounded-xl bg-white/[0.05] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors shrink-0"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Copied Notification Toast */}
            <AnimatePresence>
                {copiedNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-emerald-400"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{copiedNotification}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Tab Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
                    {/* TAB 1: PLAYER RESERVED GEAR VERIFICATION */}
                    {activeTab === 'my-gear' && (
                        <div className="space-y-6">
                            {/* Operator Status Banner */}
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono uppercase text-zinc-400">Operator:</span>
                                        <span className="text-sm sm:text-base font-black text-white">
                                            {player?.callsign || player?.name || 'Guest Operator'}
                                        </span>
                                        {player?.playerCode && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
                                                {player.playerCode}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono flex-wrap">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-red-400" />
                                            <span>{new Date(event.date).toLocaleDateString()}</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                                            <span>{event.startTime}</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="truncate max-w-[150px]">{event.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                                        playerStatus === 'Checked In & Issued' 
                                            ? 'bg-blue-950/60 text-blue-400 border-blue-500/40'
                                            : playerStatus === 'Confirmed Reservation'
                                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                                                : playerReservedItems.length > 0
                                                    ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                                                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700'
                                    }`}>
                                        {playerStatus === 'Confirmed Reservation' && <CheckCircle2 className="w-4 h-4" />}
                                        {playerStatus === 'Checked In & Issued' && <Shield className="w-4 h-4" />}
                                        {playerStatus === 'Pending Confirmation' && <AlertCircle className="w-4 h-4" />}
                                        <span>{playerStatus}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Reserved Items Breakdown */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-red-400" />
                                        <span>Reserved Equipment List ({playerReservedItems.length} items)</span>
                                    </h3>
                                    <span className="text-[11px] font-mono text-zinc-400">
                                        Armory Verification
                                    </span>
                                </div>

                                {playerReservedItems.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                        {playerReservedItems.map((item, index) => {
                                            const isGun = item.category.toLowerCase().includes('weapon') || 
                                                          item.category.toLowerCase().includes('rifle') || 
                                                          item.name.toLowerCase().includes('rifle') ||
                                                          item.name.toLowerCase().includes('gun') ||
                                                          item.name.toLowerCase().includes('m4');

                                            return (
                                                <div 
                                                    key={`${item.id}-${index}`}
                                                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all flex items-center justify-between gap-3"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                                                            isGun 
                                                                ? 'bg-red-950/50 border-red-500/40 text-red-400' 
                                                                : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                                                        }`}>
                                                            {isGun ? <Crosshair className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/[0.05] text-zinc-400">
                                                                    {item.category}
                                                                </span>
                                                                {isGun && (
                                                                    <span className="text-[9px] font-mono font-bold uppercase px-1 py-0.2 rounded bg-red-950/70 text-red-300 border border-red-500/30">
                                                                        Primary Replica
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                                                                {item.name}
                                                            </h4>
                                                            <p className="text-[10px] text-zinc-500 font-mono">
                                                                Status: Allocated for deployment
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <span className="text-sm font-mono font-black text-white">
                                                            R{item.price.toFixed(2)}
                                                        </span>
                                                        <span className="block text-[9px] text-emerald-400 font-mono">
                                                            Reserved
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 text-center space-y-2">
                                        <Package className="w-8 h-8 mx-auto text-zinc-600" />
                                        <p className="text-sm font-bold text-zinc-300">No equipment rentals currently selected.</p>
                                        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                                            You are playing with your personal gear or have not yet chosen rental items for this skirmish.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Financial Summary & Due on-site */}
                            <div className="p-4 rounded-xl bg-zinc-900/70 border border-white/10 space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                                    Financial Summary & Registration Due
                                </h3>

                                <div className="space-y-1.5 text-xs text-zinc-300 font-mono">
                                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                                        <span className="text-zinc-400 font-sans">Field Match Entry Fee:</span>
                                        <span className="font-bold text-white">R{event.gameFee.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                                        <span className="text-zinc-400 font-sans">Equipment Rentals Subtotal ({playerReservedItems.length} items):</span>
                                        <span className="font-bold text-white">R{playerTotalGearCost.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 text-sm sm:text-base font-black text-white">
                                        <span className="font-sans">Total Due At Registration Desk:</span>
                                        <span className="text-emerald-400 text-lg">R{playerGrandTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 text-[11px] text-zinc-400 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>Payment is accepted at the field briefing desk via Card, Cash, or Instant EFT prior to match start.</span>
                                </div>
                            </div>

                            {/* Operator Special Note */}
                            {(playerSignup?.note || playerAttendee?.note || operatorNote) && (
                                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                        Special Note to Armorer / Marshals:
                                    </span>
                                    <p className="text-xs text-zinc-200 italic font-mono">
                                        "{playerSignup?.note || playerAttendee?.note || operatorNote}"
                                    </p>
                                </div>
                            )}

                            {/* Armory Handover Protocol Rules */}
                            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                                    <Shield className="w-4 h-4" />
                                    <span>Armory Handover & Safety Protocol</span>
                                </h4>
                                <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-4 leading-relaxed">
                                    <li>Eye protection must remain firmly secured before receiving any charged battery or magazine.</li>
                                    <li>Replicas are test-fired and chronographed at the armory station before match deployment.</li>
                                    <li>Return all rented rifles, batteries, safety masks, and magazines directly to the Armory Marshal at match completion.</li>
                                </ul>
                            </div>

                            {/* Action Buttons: Copy & Print */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={copyPlayerSummary}
                                        size="sm"
                                        variant="secondary"
                                        className="!px-3 !py-1.5 !text-xs font-bold flex items-center gap-1.5"
                                    >
                                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Copy Gear List</span>
                                    </Button>
                                    <Button
                                        onClick={handleSavePlayerReceipt}
                                        size="sm"
                                        variant="secondary"
                                        className="!px-3 !py-1.5 !text-xs font-bold flex items-center gap-1.5"
                                        title="Download Equipment Rental Receipt (.txt)"
                                    >
                                        <Download className="w-3.5 h-3.5 text-red-400" />
                                        <span>Save Receipt</span>
                                    </Button>
                                    <Button
                                        onClick={handlePrintReceipt}
                                        size="sm"
                                        variant="secondary"
                                        className="!px-3 !py-1.5 !text-xs font-bold flex items-center gap-1.5"
                                        title="Print Formatted Equipment Receipt"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Print Receipt</span>
                                    </Button>
                                </div>

                                <Button
                                    onClick={onClose}
                                    size="sm"
                                    className="!px-4 !py-2 !text-xs font-bold !bg-zinc-800 hover:!bg-zinc-700 text-white"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: ADMIN & EVENT-WIDE EQUIPMENT RENTAL MANIFEST */}
                    {activeTab === 'admin-manifest' && (
                        <div className="space-y-6">
                            {/* Manifest KPI Overview Bar */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10">
                                    <p className="text-[9px] sm:text-[10px] font-mono uppercase text-zinc-400 truncate">Total Reserved</p>
                                    <p className="text-base sm:text-2xl font-black text-white mt-0.5">{totalItemsRentedCount}</p>
                                    <p className="text-[9px] text-zinc-500 truncate">Across all signups</p>
                                </div>
                                <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10">
                                    <p className="text-[9px] sm:text-[10px] font-mono uppercase text-zinc-400 truncate">Operators Renting</p>
                                    <p className="text-base sm:text-2xl font-black text-white mt-0.5">{totalRentingOperatorsCount}</p>
                                    <p className="text-[9px] text-emerald-400 font-mono truncate">
                                        {event.attendees?.length || 0} checked in
                                    </p>
                                </div>
                                <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10">
                                    <p className="text-[9px] sm:text-[10px] font-mono uppercase text-zinc-400 truncate">Rental Revenue</p>
                                    <p className="text-base sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
                                        R{totalRentalRevenue.toFixed(2)}
                                    </p>
                                    <p className="text-[9px] text-zinc-500 truncate">Gear rentals only</p>
                                </div>
                                <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10">
                                    <p className="text-[9px] sm:text-[10px] font-mono uppercase text-zinc-400 truncate">Armory Buffer</p>
                                    <p className="text-base sm:text-2xl font-black text-amber-400 font-mono mt-0.5">
                                        {aggregatedGearSummary.reduce((sum, item) => sum + item.remainingStock, 0)} Units
                                    </p>
                                    <p className="text-[9px] text-zinc-500 truncate">Remaining in armory</p>
                                </div>
                            </div>

                            {/* 1. Item-By-Item Inventory Manifest Table */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-red-400" />
                                        <span>Armory Inventory Allocation Breakdown</span>
                                    </h3>
                                    <span className="text-[10px] font-mono text-zinc-400">
                                        {aggregatedGearSummary.length} Gear Models
                                    </span>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 custom-scrollbar">
                                    <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                                        <thead>
                                            <tr className="bg-white/[0.04] border-b border-white/10 text-[10px] uppercase font-mono text-zinc-400 whitespace-nowrap">
                                                <th className="py-2 px-2.5 sm:px-3">Equipment Item</th>
                                                <th className="py-2 px-2.5 sm:px-3">Category</th>
                                                <th className="py-2 px-2.5 sm:px-3 text-center">Reserved</th>
                                                <th className="py-2 px-2.5 sm:px-3 text-center">Total Stock</th>
                                                <th className="py-2 px-2.5 sm:px-3 text-center">Remaining</th>
                                                <th className="py-2 px-2.5 sm:px-3 text-right">Unit Price</th>
                                                <th className="py-2 px-2.5 sm:px-3 text-right">Total Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 font-mono whitespace-nowrap">
                                            {aggregatedGearSummary.map(item => {
                                                const isDepleted = item.remainingStock === 0 && item.stock > 0;
                                                const isLowStock = item.remainingStock > 0 && item.remainingStock <= 2;

                                                return (
                                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-2.5 px-3 font-sans font-bold text-white">
                                                            <div className="flex items-center gap-2">
                                                                <span className="truncate">{item.name}</span>
                                                                {item.reservedCount > 0 && (
                                                                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-950/80 text-red-400 border border-red-500/30">
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-zinc-400 font-sans text-[11px]">
                                                            {item.category}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center font-bold text-white">
                                                            {item.reservedCount}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center text-zinc-400">
                                                            {item.stock}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                isDepleted 
                                                                    ? 'bg-red-950/80 text-red-400 border border-red-500/40' 
                                                                    : isLowStock
                                                                        ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                                                                        : 'bg-emerald-950/60 text-emerald-400'
                                                            }`}>
                                                                {isDepleted ? 'SOLD OUT' : `${item.remainingStock} left`}
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right text-zinc-300">
                                                            R{item.price.toFixed(2)}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                                                            R{item.totalRevenue.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 2. Operator Rental Roster & Details */}
                            <div className="space-y-3 pt-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-emerald-400" />
                                        <span>Operator Rental Roster ({filteredOperators.length})</span>
                                    </h3>

                                    {/* Search & Filter Bar */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="relative">
                                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            <input
                                                type="text"
                                                placeholder="Search operator or gear..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="pl-8 pr-3 py-1 bg-black/60 border border-white/15 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 w-44 sm:w-56"
                                            />
                                        </div>

                                        <select
                                            value={selectedCategoryFilter}
                                            onChange={e => setSelectedCategoryFilter(e.target.value)}
                                            className="bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-red-500"
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="checked-in">Checked In</option>
                                            <option value="signed-up">Signed Up</option>
                                            <option value="unpaid">Unpaid</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                    </div>
                                </div>

                                {filteredOperators.length > 0 ? (
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                        {filteredOperators.map(op => {
                                            const opPlayer = op.player;
                                            const isCheckedIn = op.status === 'Checked In';

                                            return (
                                                <div 
                                                    key={op.playerId}
                                                    className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                                >
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-black text-white text-sm">
                                                                {opPlayer?.callsign || opPlayer?.name || 'Operator'}
                                                            </span>
                                                            {opPlayer?.name && opPlayer.callsign && (
                                                                <span className="text-[11px] text-zinc-400">
                                                                    ({opPlayer.name})
                                                                </span>
                                                            )}
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                                                isCheckedIn 
                                                                    ? 'bg-blue-950/70 text-blue-400 border-blue-500/40' 
                                                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                            }`}>
                                                                {op.status}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                                                op.paymentStatus && op.paymentStatus !== 'Unpaid'
                                                                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                                                                    : 'bg-amber-950/70 text-amber-400 border border-amber-500/30'
                                                            }`}>
                                                                {op.paymentStatus || 'Unpaid'}
                                                            </span>
                                                        </div>

                                                        {/* Items rented */}
                                                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                            {op.gearIds.map((id, idx) => {
                                                                const details = getItemDetails(id);
                                                                return (
                                                                    <span 
                                                                        key={`${id}-${idx}`}
                                                                        className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-200 font-mono flex items-center gap-1"
                                                                    >
                                                                        <span>• {details.name}</span>
                                                                        <span className="text-zinc-500 text-[9px]">(R{details.price})</span>
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>

                                                        {op.note && (
                                                            <p className="text-[11px] text-amber-300/80 italic pt-0.5">
                                                                Note: "{op.note}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <p className="text-[10px] text-zinc-400 font-mono uppercase">Rental Fee</p>
                                                        <p className="text-base font-black font-mono text-emerald-400">
                                                            R{op.totalGearCost.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 text-center text-zinc-500 text-xs py-8">
                                        No operators match the selected rental filter.
                                    </div>
                                )}
                            </div>

                            {/* Manifest Action Buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={copyAdminManifest}
                                        size="sm"
                                        variant="secondary"
                                        className="!px-3 !py-1.5 !text-xs font-bold flex items-center gap-1.5"
                                    >
                                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Copy Full Manifest</span>
                                    </Button>
                                    <Button
                                        onClick={handleSaveAdminManifest}
                                        size="sm"
                                        variant="secondary"
                                        className="!px-3 !py-1.5 !text-xs font-bold flex items-center gap-1.5"
                                        title="Download Full Armory Manifest (.txt)"
                                    >
                                        <Download className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Save Manifest</span>
                                    </Button>
                                    <Button
                                        onClick={handlePrintManifest}
                                        size="sm"
                                        variant="secondary"
                                        className="!px-3 !py-1.5 !text-xs font-bold flex items-center gap-1.5"
                                        title="Print Formatted Armory Manifest Sheet"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Print Armory Sheet</span>
                                    </Button>
                                </div>

                                <Button
                                    onClick={onClose}
                                    size="sm"
                                    className="!px-4 !py-2 !text-xs font-bold !bg-zinc-800 hover:!bg-zinc-700 text-white"
                                >
                                    Close Manifest
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
        </motion.div>
    );

    return (
        <>
            {typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent}
            {printingMode && typeof document !== 'undefined' && document.getElementById('printable-report-container') && createPortal(
                printingMode === 'receipt' ? printableReceipt : printableManifest,
                document.getElementById('printable-report-container')!
            )}
        </>
    );
};
