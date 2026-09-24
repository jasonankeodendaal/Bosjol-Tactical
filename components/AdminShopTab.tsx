import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { InventoryItem, Player, Transaction, SaleItem, SalePaymentMethod, CompanyDetails } from '../types';
import { Button } from './Button';
import { Modal } from './Modal';
import { SHOP_POS_SQL_SNIPPET } from '../utils/supabaseSchema';
import { isSupabaseConfigured } from '../supabaseClient';
import { 
    ShoppingBag, 
    ShoppingCart, 
    Plus, 
    Minus, 
    Trash2, 
    Search, 
    CreditCard, 
    Banknote, 
    Send, 
    User, 
    Printer, 
    CheckCircle2, 
    Package, 
    Sparkles, 
    Receipt, 
    History, 
    FileText, 
    X,
    Clock, 
    AlertTriangle, 
    Eye, 
    Coins, 
    RotateCcw,
    Barcode,
    Database,
    Copy,
    Volume2,
    VolumeX,
    PauseCircle,
    PlayCircle,
    Check,
    Zap,
    RefreshCw
} from 'lucide-react';

interface AdminShopTabProps {
    inventory: InventoryItem[];
    players: Player[];
    transactions: Transaction[];
    updateDoc: <T extends { id: string }>(collectionName: string, doc: T) => Promise<void>;
    addDoc: <T extends {}>(collectionName: string, doc: T) => Promise<void>;
    companyDetails?: CompanyDetails;
    onViewPlayer?: (player: Player) => void;
}

interface CartItem extends SaleItem {
    availableStock?: number;
    originalItem?: InventoryItem;
}

interface ParkedSale {
    id: string;
    savedAt: string;
    label: string;
    cart: CartItem[];
    selectedPlayerId: string;
    discountAmount: number;
    saleNotes: string;
}

export const AdminShopTab: React.FC<AdminShopTabProps> = ({
    inventory,
    players,
    transactions,
    updateDoc,
    addDoc,
    companyDetails,
}) => {
    // Navigation: 'shop' (POS Terminal) or 'salesHistory' (Ledger)
    const [subView, setSubView] = useState<'shop' | 'salesHistory'>('shop');

    // Search and Catalog Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showAllInventory, setShowAllInventory] = useState<boolean>(false);
    const [barcodeScanInput, setBarcodeScanInput] = useState<string>('');

    // Cart and Transaction State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
    const [playerSearchQuery, setPlayerSearchQuery] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<SalePaymentMethod>('Cash');
    const [cashTendered, setCashTendered] = useState<string>('');
    const [amountPaidManual, setAmountPaidManual] = useState<string>('');
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [discountPreset, setDiscountPreset] = useState<number | null>(null);
    const [saleNotes, setSaleNotes] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // Audio & Haptic Feedback
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

    // Parked / Held Sales Register
    const [parkedSales, setParkedSales] = useState<ParkedSale[]>([]);
    const [showParkedModal, setShowParkedModal] = useState<boolean>(false);

    // Modals
    const [showManualModal, setShowManualModal] = useState<boolean>(false);
    const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
    const [copiedSql, setCopiedSql] = useState<boolean>(false);
    const [completedSale, setCompletedSale] = useState<Transaction | null>(null);
    const [inspectingItem, setInspectingItem] = useState<InventoryItem | null>(null);
    const [viewingPastReceipt, setViewingPastReceipt] = useState<Transaction | null>(null);

    // Manual item form
    const [manualItemForm, setManualItemForm] = useState({
        name: '',
        price: '',
        quantity: '1',
        category: 'Field Consumable',
        notes: '',
    });

    // Realtime live clock
    const [currentTime, setCurrentTime] = useState<string>('');
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Synthesized POS audio feedback
    const playRegisterBeep = (freq: number = 920, duration: number = 0.07) => {
        if (!soundEnabled) return;
        try {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch {
            // Audio error non-blocking
        }
    };

    // Filter categories
    const categories = useMemo(() => {
        const set = new Set<string>();
        inventory.forEach(i => {
            if (i.category) set.add(i.category);
        });
        return ['all', ...Array.from(set)];
    }, [inventory]);

    // Filtered shop catalog
    const displayedItems = useMemo(() => {
        return inventory.filter(item => {
            if (!showAllInventory && !item.availableInShop) return false;
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const matchName = item.name.toLowerCase().includes(q);
                const matchSku = (item.sku || '').toLowerCase().includes(q);
                const matchDesc = (item.description || '').toLowerCase().includes(q);
                const matchSerial = (item.serialNumber || '').toLowerCase().includes(q);
                const matchIncludes = (item.rentalIncludes || '').toLowerCase().includes(q);
                if (!matchName && !matchSku && !matchDesc && !matchSerial && !matchIncludes) return false;
            }
            if (selectedCategory !== 'all' && item.category !== selectedCategory) {
                return false;
            }
            return true;
        });
    }, [inventory, showAllInventory, searchTerm, selectedCategory]);

    // Quick favorite consumables
    const quickFavorites = useMemo(() => {
        return inventory.filter(i => {
            const n = i.name.toLowerCase();
            return (
                n.includes('bb') || 
                n.includes('gas') || 
                n.includes('co2') || 
                n.includes('mask') || 
                n.includes('speedloader') ||
                n.includes('battery') ||
                n.includes('rental')
            );
        }).slice(0, 6);
    }, [inventory]);

    // Filtered players
    const filteredPlayers = useMemo(() => {
        if (!playerSearchQuery.trim()) return players.slice(0, 15);
        const q = playerSearchQuery.toLowerCase();
        return players.filter(p => 
            p.name.toLowerCase().includes(q) ||
            p.surname.toLowerCase().includes(q) ||
            (p.callsign || '').toLowerCase().includes(q) ||
            (p.playerCode || '').toLowerCase().includes(q)
        ).slice(0, 15);
    }, [players, playerSearchQuery]);

    // Selected player
    const selectedPlayer = useMemo(() => {
        return players.find(p => p.id === selectedPlayerId) || null;
    }, [players, selectedPlayerId]);

    // Cart calculations
    const cartSubtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const finalTotal = useMemo(() => {
        return Math.max(0, cartSubtotal - (discountAmount || 0));
    }, [cartSubtotal, discountAmount]);

    const changeDue = useMemo(() => {
        const tendered = parseFloat(amountPaidManual) || 0;
        return tendered >= finalTotal ? tendered - finalTotal : 0;
    }, [amountPaidManual, finalTotal]);

    // Smart roundups
    const smartRoundups = useMemo(() => {
        if (finalTotal <= 0) return [];
        const candidates = [20, 50, 100, 150, 200, 250, 300, 400, 500, 1000, 1500, 2000];
        return candidates.filter(c => c > finalTotal).slice(0, 4);
    }, [finalTotal]);

    // Handlers for cart
    const handleAddToCart = (item: InventoryItem) => {
        playRegisterBeep(1050, 0.06);
        setCart(prev => {
            const existing = prev.find(i => i.inventoryId === item.id);
            if (existing) {
                if (existing.quantity >= item.stock) {
                    alert(`Maximum available stock (${item.stock}) reached for "${item.name}".`);
                    return prev;
                }
                return prev.map(i => 
                    i.inventoryId === item.id 
                        ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
                        : i
                );
            } else {
                if (item.stock <= 0) {
                    alert(`"${item.name}" is out of stock.`);
                    return prev;
                }
                const newCartItem: CartItem = {
                    id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    inventoryId: item.id,
                    name: item.name,
                    price: item.salePrice || 0,
                    quantity: 1,
                    total: item.salePrice || 0,
                    category: item.category,
                    imageUrl: item.imageUrl,
                    sku: item.sku,
                    availableStock: item.stock,
                    originalItem: item,
                    isManual: false,
                };
                return [...prev, newCartItem];
            }
        });
    };

    // Barcode / SKU scan submit
    const handleBarcodeScan = (e: React.FormEvent) => {
        e.preventDefault();
        const code = barcodeScanInput.trim().toLowerCase();
        if (!code) return;

        // Match SKU or serial or name
        const matched = inventory.find(i => 
            (i.sku || '').toLowerCase() === code ||
            (i.serialNumber || '').toLowerCase() === code ||
            i.name.toLowerCase() === code ||
            i.id.toLowerCase() === code
        );

        if (matched) {
            handleAddToCart(matched);
            setBarcodeScanInput('');
        } else {
            alert(`No armory item matched barcode/SKU "${barcodeScanInput}".`);
        }
    };

    const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
        playRegisterBeep(850, 0.04);
        if (newQty <= 0) {
            handleRemoveFromCart(cartItemId);
            return;
        }
        setCart(prev => prev.map(item => {
            if (item.id === cartItemId) {
                if (item.availableStock !== undefined && newQty > item.availableStock) {
                    alert(`Maximum available stock is ${item.availableStock}`);
                    return item;
                }
                return {
                    ...item,
                    quantity: newQty,
                    total: newQty * item.price,
                };
            }
            return item;
        }));
    };

    const handleRemoveFromCart = (cartItemId: string) => {
        playRegisterBeep(600, 0.08);
        setCart(prev => prev.filter(i => i.id !== cartItemId));
    };

    const handleClearCart = () => {
        if (cart.length === 0) return;
        if (window.confirm('Reset current register cart?')) {
            setCart([]);
            setDiscountAmount(0);
            setDiscountPreset(null);
            setCashTendered('');
            setAmountPaidManual('');
            setSaleNotes('');
            setSelectedPlayerId('');
        }
    };

    // Park & Recall Cart
    const handleParkSale = () => {
        if (cart.length === 0) return;
        const newPark: ParkedSale = {
            id: `park_${Date.now()}`,
            savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            label: selectedPlayer ? `${selectedPlayer.callsign || selectedPlayer.name} (${cart.length} items)` : `Walk-in (${cart.length} items - R${finalTotal.toFixed(2)})`,
            cart,
            selectedPlayerId,
            discountAmount,
            saleNotes,
        };
        setParkedSales(prev => [newPark, ...prev]);
        setCart([]);
        setDiscountAmount(0);
        setDiscountPreset(null);
        setAmountPaidManual('');
        setSaleNotes('');
        setSelectedPlayerId('');
        playRegisterBeep(1200, 0.1);
    };

    const handleRecallParkedSale = (park: ParkedSale) => {
        if (cart.length > 0) {
            if (!window.confirm('Cart has active items. Replace active cart with parked sale?')) {
                return;
            }
        }
        setCart(park.cart);
        setSelectedPlayerId(park.selectedPlayerId);
        setDiscountAmount(park.discountAmount);
        setSaleNotes(park.saleNotes);
        setParkedSales(prev => prev.filter(p => p.id !== park.id));
        setShowParkedModal(false);
        playRegisterBeep(1100, 0.08);
    };

    // Quick tender helpers
    const handleSetExactAmount = () => {
        playRegisterBeep(980, 0.05);
        const val = finalTotal.toFixed(2);
        setAmountPaidManual(val);
        setCashTendered(val);
    };

    const handleSetCustomTender = (val: number) => {
        playRegisterBeep(980, 0.05);
        const str = val.toFixed(2);
        setAmountPaidManual(str);
        setCashTendered(str);
    };

    const handleAddPresetIncrement = (increment: number) => {
        playRegisterBeep(980, 0.05);
        const current = parseFloat(amountPaidManual) || 0;
        const nextVal = (current + increment).toFixed(2);
        setAmountPaidManual(nextVal);
        setCashTendered(nextVal);
    };

    // Discount percentage preset
    const handleApplyDiscountPreset = (pct: number) => {
        playRegisterBeep(950, 0.04);
        if (pct === 0) {
            setDiscountPreset(null);
            setDiscountAmount(0);
        } else {
            setDiscountPreset(pct);
            const calculated = Number(((cartSubtotal * pct) / 100).toFixed(2));
            setDiscountAmount(calculated);
        }
    };

    // Add manual item
    const handleAddManualItem = (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(manualItemForm.price);
        const quantity = parseInt(manualItemForm.quantity, 10);
        if (!manualItemForm.name.trim()) {
            alert('Please enter an item name or description.');
            return;
        }
        if (isNaN(price) || price < 0) {
            alert('Please enter a valid price (ZAR).');
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            alert('Please enter a valid quantity.');
            return;
        }

        const manualCartItem: CartItem = {
            id: `manual_${Date.now()}`,
            name: manualItemForm.name.trim(),
            price: price,
            quantity: quantity,
            total: price * quantity,
            category: manualItemForm.category,
            isManual: true,
        };

        setCart(prev => [...prev, manualCartItem]);
        setManualItemForm({
            name: '',
            price: '',
            quantity: '1',
            category: 'Field Consumable',
            notes: '',
        });
        setShowManualModal(false);
        playRegisterBeep(1100, 0.08);
    };

    // Complete POS Sale
    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            alert('Your register cart is empty. Add items before finalizing.');
            return;
        }

        const enteredTendered = parseFloat(amountPaidManual || cashTendered);
        if (!isNaN(enteredTendered) && enteredTendered > 0 && enteredTendered < finalTotal) {
            const shortage = finalTotal - enteredTendered;
            const proceed = window.confirm(
                `Amount entered (R${enteredTendered.toFixed(2)}) via ${paymentMethod} is R${shortage.toFixed(2)} less than total payable (R${finalTotal.toFixed(2)}).\n\nProceed with recorded balance shortage, or cancel to enter full amount?`
            );
            if (!proceed) return;
        }

        setIsProcessing(true);

        try {
            const timestamp = new Date();
            const dateStr = timestamp.toISOString();
            const dateCode = dateStr.slice(0, 10).replace(/-/g, '');
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const receiptCode = `BOS-POS-${dateCode}-${randomCode}`;
            const transactionId = `tx_pos_${Date.now()}`;

            const finalTendered = (!isNaN(enteredTendered) && enteredTendered > 0)
                ? enteredTendered
                : finalTotal;
            const calculatedChange = finalTendered >= finalTotal ? finalTendered - finalTotal : 0;

            const saleItems: SaleItem[] = cart.map(i => ({
                id: i.id,
                inventoryId: i.inventoryId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
                total: i.total,
                category: i.category,
                imageUrl: i.imageUrl,
                sku: i.sku,
                isManual: i.isManual,
            }));

            const description = cart.length === 1 
                ? `Shop Sale: ${cart[0].name} (x${cart[0].quantity})`
                : `Shop Sale: ${cart.length} items (${cart[0].name}, etc.)`;

            const newTransaction: Transaction = {
                id: transactionId,
                date: dateStr,
                type: 'Retail Revenue',
                description,
                amount: finalTotal,
                subtotal: cartSubtotal,
                discount: discountAmount,
                paymentMethod,
                paymentStatus: 'Paid',
                receiptNumber: receiptCode,
                items: saleItems,
                amountTendered: finalTendered,
                changeDue: calculatedChange,
                notes: saleNotes.trim(),
                cashierName: 'Admin Counter',
                playerId: selectedPlayer?.id,
                relatedPlayerId: selectedPlayer?.id,
                customerName: selectedPlayer ? `${selectedPlayer.name} ${selectedPlayer.surname}` : 'Walk-in Operator',
                customerCallsign: selectedPlayer?.callsign || '',
                customerCode: selectedPlayer?.playerCode || '',
            };

            // 1. Deduct stock from inventory
            for (const item of cart) {
                if (!item.isManual && item.inventoryId && item.originalItem) {
                    const currentStock = Number(item.originalItem.stock || 0);
                    const newStock = Math.max(0, currentStock - item.quantity);
                    const updatedItem: InventoryItem = {
                        ...item.originalItem,
                        stock: newStock,
                    };
                    await updateDoc('inventory', updatedItem);
                }
            }

            // 2. Add transaction to Supabase / Realtime
            await addDoc('transactions', newTransaction);

            // Audio celebration chirp
            playRegisterBeep(1200, 0.15);

            // 3. Show success receipt
            setCompletedSale(newTransaction);

            // 4. Reset Cart
            setCart([]);
            setDiscountAmount(0);
            setDiscountPreset(null);
            setCashTendered('');
            setAmountPaidManual('');
            setSaleNotes('');
            setSelectedPlayerId('');
            setPlayerSearchQuery('');

        } catch (error) {
            console.error('Error completing shop sale:', error);
            alert('Failed to process sale. Please check your connection and try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Copy SQL Snippet helper
    const handleCopySql = () => {
        navigator.clipboard.writeText(SHOP_POS_SQL_SNIPPET);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
    };

    // Past Shop Transactions
    const shopTransactions = useMemo(() => {
        return transactions
            .filter(t => t.type === 'Retail Revenue' || (t.items && t.items.length > 0))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    // Ledger search filter
    const [ledgerSearch, setLedgerSearch] = useState('');
    const [ledgerFilterMethod, setLedgerFilterMethod] = useState<string>('all');

    const filteredLedger = useMemo(() => {
        return shopTransactions.filter(tx => {
            if (ledgerSearch.trim()) {
                const q = ledgerSearch.toLowerCase();
                const matchRcpt = (tx.receiptNumber || '').toLowerCase().includes(q);
                const matchCust = (tx.customerName || '').toLowerCase().includes(q);
                const matchCall = (tx.customerCallsign || '').toLowerCase().includes(q);
                const matchDesc = (tx.description || '').toLowerCase().includes(q);
                if (!matchRcpt && !matchCust && !matchCall && !matchDesc) return false;
            }
            if (ledgerFilterMethod !== 'all' && (tx.paymentMethod || 'Cash') !== ledgerFilterMethod) {
                return false;
            }
            return true;
        });
    }, [shopTransactions, ledgerSearch, ledgerFilterMethod]);

    const totalTodayRevenue = useMemo(() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        return shopTransactions
            .filter(t => (t.date || '').slice(0, 10) === todayStr)
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    }, [shopTransactions]);

    return (
        <div className="w-full space-y-3 font-sans">
            {/* Top Free-View Header Banner (3D Depth Shadowing, No Box Outlines) */}
            <div className="relative rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
                    {/* Left Brand & Live HUD */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/25 via-zinc-900 to-zinc-950 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-mono">
                                    Tactical Armory POS
                                </h2>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 shadow-inner">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    {isSupabaseConfigured() ? 'LIVE CLOUD SYNC' : 'LOCAL REGISTER'}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">
                                    STATION #01 &bull; {currentTime}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                                Realtime counter sales, barcode scanning, player gear allocations, and live audit ledger
                            </p>
                        </div>
                    </div>

                    {/* Right Action & Sub-view Strip */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {/* Audio Toggle */}
                        <button
                            onClick={() => setSoundEnabled(v => !v)}
                            title={soundEnabled ? 'Mute Register Beeps' : 'Enable Register Beeps'}
                            className="p-2 rounded-2xl bg-zinc-900/90 text-zinc-400 hover:text-white shadow-[0_6px_16px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all"
                        >
                            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                        </button>

                        {/* SQL Snippet Trigger */}
                        <button
                            onClick={() => setShowSqlModal(true)}
                            className="px-3 py-2 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 hover:from-blue-800/60 hover:to-cyan-800/60 text-cyan-300 shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(56,189,248,0.2)] transition-all"
                        >
                            <Database className="w-3.5 h-3.5 text-cyan-400" />
                            <span>SQL Live Sync</span>
                        </button>

                        {/* Parked Carts Button */}
                        {parkedSales.length > 0 && (
                            <button
                                onClick={() => setShowParkedModal(true)}
                                className="px-3 py-2 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 bg-amber-600/30 text-amber-300 shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(245,158,11,0.2)] animate-pulse transition-all"
                            >
                                <PauseCircle className="w-3.5 h-3.5" />
                                <span>Held Carts ({parkedSales.length})</span>
                            </button>
                        )}

                        {/* Sub-view Navigation */}
                        <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-2xl shadow-inner">
                            <button
                                onClick={() => setSubView('shop')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                    subView === 'shop'
                                        ? 'bg-amber-600 text-white shadow-[0_4px_16px_rgba(217,119,6,0.4)]'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>POS ({cart.length})</span>
                            </button>
                            <button
                                onClick={() => setSubView('salesHistory')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                    subView === 'salesHistory'
                                        ? 'bg-amber-600 text-white shadow-[0_4px_16px_rgba(217,119,6,0.4)]'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <History className="w-3.5 h-3.5" />
                                <span>Ledger ({shopTransactions.length})</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Micro Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/5 text-xs font-mono">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase">Today's Sales</span>
                        <span className="text-sm font-black text-emerald-400">R{totalTodayRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase">Catalog Items</span>
                        <span className="text-sm font-black text-white">{inventory.length} Stock SKU</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase">Active Cart Total</span>
                        <span className="text-sm font-black text-amber-400">R{finalTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase">Registered Players</span>
                        <span className="text-sm font-black text-cyan-400">{players.length} Operators</span>
                    </div>
                </div>
            </div>

            {/* Sub-view: Sales Ledger History */}
            {subView === 'salesHistory' && (
                <div className="space-y-3">
                    {/* Free-View Search & Filter Bar */}
                    <div className="p-4 rounded-3xl bg-zinc-950/70 shadow-[0_16px_35px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={ledgerSearch}
                                    onChange={e => setLedgerSearch(e.target.value)}
                                    placeholder="Search receipt code, customer name, callsign, or items..."
                                    className="w-full bg-zinc-900/90 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-inner border-0"
                                />
                                {ledgerSearch && (
                                    <button onClick={() => setLedgerSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs">
                                        &times;
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                                {['all', 'Cash', 'Card', 'EFT'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => setLedgerFilterMethod(m)}
                                        className={`px-3 py-1.5 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all shadow-sm ${
                                            ledgerFilterMethod === m
                                                ? 'bg-amber-600 text-white shadow-[0_4px_12px_rgba(217,119,6,0.4)]'
                                                : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        {m === 'all' ? 'All Methods' : m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Ledger List */}
                    {filteredLedger.length === 0 ? (
                        <div className="p-12 text-center rounded-3xl bg-zinc-950/50 shadow-[0_16px_35px_rgba(0,0,0,0.7)] text-zinc-500 space-y-2">
                            <FileText className="w-9 h-9 mx-auto text-zinc-600" />
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">No matching sales records</p>
                            <p className="text-[11px] text-zinc-500">Completed counter POS transactions will be displayed here in realtime.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                            {filteredLedger.map(tx => (
                                <div 
                                    key={tx.id}
                                    className="p-3.5 rounded-2xl bg-zinc-900/60 shadow-[0_10px_25px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:bg-zinc-900/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-xs font-bold text-amber-400">
                                                {tx.receiptNumber || tx.id.slice(0, 16)}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-zinc-800 text-zinc-300">
                                                {tx.paymentMethod || 'Cash'}
                                            </span>
                                            {tx.customerName && (
                                                <span className="text-xs text-zinc-300 flex items-center gap-1 font-medium">
                                                    <User className="w-3 h-3 text-zinc-500" />
                                                    {tx.customerName} {tx.customerCallsign && `"${tx.customerCallsign}"`}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400 truncate">{tx.description}</p>
                                        <p className="text-[10px] text-zinc-500 font-mono">
                                            {new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                        <div className="text-right">
                                            <span className="text-[9px] text-zinc-500 uppercase block font-mono">Total Paid</span>
                                            <span className="text-sm font-mono font-black text-emerald-400">
                                                R{Number(tx.amount || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setViewingPastReceipt(tx)}
                                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                                        >
                                            <Receipt className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Slip</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Sub-view: POS Main Terminal Screen */}
            {subView === 'shop' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                    {/* Left 7 Columns: Armory Catalog, Quick Scanner & Favorites */}
                    <div className="lg:col-span-7 space-y-3">
                        {/* Barcode Scanner & Quick Search Bar */}
                        <div className="p-3.5 rounded-3xl bg-zinc-950/70 shadow-[0_16px_35px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md space-y-2.5">
                            {/* Barcode Fast Scanner Field */}
                            <form onSubmit={handleBarcodeScan} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Barcode className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={barcodeScanInput}
                                        onChange={e => setBarcodeScanInput(e.target.value)}
                                        placeholder="Scan or type barcode / SKU then press Enter..."
                                        className="w-full bg-zinc-900/90 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono shadow-inner border-0"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-3 py-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-md"
                                >
                                    <span>Scan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowManualModal(true)}
                                    className="px-3 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Manual</span>
                                </button>
                            </form>

                            {/* Catalog Text Search & Show All Toggle */}
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Filter products by name, rental packages, specs..."
                                        className="w-full bg-zinc-900/80 rounded-2xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 border-0"
                                    />
                                    {searchTerm && (
                                        <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs">
                                            &times;
                                        </button>
                                    )}
                                </div>

                                <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer whitespace-nowrap shrink-0 pl-1 font-mono">
                                    <input
                                        type="checkbox"
                                        checked={showAllInventory}
                                        onChange={e => setShowAllInventory(e.target.checked)}
                                        className="h-3.5 w-3.5 rounded bg-zinc-800 border-0 text-amber-500 focus:ring-amber-500"
                                    />
                                    <span>All stock</span>
                                </label>
                            </div>

                            {/* Category Pills (Shrink to Fit) */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1 rounded-2xl text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                            selectedCategory === cat
                                                ? 'bg-amber-600 text-white shadow-[0_4px_12px_rgba(217,119,6,0.4)] scale-[1.02]'
                                                : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        {cat === 'all' ? `All (${displayedItems.length})` : cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick-Tap Favorites Bar (High-velocity counter items) */}
                        {quickFavorites.length > 0 && (
                            <div className="p-3 rounded-2xl bg-zinc-950/40 shadow-[0_10px_25px_rgba(0,0,0,0.5)] space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                                        <Zap className="w-3 h-3 text-amber-400" />
                                        <span>Quick Favorites (1-Tap Add)</span>
                                    </span>
                                    <span>Fast Counter Checkout</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                    {quickFavorites.map(fav => (
                                        <button
                                            key={fav.id}
                                            onClick={() => handleAddToCart(fav)}
                                            disabled={fav.stock <= 0}
                                            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-40 text-left transition-all flex items-center justify-between gap-1 shadow-sm group active:scale-95"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-white truncate group-hover:text-amber-400">
                                                    {fav.name}
                                                </p>
                                                <p className="text-[9px] font-mono text-zinc-400">
                                                    Stock: {fav.stock}
                                                </p>
                                            </div>
                                            <span className="text-xs font-mono font-black text-emerald-400 shrink-0">
                                                R{(fav.salePrice || 0).toFixed(0)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product Grid (Borderless 3D Depth Shadowing, Shrink to Fit) */}
                        {displayedItems.length === 0 ? (
                            <div className="p-12 text-center rounded-3xl bg-zinc-950/50 shadow-[0_16px_35px_rgba(0,0,0,0.7)] text-zinc-500 space-y-2">
                                <ShoppingBag className="w-9 h-9 mx-auto text-zinc-600" />
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">No matching inventory items</p>
                                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                                    Mark inventory items as "Available in Shop" in the Inventory tab or click "+ Manual" above to add ad-hoc items.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[64vh] overflow-y-auto pr-1">
                                {displayedItems.map(item => {
                                    const inCart = cart.find(c => c.inventoryId === item.id);
                                    const isOutOfStock = item.stock <= 0;
                                    const isLowStock = item.stock > 0 && item.stock <= 5;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`p-3 rounded-2xl flex flex-col justify-between transition-all group ${
                                                inCart 
                                                    ? 'bg-amber-950/20 shadow-[0_12px_28px_rgba(217,119,6,0.25),inset_0_1px_0_0_rgba(245,158,11,0.2)]' 
                                                    : isOutOfStock
                                                    ? 'bg-zinc-950/40 opacity-60 shadow-[0_8px_20px_rgba(0,0,0,0.4)]'
                                                    : 'bg-zinc-900/60 hover:bg-zinc-900/90 shadow-[0_12px_25px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                                            }`}
                                        >
                                            <div>
                                                {/* Image or Placeholder */}
                                                <div 
                                                    onClick={() => setInspectingItem(item)}
                                                    className="w-full h-24 rounded-xl bg-zinc-950 overflow-hidden mb-2 relative flex items-center justify-center cursor-pointer shadow-inner"
                                                >
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-zinc-700" />
                                                    )}
                                                    <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded-md bg-black/80 text-[8px] font-mono text-zinc-300 backdrop-blur-xs">
                                                        {item.category || 'Gear'}
                                                    </span>
                                                    {isLowStock && (
                                                        <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-amber-500/90 text-[8px] font-mono font-bold text-black">
                                                            LOW ({item.stock})
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title */}
                                                <h4 
                                                    onClick={() => setInspectingItem(item)}
                                                    className="font-bold text-xs text-white truncate cursor-pointer hover:text-amber-400 transition-colors"
                                                    title={item.name}
                                                >
                                                    {item.name}
                                                </h4>

                                                {/* Rental inclusions badge */}
                                                {item.rentalIncludes && (
                                                    <p className="text-[9px] text-amber-300/80 truncate mt-0.5" title={item.rentalIncludes}>
                                                        Inc: {item.rentalIncludes}
                                                    </p>
                                                )}

                                                {/* Stock & Price */}
                                                <div className="flex items-center justify-between text-[10px] font-mono mt-1.5">
                                                    <span className={`font-bold ${isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-zinc-400'}`}>
                                                        {isOutOfStock ? 'Out of Stock' : `${item.stock} in stock`}
                                                    </span>
                                                    <span className="text-xs font-black text-emerald-400">
                                                        R{(item.salePrice || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-2.5 pt-2 border-t border-white/5">
                                                {inCart ? (
                                                    <div className="flex items-center justify-between bg-zinc-950 rounded-xl p-1 shadow-inner">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(inCart.id, inCart.quantity - 1)}
                                                            className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center text-xs active:scale-90 transition-transform"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="font-mono text-xs font-bold text-amber-400 px-1">
                                                            {inCart.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleAddToCart(item)}
                                                            disabled={inCart.quantity >= item.stock}
                                                            className="w-6 h-6 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white flex items-center justify-center text-xs active:scale-90 transition-transform"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddToCart(item)}
                                                        disabled={isOutOfStock}
                                                        className="w-full py-1.5 px-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-zinc-800/90 hover:bg-amber-600 disabled:opacity-40 text-white flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right 5 Columns: Register Checkout Pane (3D Depth Shadowing, No Box Outlines) */}
                    <div className="lg:col-span-5 space-y-3">
                        <div className="p-4 rounded-3xl bg-zinc-950/80 shadow-[0_24px_55px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl space-y-3">
                            {/* Cart Register Header */}
                            <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                                    <h3 className="font-black text-xs sm:text-sm text-white uppercase tracking-wider font-mono">
                                        Sale Register ({cart.length})
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {cart.length > 0 && (
                                        <>
                                            <button
                                                onClick={handleParkSale}
                                                className="text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-all"
                                                title="Hold current sale and free register for next customer"
                                            >
                                                <PauseCircle className="w-3 h-3" />
                                                <span>Park</span>
                                            </button>
                                            <button
                                                onClick={handleClearCart}
                                                className="text-[10px] font-mono text-zinc-500 hover:text-red-400 flex items-center gap-1 px-1.5 py-0.5 transition-colors"
                                                title="Clear current cart"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                <span>Clear</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Cart Items List */}
                            {cart.length === 0 ? (
                                <div className="py-8 text-center text-zinc-500 rounded-2xl bg-zinc-900/30 shadow-inner">
                                    <ShoppingCart className="w-7 h-7 mx-auto mb-1.5 text-zinc-700" />
                                    <p className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Cart is Empty</p>
                                    <p className="text-[10px] text-zinc-600 mt-0.5">Scan SKU or click "Add to Cart" to start a sale</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                                    {cart.map(item => (
                                        <div
                                            key={item.id}
                                            className="p-2 rounded-xl bg-zinc-900/80 shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.04)] flex items-center justify-between gap-2 text-xs"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-white truncate text-xs">{item.name}</span>
                                                    {item.isManual && (
                                                        <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-purple-900/60 text-purple-300">
                                                            Manual
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                                                    <span>R{item.price.toFixed(2)} ea</span>
                                                    <span>&bull;</span>
                                                    <span className="text-emerald-400 font-bold">
                                                        R{item.total.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    className="w-5 h-5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center text-xs active:scale-90 transition-transform"
                                                >
                                                    -
                                                </button>
                                                <span className="font-mono text-xs font-bold text-white w-5 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="w-5 h-5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center text-xs active:scale-90 transition-transform"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveFromCart(item.id)}
                                                    className="text-zinc-500 hover:text-red-400 p-1 transition-colors ml-0.5"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Player Allocation Option */}
                            <div className="pt-2 border-t border-white/5 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                                        <User className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Allocate to Operator</span>
                                    </label>
                                    {selectedPlayer && (
                                        <button
                                            onClick={() => { setSelectedPlayerId(''); setPlayerSearchQuery(''); }}
                                            className="text-[10px] font-mono text-red-400 hover:underline"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>

                                {selectedPlayer ? (
                                    <div className="p-2.5 rounded-2xl bg-emerald-950/40 shadow-inner flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
                                                {selectedPlayer.name[0]}{selectedPlayer.surname[0]}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white leading-tight">
                                                    {selectedPlayer.name} {selectedPlayer.surname}
                                                    {selectedPlayer.callsign && ` "${selectedPlayer.callsign}"`}
                                                </p>
                                                <p className="text-[10px] text-emerald-400 font-mono">
                                                    [{selectedPlayer.playerCode || 'NO-CODE'}] &bull; Expense linked
                                                </p>
                                            </div>
                                        </div>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            value={playerSearchQuery}
                                            onChange={e => setPlayerSearchQuery(e.target.value)}
                                            placeholder="Search registered operator (Callsign, Name, Code)..."
                                            className="w-full bg-zinc-900/90 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 border-0 shadow-inner"
                                        />
                                        {playerSearchQuery.trim() && (
                                            <div className="max-h-28 overflow-y-auto bg-zinc-950 rounded-xl p-1 space-y-0.5 shadow-xl">
                                                {filteredPlayers.length === 0 ? (
                                                    <p className="p-2 text-[10px] text-zinc-500 italic text-center">No matching operator found</p>
                                                ) : (
                                                    filteredPlayers.map(p => (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => {
                                                                setSelectedPlayerId(p.id);
                                                                setPlayerSearchQuery('');
                                                            }}
                                                            className="w-full text-left p-1.5 rounded-lg hover:bg-zinc-800 flex items-center justify-between text-xs text-zinc-300 transition-colors"
                                                        >
                                                            <span className="font-medium text-white truncate">
                                                                {p.name} {p.surname} {p.callsign ? `"${p.callsign}"` : ''}
                                                            </span>
                                                            <span className="font-mono text-[10px] text-zinc-400 shrink-0 ml-1">
                                                                [{p.playerCode}]
                                                            </span>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Discount Presets & Custom Input */}
                            <div className="pt-2 border-t border-white/5 space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-mono">
                                    <span className="text-zinc-400 text-[11px]">Quick Discount:</span>
                                    <div className="flex items-center gap-1 w-24">
                                        <span className="text-zinc-500 text-xs">-R</span>
                                        <input
                                            type="number"
                                            value={discountAmount || ''}
                                            onChange={e => {
                                                setDiscountPreset(null);
                                                setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0));
                                            }}
                                            placeholder="0"
                                            className="w-full bg-zinc-900 rounded-lg px-2 py-1 text-right text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 border-0"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none font-mono">
                                    {[0, 5, 10, 15, 20].map(pct => (
                                        <button
                                            key={pct}
                                            type="button"
                                            onClick={() => handleApplyDiscountPreset(pct)}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                                                discountPreset === pct || (pct === 0 && discountAmount === 0 && discountPreset === null)
                                                    ? 'bg-amber-600 text-white shadow-sm'
                                                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                                            }`}
                                        >
                                            {pct === 0 ? 'None' : `${pct}%`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Method Selector */}
                            <div className="pt-2 border-t border-white/5 space-y-2">
                                <label className="text-xs font-bold text-white flex items-center justify-between font-mono">
                                    <span>Tender Method</span>
                                    <span className="text-[9px] text-zinc-500">Select payment channel</span>
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => { playRegisterBeep(880, 0.04); setPaymentMethod('Cash'); }}
                                        className={`py-2 px-1.5 rounded-2xl text-xs font-mono font-bold flex flex-col items-center gap-1 transition-all ${
                                            paymentMethod === 'Cash'
                                                ? 'bg-emerald-600 text-white shadow-[0_6px_20px_rgba(16,185,129,0.4)] scale-[1.02]'
                                                : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        <Banknote className="w-4 h-4" />
                                        <span>Cash</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { playRegisterBeep(880, 0.04); setPaymentMethod('Card'); }}
                                        className={`py-2 px-1.5 rounded-2xl text-xs font-mono font-bold flex flex-col items-center gap-1 transition-all ${
                                            paymentMethod === 'Card'
                                                ? 'bg-blue-600 text-white shadow-[0_6px_20px_rgba(37,99,235,0.4)] scale-[1.02]'
                                                : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        <span>Card (POS)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { playRegisterBeep(880, 0.04); setPaymentMethod('EFT'); }}
                                        className={`py-2 px-1.5 rounded-2xl text-xs font-mono font-bold flex flex-col items-center gap-1 transition-all ${
                                            paymentMethod === 'EFT'
                                                ? 'bg-purple-600 text-white shadow-[0_6px_20px_rgba(147,51,234,0.4)] scale-[1.02]'
                                                : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>EFT</span>
                                    </button>
                                </div>

                                {/* Amount Paid & Change Calculator */}
                                <div className="p-3 rounded-2xl bg-zinc-900/90 shadow-inner space-y-2 mt-2">
                                    <div className="flex items-center justify-between text-xs font-mono">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                                                <span>Total Tendered ({paymentMethod}):</span>
                                            </span>
                                            <span className="text-[9px] text-zinc-500">
                                                Received from customer
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 w-32">
                                            <span className="text-zinc-500 text-xs font-mono font-bold">R</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={amountPaidManual}
                                                onChange={e => {
                                                    setAmountPaidManual(e.target.value);
                                                    setCashTendered(e.target.value);
                                                }}
                                                placeholder={finalTotal > 0 ? finalTotal.toFixed(2) : '0.00'}
                                                className="w-full bg-zinc-950 rounded-xl px-2.5 py-1 text-right text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 border-0"
                                            />
                                        </div>
                                    </div>

                                    {/* Banknotes & Exact Tender Presets */}
                                    {finalTotal > 0 && (
                                        <div className="space-y-1.5 pt-1.5 border-t border-white/5 text-[10px] font-mono">
                                            <div className="flex items-center gap-1 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={handleSetExactAmount}
                                                    className="px-2 py-0.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 font-bold transition-colors shadow-sm"
                                                    title="Set to exact amount"
                                                >
                                                    Exact: R{finalTotal.toFixed(2)}
                                                </button>

                                                {/* Smart Round-ups */}
                                                {smartRoundups.map(roundVal => (
                                                    <button
                                                        key={roundVal}
                                                        type="button"
                                                        onClick={() => handleSetCustomTender(roundVal)}
                                                        className="px-1.5 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors shadow-sm"
                                                    >
                                                        R{roundVal}
                                                    </button>
                                                ))}

                                                {amountPaidManual && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAmountPaidManual('');
                                                            setCashTendered('');
                                                        }}
                                                        className="ml-auto text-zinc-500 hover:text-zinc-300 text-[10px] flex items-center gap-0.5"
                                                    >
                                                        <RotateCcw className="w-2.5 h-2.5" />
                                                        <span>Reset</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* SA Banknote Increments */}
                                            <div className="flex items-center gap-1 text-zinc-400">
                                                <span className="text-zinc-500 shrink-0 text-[9px]">Add Note:</span>
                                                {[10, 20, 50, 100, 200].map(inc => (
                                                    <button
                                                        key={inc}
                                                        type="button"
                                                        onClick={() => handleAddPresetIncrement(inc)}
                                                        className="px-1.5 py-0.5 rounded-md bg-zinc-950 hover:bg-zinc-800 text-zinc-300 font-mono text-[9px] transition-colors shadow-sm active:scale-95"
                                                    >
                                                        +R{inc}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Real-time Change Due HUD */}
                                    {parseFloat(amountPaidManual) > 0 && (
                                        <div className="pt-2 border-t border-white/5 font-mono">
                                            {parseFloat(amountPaidManual) > finalTotal ? (
                                                <div className="p-2 rounded-xl bg-emerald-950/60 shadow-[0_4px_16px_rgba(16,185,129,0.3)] text-emerald-300 space-y-0.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-black uppercase tracking-wider text-[10px] flex items-center gap-1 text-emerald-400">
                                                            <Coins className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                                            Change to Return:
                                                        </span>
                                                        <span className="font-mono font-black text-sm text-emerald-300">
                                                            R{changeDue.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <p className="text-[9px] text-emerald-400/90 leading-tight">
                                                        Hand <strong>R{changeDue.toFixed(2)}</strong> back to customer.
                                                    </p>
                                                </div>
                                            ) : parseFloat(amountPaidManual) < finalTotal ? (
                                                <div className="p-2 rounded-xl bg-amber-950/50 shadow-[0_4px_16px_rgba(245,158,11,0.2)] text-amber-300 space-y-0.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-black uppercase tracking-wider text-[10px] flex items-center gap-1 text-amber-400">
                                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                                            Shortage Balance:
                                                        </span>
                                                        <span className="font-mono font-black text-xs text-amber-400">
                                                            -R{(finalTotal - parseFloat(amountPaidManual)).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-1.5 rounded-xl bg-zinc-950 text-emerald-400 flex items-center justify-between text-xs">
                                                    <span className="flex items-center gap-1 font-bold text-[10px]">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                        Exact Amount Tendered
                                                    </span>
                                                    <span className="font-mono font-black text-xs">
                                                        R0.00 Change
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Optional Sale Reference Note */}
                            <input
                                type="text"
                                value={saleNotes}
                                onChange={e => setSaleNotes(e.target.value)}
                                placeholder="Optional reference notes (e.g. Field bay 4, rental pack #1)..."
                                className="w-full bg-zinc-900/80 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 border-0 shadow-inner"
                            />

                            {/* Financial Summary & Total */}
                            <div className="p-3 rounded-2xl bg-zinc-900/90 shadow-inner space-y-1 text-xs font-mono">
                                <div className="flex justify-between text-zinc-400">
                                    <span>Subtotal:</span>
                                    <span className="font-bold text-zinc-200">R{cartSubtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-amber-400">
                                        <span>Discount:</span>
                                        <span className="font-bold">-R{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-1.5 border-t border-white/5 text-sm">
                                    <span className="font-black text-white uppercase tracking-wider">TOTAL PAYABLE:</span>
                                    <span className="text-base font-black text-emerald-400">
                                        R{finalTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Finalize Sale Button */}
                            <button
                                onClick={handleCompleteSale}
                                disabled={cart.length === 0 || isProcessing}
                                className="w-full py-3 px-3 rounded-2xl font-mono font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white shadow-[0_12px_30px_rgba(16,185,129,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{isProcessing ? 'Processing Transaction...' : `Finalize Sale • R${finalTotal.toFixed(2)}`}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Held / Parked Carts Modal */}
            {showParkedModal && (
                <Modal isOpen={true} onClose={() => setShowParkedModal(false)} title="Parked Sales Register">
                    <div className="space-y-3 text-xs font-mono">
                        <p className="text-zinc-400 text-[11px]">
                            Recall a previously parked sale to resume checkout on the main register.
                        </p>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {parkedSales.map(park => (
                                <div
                                    key={park.id}
                                    className="p-3 rounded-2xl bg-zinc-900/90 shadow-md flex items-center justify-between gap-3"
                                >
                                    <div>
                                        <p className="font-bold text-white text-xs">{park.label}</p>
                                        <p className="text-[10px] text-zinc-400">
                                            Parked at {park.savedAt} &bull; {park.cart.length} items &bull; Total: R{park.cart.reduce((s, c) => s + c.total, 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => handleRecallParkedSale(park)}
                                            className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                                        >
                                            <PlayCircle className="w-3.5 h-3.5" />
                                            <span>Recall</span>
                                        </button>
                                        <button
                                            onClick={() => setParkedSales(prev => prev.filter(p => p.id !== park.id))}
                                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}

            {/* SQL Live Sync Setup Modal */}
            {showSqlModal && (
                <Modal isOpen={true} onClose={() => setShowSqlModal(false)} title="Supabase SQL Live Sync Setup">
                    <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/40 to-cyan-950/40 shadow-inner flex items-start gap-2.5">
                            <Database className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-white text-xs">Shop Point of Sale & Live Sync Migration</h4>
                                <p className="text-[11px] text-zinc-300 leading-relaxed mt-0.5">
                                    Execute this script in your Supabase SQL Editor. It creates tables, configures column aliases for transactions and inventory, enables Row Level Security open policies, sets Full Replica Identity, and hooks into Realtime Broadcast channels for instant sync.
                                </p>
                            </div>
                        </div>

                        {/* Code box */}
                        <div className="relative">
                            <pre className="p-3 rounded-2xl bg-zinc-950 text-cyan-300 font-mono text-[10px] leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap select-all shadow-inner">
                                {SHOP_POS_SQL_SNIPPET}
                            </pre>
                            <button
                                onClick={handleCopySql}
                                className="absolute top-2 right-2 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                            >
                                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                            </button>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-[10px] text-zinc-500 font-mono">
                                Safe & Idempotent &bull; Will not erase existing data
                            </span>
                            <Button variant="secondary" size="sm" onClick={() => setShowSqlModal(false)}>
                                Done
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Manual Sale Entry Modal */}
            {showManualModal && (
                <Modal isOpen={true} onClose={() => setShowManualModal(false)} title="Manual Counter Sale Entry">
                    <form onSubmit={handleAddManualItem} className="space-y-3 text-xs">
                        <p className="text-zinc-400 text-[11px]">
                            Add an unlisted, field-service, or custom rental charge to the active cart with manual pricing.
                        </p>

                        <div>
                            <label className="block text-zinc-400 mb-1">Item Title / Description *</label>
                            <input
                                type="text"
                                required
                                value={manualItemForm.name}
                                onChange={e => setManualItemForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Field Bucking Repair / 0.28g Bio BB Bag"
                                className="w-full bg-zinc-900 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 border-0"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-zinc-400 mb-1">Unit Price (ZAR) *</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={manualItemForm.price}
                                    onChange={e => setManualItemForm(f => ({ ...f, price: e.target.value }))}
                                    placeholder="0.00"
                                    className="w-full bg-zinc-900 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 border-0"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 mb-1">Quantity *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={manualItemForm.quantity}
                                    onChange={e => setManualItemForm(f => ({ ...f, quantity: e.target.value }))}
                                    className="w-full bg-zinc-900 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 border-0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-zinc-400 mb-1">Category / Group</label>
                            <select
                                value={manualItemForm.category}
                                onChange={e => setManualItemForm(f => ({ ...f, category: e.target.value }))}
                                className="w-full bg-zinc-900 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 border-0"
                            >
                                <option value="Field Consumable">Field Consumable (BBs, Gas, Batteries)</option>
                                <option value="Tech Service">Tech Service / Field Repair</option>
                                <option value="Gear Rental">Ad-hoc Gear Rental</option>
                                <option value="Food & Beverage">Food & Refreshments</option>
                                <option value="Miscellaneous">Miscellaneous</option>
                            </select>
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <Button type="button" variant="secondary" size="sm" onClick={() => setShowManualModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="sm" className="!bg-amber-600 hover:!bg-amber-500">
                                Add to Cart
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Inspect Item Details Modal */}
            {inspectingItem && (
                <Modal isOpen={true} onClose={() => setInspectingItem(null)} title={inspectingItem.name}>
                    <div className="space-y-3 text-xs">
                        {inspectingItem.imageUrl && (
                            <div className="w-full h-48 rounded-2xl bg-zinc-950 overflow-hidden flex items-center justify-center shadow-inner">
                                <img
                                    src={inspectingItem.imageUrl}
                                    alt={inspectingItem.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-zinc-900/60 shadow-sm font-mono">
                            <div>
                                <span className="text-[10px] text-zinc-400 block">Retail Price:</span>
                                <span className="text-base font-black text-emerald-400">
                                    R{(inspectingItem.salePrice || 0).toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-400 block">Stock Available:</span>
                                <span className="text-base font-bold text-white">
                                    {inspectingItem.stock} units
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-400 block">Category:</span>
                                <span className="text-xs text-zinc-200">{inspectingItem.category}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-400 block">Condition:</span>
                                <span className="text-xs text-zinc-200">{inspectingItem.condition}</span>
                            </div>
                        </div>

                        {inspectingItem.rentalIncludes && (
                            <div className="p-2.5 rounded-2xl bg-amber-950/30 text-amber-200">
                                <h5 className="text-[11px] font-bold uppercase mb-0.5">Package Inclusions</h5>
                                <p className="text-[11px]">{inspectingItem.rentalIncludes}</p>
                            </div>
                        )}

                        {inspectingItem.description && (
                            <div>
                                <h5 className="text-[11px] font-bold text-zinc-400 uppercase mb-1">Specifications</h5>
                                <p className="text-zinc-300 leading-relaxed bg-zinc-900/40 p-2.5 rounded-2xl">
                                    {inspectingItem.description}
                                </p>
                            </div>
                        )}

                        <div className="pt-2 flex justify-between items-center">
                            <Button variant="secondary" size="sm" onClick={() => setInspectingItem(null)}>
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                disabled={inspectingItem.stock <= 0}
                                onClick={() => {
                                    handleAddToCart(inspectingItem);
                                    setInspectingItem(null);
                                }}
                                className="!bg-amber-600 hover:!bg-amber-500"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Completed Thermal Receipt Modal (Realism Print Styling) */}
            {completedSale && (
                <Modal isOpen={true} onClose={() => setCompletedSale(null)} title="Transaction Completed">
                    <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-2xl bg-emerald-950/40 shadow-sm text-center space-y-0.5">
                            <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
                            <h4 className="text-sm font-bold text-emerald-300">Sale Successfully Finalized</h4>
                            <p className="text-[11px] text-zinc-300 font-mono">
                                Receipt #{completedSale.receiptNumber}
                            </p>
                        </div>

                        {/* Realistic Thermal Receipt Body */}
                        <div className="p-5 rounded-2xl bg-zinc-950 text-zinc-200 font-mono text-xs shadow-2xl space-y-3 border-t-4 border-amber-500 print:bg-white print:text-black">
                            <div className="text-center pb-2 border-b border-zinc-800 space-y-0.5">
                                <h3 className="font-black text-sm uppercase text-white tracking-widest">
                                    {companyDetails?.name || 'BOSJOL TACTICAL AIRSOFT'}
                                </h3>
                                <p className="text-[10px] text-zinc-400 uppercase">Armory Counter Terminal #01</p>
                                <p className="text-[9px] text-zinc-500">
                                    {new Date(completedSale.date).toLocaleString()}
                                </p>
                            </div>

                            <div className="text-[11px] space-y-0.5">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Customer:</span>
                                    <span className="text-white font-bold">{completedSale.customerName || 'Walk-in'}</span>
                                </div>
                                {completedSale.customerCode && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Player Code:</span>
                                        <span className="text-zinc-300">{completedSale.customerCode}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Payment Channel:</span>
                                    <span className="text-amber-400 font-bold">{completedSale.paymentMethod}</span>
                                </div>
                            </div>

                            {/* Itemized Table */}
                            <div className="border-t border-b border-zinc-800 py-2 space-y-1">
                                {completedSale.items?.map((it, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs">
                                        <div className="truncate pr-2">
                                            <span>{it.quantity}x {it.name}</span>
                                        </div>
                                        <span className="text-white shrink-0">R{it.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Financial Breakdown */}
                            <div className="space-y-1 text-xs">
                                {Number(completedSale.subtotal || 0) !== Number(completedSale.amount) && (
                                    <div className="flex justify-between text-zinc-400">
                                        <span>Subtotal:</span>
                                        <span>R{Number(completedSale.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                {Number(completedSale.discount || 0) > 0 && (
                                    <div className="flex justify-between text-amber-400">
                                        <span>Discount:</span>
                                        <span>-R{Number(completedSale.discount || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-bold text-emerald-400 pt-1 border-t border-zinc-800">
                                    <span>GRAND TOTAL:</span>
                                    <span>R{Number(completedSale.amount || 0).toFixed(2)}</span>
                                </div>
                                {completedSale.amountTendered !== undefined && (
                                    <div className="flex justify-between text-xs text-zinc-300 pt-1 border-t border-zinc-800/60">
                                        <span>Amount Received ({completedSale.paymentMethod}):</span>
                                        <span className="font-mono">R{Number(completedSale.amountTendered).toFixed(2)}</span>
                                    </div>
                                )}
                                {completedSale.changeDue !== undefined && Number(completedSale.changeDue) > 0 && (
                                    <div className="flex justify-between text-xs text-emerald-400 font-bold">
                                        <span>Change Returned:</span>
                                        <span className="font-mono">R{Number(completedSale.changeDue).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Visual Barcode Realism */}
                            <div className="pt-2 text-center border-t border-zinc-800 space-y-1">
                                <div className="h-8 flex justify-center items-center gap-0.5 opacity-70">
                                    {[2, 4, 1, 3, 2, 5, 1, 4, 3, 1, 2, 4, 2, 1, 3, 5, 2, 1, 4, 3, 2, 4].map((w, i) => (
                                        <div key={i} className="h-full bg-zinc-300" style={{ width: `${w * 1.5}px` }} />
                                    ))}
                                </div>
                                <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
                                    {completedSale.receiptNumber}
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-between gap-2">
                            <Button variant="secondary" size="sm" onClick={() => window.print()} className="flex items-center gap-1">
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print Thermal Slip</span>
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setCompletedSale(null)} className="!bg-emerald-600 hover:!bg-emerald-500">
                                <span>New Transaction</span>
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Past Receipt Inspection Modal */}
            {viewingPastReceipt && (
                <Modal isOpen={true} onClose={() => setViewingPastReceipt(null)} title={`Receipt: ${viewingPastReceipt.receiptNumber || viewingPastReceipt.id}`}>
                    <div className="space-y-3 text-xs">
                        <div className="p-5 rounded-2xl bg-zinc-950 font-mono text-zinc-300 space-y-3 shadow-xl">
                            <div className="text-center border-b border-zinc-800 pb-2 space-y-0.5">
                                <h3 className="font-bold text-sm uppercase text-white">
                                    {companyDetails?.name || 'BOSJOL TACTICAL AIRSOFT'}
                                </h3>
                                <p className="text-[10px] text-zinc-400">Receipt #{viewingPastReceipt.receiptNumber}</p>
                                <p className="text-[9px] text-zinc-500">{new Date(viewingPastReceipt.date).toLocaleString()}</p>
                            </div>

                            <div className="text-[11px] space-y-0.5">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Customer:</span>
                                    <span className="text-white font-bold">{viewingPastReceipt.customerName || 'Walk-in'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Payment Method:</span>
                                    <span className="text-amber-400 font-bold">{viewingPastReceipt.paymentMethod || 'Cash'}</span>
                                </div>
                            </div>

                            <div className="border-t border-b border-zinc-800 py-2 space-y-1">
                                {viewingPastReceipt.items && viewingPastReceipt.items.length > 0 ? (
                                    viewingPastReceipt.items.map((it, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                            <span className="truncate pr-2">{it.quantity}x {it.name}</span>
                                            <span className="text-white shrink-0">R{it.total.toFixed(2)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex justify-between items-center text-xs">
                                        <span>{viewingPastReceipt.description}</span>
                                        <span className="text-white">R{Number(viewingPastReceipt.amount).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between text-sm font-bold text-emerald-400 pt-1">
                                <span>TOTAL BILLED:</span>
                                <span>R{Number(viewingPastReceipt.amount || 0).toFixed(2)}</span>
                            </div>
                            {viewingPastReceipt.amountTendered !== undefined && (
                                <div className="flex justify-between text-xs text-zinc-300 pt-1 border-t border-zinc-800/60">
                                    <span>Total Paid ({viewingPastReceipt.paymentMethod || 'Cash'}):</span>
                                    <span className="font-mono font-bold text-white">R{Number(viewingPastReceipt.amountTendered).toFixed(2)}</span>
                                </div>
                            )}
                            {viewingPastReceipt.changeDue !== undefined && Number(viewingPastReceipt.changeDue) > 0 && (
                                <div className="flex justify-between text-xs text-emerald-400 font-bold">
                                    <span>Change Returned:</span>
                                    <span className="font-mono">R{Number(viewingPastReceipt.changeDue).toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setViewingPastReceipt(null)}>
                                Close
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => window.print()} className="flex items-center gap-1">
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print Slip</span>
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
