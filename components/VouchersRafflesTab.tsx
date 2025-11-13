import React, { useState } from 'react';
import type { Voucher, Raffle, Prize, Player } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { TicketIcon, PlusIcon, PencilIcon, TrashIcon } from './icons/Icons';

interface VouchersRafflesTabProps {
    vouchers: Voucher[];
    setVouchers: React.Dispatch<React.SetStateAction<Voucher[]>>;
    raffles: Raffle[];
    setRaffles: React.Dispatch<React.SetStateAction<Raffle[]>>;
    players: Player[];
}

const VoucherEditorModal: React.FC<{ voucher: Voucher | {}, onClose: () => void, onSave: (v: Voucher) => void, players: Player[] }> = ({ voucher, onClose, onSave, players }) => {
    const [formData, setFormData] = useState({
        code: 'code' in voucher ? voucher.code : '',
        description: 'description' in voucher ? voucher.description : '',
        discount: 'discount' in voucher ? voucher.discount : 0,
        type: 'type' in voucher ? voucher.type : 'fixed' as 'fixed' | 'percentage',
        status: 'status' in voucher ? voucher.status : 'Active' as 'Active' | 'Expired' | 'Depleted',
        usageLimit: 'usageLimit' in voucher ? voucher.usageLimit : 1,
        perUserLimit: 'perUserLimit' in voucher ? voucher.perUserLimit : 1,
        assignedToPlayerId: 'assignedToPlayerId' in voucher ? voucher.assignedToPlayerId : ''
    });

    const handleSaveClick = () => {
        const finalVoucher = { redemptions: [], ...voucher, ...formData } as Voucher;
        onSave(finalVoucher);
    }
    
    return (
        <Modal isOpen={true} onClose={onClose} title={'id' in voucher ? 'Edit Voucher' : 'Create Voucher'}>
            <div className="space-y-4">
                <Input label="Voucher Code" value={formData.code} onChange={e => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Discount Value" type="number" value={formData.discount} onChange={e => setFormData(f => ({ ...f, discount: Number(e.target.value) }))} />
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Discount Type</label>
                        <select value={formData.type} onChange={e => setFormData(f => ({...f, type: e.target.value as any}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                           <option value="fixed">Fixed Amount (R)</option>
                           <option value="percentage">Percentage (%)</option>
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Total Usage Limit" type="number" value={formData.usageLimit} onChange={e => setFormData(f => ({ ...f, usageLimit: Number(e.target.value) }))} />
                    <Input label="Per-Player Limit" type="number" value={formData.perUserLimit} onChange={e => setFormData(f => ({ ...f, perUserLimit: Number(e.target.value) }))} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Assign to Player (Optional)</label>
                    <select value={formData.assignedToPlayerId} onChange={e => setFormData(f => ({...f, assignedToPlayerId: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">All Players</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>
             <div className="mt-6">
                <Button className="w-full" onClick={handleSaveClick}>Save Voucher</Button>
            </div>
        </Modal>
    )
}

const RaffleEditorModal: React.FC<{ raffle: Raffle | {}, onClose: () => void, onSave: (r: Raffle) => void }> = ({ raffle, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: 'name' in raffle ? raffle.name : '',
        location: 'location' in raffle ? raffle.location : '',
        contactPhone: 'contactPhone' in raffle ? raffle.contactPhone : '',
        drawDate: 'drawDate' in raffle ? raffle.drawDate.split('T')[0] : '',
    });
    const [prizes, setPrizes] = useState<Prize[]>('prizes' in raffle ? raffle.prizes : []);

    const handlePrizeChange = (index: number, value: string) => {
        const newPrizes = [...prizes];
        newPrizes[index].name = value;
        setPrizes(newPrizes);
    }

    const addPrize = () => {
        const place = (prizes.length + 1) as (1 | 2 | 3);
        if (place > 3) return;
        setPrizes([...prizes, { id: `p${Date.now()}`, name: '', place }]);
    }

    const handleSaveClick = () => {
        const finalRaffle = { 
            tickets: [], winners: [], status: 'Upcoming', createdAt: new Date().toISOString(), 
            ...raffle, ...formData, prizes,
            drawDate: new Date(formData.drawDate).toISOString()
        } as Raffle;
        onSave(finalRaffle);
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={'id' in raffle ? 'Edit Raffle' : 'Create Raffle'}>
            <div className="space-y-4">
                <Input label="Raffle Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Draw Date" type="date" value={formData.drawDate} onChange={e => setFormData(f => ({ ...f, drawDate: e.target.value }))} />
                    <Input label="Contact Phone" value={formData.contactPhone} onChange={e => setFormData(f => ({ ...f, contactPhone: e.target.value }))} />
                </div>
                <Input label="Location" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
                <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Prizes</h4>
                    {prizes.map((prize, index) => (
                        <div key={prize.id || index} className="flex items-center gap-2 mb-2">
                           <span className="font-bold text-lg text-amber-400">{index+1}.</span>
                           <Input value={prize.name} onChange={e => handlePrizeChange(index, e.target.value)} placeholder={`Prize for place ${index+1}`}/>
                        </div>
                    ))}
                    {prizes.length < 3 && <Button size="sm" variant="secondary" onClick={addPrize}>Add Prize</Button>}
                </div>
            </div>
             <div className="mt-6">
                <Button className="w-full" onClick={handleSaveClick}>Save Raffle</Button>
            </div>
        </Modal>
    );
};


export const VouchersRafflesTab: React.FC<VouchersRafflesTabProps> = (props) => {
    const { vouchers, setVouchers, raffles, setRaffles, players } = props;
    const [isEditingVoucher, setIsEditingVoucher] = useState<Voucher | {} | null>(null);
    const [isEditingRaffle, setIsEditingRaffle] = useState<Raffle | {} | null>(null);

    const handleSaveVoucher = (voucher: Voucher) => {
        if (voucher.id) {
            setVouchers(vs => vs.map(v => v.id === voucher.id ? voucher : v));
        } else {
            setVouchers(vs => [...vs, { ...voucher, id: `v${Date.now()}` }]);
        }
        setIsEditingVoucher(null);
    };

    const handleSaveRaffle = (raffle: Raffle) => {
        if (raffle.id) {
            setRaffles(rs => rs.map(r => r.id === raffle.id ? raffle : r));
        } else {
            setRaffles(rs => [...rs, { ...raffle, id: `r${Date.now()}` }]);
        }
        setIsEditingRaffle(null);
    }
    
    const handleDrawWinner = (raffleId: string) => {
        const raffle = raffles.find(r => r.id === raffleId);
        if (!raffle || raffle.tickets.length === 0) {
            alert("No tickets to draw from!");
            return;
        }

        let availableTickets = [...raffle.tickets];
        const winners = [];

        for (const prize of [...raffle.prizes].sort((a,b) => a.place - b.place)) {
            if (availableTickets.length === 0) break;
            const winnerIndex = Math.floor(Math.random() * availableTickets.length);
            const winningTicket = availableTickets[winnerIndex];
            winners.push({
                prizeId: prize.id,
                ticketId: winningTicket.id,
                playerId: winningTicket.playerId
            });
            // Remove the winning ticket so it can't win again
            availableTickets.splice(winnerIndex, 1);
        }

        const updatedRaffle = { ...raffle, winners, status: 'Completed' as 'Completed' };
        setRaffles(rs => rs.map(r => r.id === raffleId ? updatedRaffle : r));
    }


    return (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isEditingVoucher && <VoucherEditorModal voucher={isEditingVoucher} onClose={() => setIsEditingVoucher(null)} onSave={handleSaveVoucher} players={players} />}
            {isEditingRaffle && <RaffleEditorModal raffle={isEditingRaffle} onClose={() => setIsEditingRaffle(null)} onSave={handleSaveRaffle} />}

            <DashboardCard title="Vouchers" icon={<TicketIcon className="w-6 h-6"/>}>
                <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsEditingVoucher({})}><PlusIcon className="w-5 h-5 mr-2"/>Create Voucher</Button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {vouchers.map(v => (
                            <div key={v.id} className="bg-zinc-800/50 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-bold font-mono text-red-400">{v.code}</p>
                                    <p className="text-xs text-gray-300">{v.description}</p>
                                </div>
                                 <div className="flex items-center gap-2">
                                     <p className="text-xs text-gray-400">{v.status}</p>
                                    <Button size="sm" variant="secondary" onClick={() => setIsEditingVoucher(v)}><PencilIcon className="w-4 h-4"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardCard>

            <DashboardCard title="Raffles" icon={<TicketIcon className="w-6 h-6"/>}>
                 <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsEditingRaffle({})}><PlusIcon className="w-5 h-5 mr-2"/>Create Raffle</Button>
                    </div>
                     <div className="space-y-4 max-h-96 overflow-y-auto">
                        {raffles.map(r => (
                            <div key={r.id} className="bg-zinc-800/50 p-3 rounded-md">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-white">{r.name}</h4>
                                        <p className="text-xs text-gray-400">Draw on: {new Date(r.drawDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditingRaffle(r)}><PencilIcon className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                                {r.status === 'Completed' ? (
                                    <div className="mt-2 text-sm">
                                        <h5 className="font-semibold text-amber-400">Winners:</h5>
                                        {r.winners.map(w => {
                                            const prize = r.prizes.find(p => p.id === w.prizeId);
                                            const player = players.find(p => p.id === w.playerId);
                                            return <p key={w.prizeId} className="text-gray-300">{prize?.place}. {prize?.name} - {player?.name}</p>
                                        })}
                                    </div>
                                ) : (
                                    <div className="mt-2">
                                         <Button size="sm" disabled={r.tickets.length === 0} onClick={() => handleDrawWinner(r.id)}>
                                            Draw Winners ({r.tickets.length} tickets)
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};