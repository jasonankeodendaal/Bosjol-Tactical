import React, { useState, useMemo } from 'react';
import type { InventoryItem, Player, Transaction, SaleItem, SalePaymentMethod, CompanyDetails } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
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
    UserCheck, 
    User, 
    Printer, 
    CheckCircle2, 
    ArrowRight, 
    Package, 
    Tag, 
    Sparkles, 
    Receipt, 
    History, 
    FileText, 
    X,
    Filter,
    Clock,
    DollarSign,
    Check,
    AlertTriangle,
    Eye
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

export const AdminShopTab: React.FC<AdminShopTabProps> = ({
    inventory,
    players,
    transactions,
    updateDoc,
    addDoc,
    companyDetails,
}) => {
    // Sub-view: 'shop' or 'salesHistory'
    const [subView, setSubView] = useState<'shop' | 'salesHistory'>('shop');

    // Filter & Search state for shop catalog
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showAllInventory, setShowAllInventory] = useState<boolean>(false);

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
    const [playerSearchQuery, setPlayerSearchQuery] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<SalePaymentMethod>('Cash');
    const [cashTendered, setCashTendered] = useState<string>('');
    const [amountPaidManual, setAmountPaidManual] = useState<string>('');
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [saleNotes, setSaleNotes] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // Manual item modal
    const [showManualModal, setShowManualModal] = useState<boolean>(false);
    const [manualItemForm, setManualItemForm] = useState({
        name: '',
        price: '',
        quantity: '1',
        category: 'Field Consumable',
        notes: '',
    });

    // Completed receipt modal
    const [completedSale, setCompletedSale] = useState<Transaction | null>(null);
    const [inspectingItem, setInspectingItem] = useState<InventoryItem | null>(null);
    const [viewingPastReceipt, setViewingPastReceipt] = useState<Transaction | null>(null);

    // Available categories from inventory
    const categories = useMemo(() => {
        const set = new Set<string>();
        inventory.forEach(i => {
            if (i.category) set.add(i.category);
        });
        return ['all', ...Array.from(set)];
    }, [inventory]);

    // Filtered shop items
    const displayedItems = useMemo(() => {
        return inventory.filter(item => {
            // Must be available in shop, unless admin toggled "show all inventory"
            if (!showAllInventory && !item.availableInShop) return false;

            // Search matching
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const matchName = item.name.toLowerCase().includes(q);
                const matchSku = (item.sku || '').toLowerCase().includes(q);
                const matchDesc = (item.description || '').toLowerCase().includes(q);
                const matchSerial = (item.serialNumber || '').toLowerCase().includes(q);
                if (!matchName && !matchSku && !matchDesc && !matchSerial) return false;
            }

            // Category filter
            if (selectedCategory !== 'all' && item.category !== selectedCategory) {
                return false;
            }

            return true;
        });
    }, [inventory, showAllInventory, searchTerm, selectedCategory]);

    // Filtered players for allocation
    const filteredPlayers = useMemo(() => {
        if (!playerSearchQuery.trim()) return players.slice(0, 20);
        const q = playerSearchQuery.toLowerCase();
        return players.filter(p => 
            p.name.toLowerCase().includes(q) ||
            p.surname.toLowerCase().includes(q) ||
            (p.callsign || '').toLowerCase().includes(q) ||
            (p.playerCode || '').toLowerCase().includes(q)
        ).slice(0, 20);
    }, [players, playerSearchQuery]);

    // Selected player object
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

    // Add item from catalog to cart
    const handleAddToCart = (item: InventoryItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.inventoryId === item.id);
            if (existing) {
                // Check stock limit
                if (existing.quantity >= item.stock) {
                    alert(`Cannot add more than available stock (${item.stock}) for "${item.name}".`);
                    return prev;
                }
                return prev.map(i => 
                    i.inventoryId === item.id 
                        ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
                        : i
                );
            } else {
                if (item.stock <= 0) {
                    alert(`"${item.name}" is currently out of stock.`);
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

    // Update quantity of cart item
    const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
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
        setCart(prev => prev.filter(i => i.id !== cartItemId));
    };

    const handleClearCart = () => {
        if (cart.length === 0) return;
        if (window.confirm('Clear all items from current cart?')) {
            setCart([]);
            setDiscountAmount(0);
            setCashTendered('');
            setAmountPaidManual('');
            setSaleNotes('');
            setSelectedPlayerId('');
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
    };

    // Complete POS Sale
    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            alert('Your cart is empty. Add items before completing the sale.');
            return;
        }

        if (paymentMethod === 'Cash' && cashTendered) {
            const tendered = parseFloat(cashTendered);
            if (!isNaN(tendered) && tendered < finalTotal) {
                alert(`Cash tendered (R${tendered.toFixed(2)}) is less than total amount (R${finalTotal.toFixed(2)}).`);
                return;
            }
        }

        setIsProcessing(true);

        try {
            const timestamp = new Date();
            const dateStr = timestamp.toISOString();
            const dateCode = dateStr.slice(0, 10).replace(/-/g, '');
            const randomCode = Math.floor(1000 + Math.random() * 9000);
            const receiptCode = `BOS-POS-${dateCode}-${randomCode}`;
            const transactionId = `tx_pos_${Date.now()}`;

            // Build sale items array
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

            // Summary description
            const description = cart.length === 1 
                ? `Shop Sale: ${cart[0].name} (x${cart[0].quantity})`
                : `Shop Sale: ${cart.length} items (${cart[0].name}, etc.)`;

            // Prepare transaction record
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
                amountTendered: parseFloat(amountPaidManual) > 0 ? parseFloat(amountPaidManual) : finalTotal,
                changeDue: changeDue,
                notes: saleNotes.trim(),
                cashierName: 'Admin Counter',
                playerId: selectedPlayer?.id,
                relatedPlayerId: selectedPlayer?.id,
                customerName: selectedPlayer ? `${selectedPlayer.name} ${selectedPlayer.surname}` : 'Walk-in Operator',
                customerCallsign: selectedPlayer?.callsign || '',
                customerCode: selectedPlayer?.playerCode || '',
            };

            // 1. Deduct stock from inventory for catalog items
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

            // 2. Add transaction to Supabase / Local storage
            await addDoc('transactions', newTransaction);

            // 3. Show success receipt
            setCompletedSale(newTransaction);

            // 4. Reset Cart
            setCart([]);
            setDiscountAmount(0);
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

    // Past Shop Transactions
    const shopTransactions = useMemo(() => {
        return transactions
            .filter(t => t.type === 'Retail Revenue' || (t.items && t.items.length > 0))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions]);

    // Print Receipt Handler
    const handlePrintReceipt = () => {
        window.print();
    };

    return (
        <div className="w-full space-y-4">
            {/* Header and Live KPI Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/10 text-amber-400 border border-amber-500/30">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                                Tactical Armory & POS Shop
                            </h2>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                LIVE POS
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Counter sales, inventory checkout, custom manual sales, and player expense allocations
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSubView('shop')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                            subView === 'shop'
                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Point of Sale ({cart.length})</span>
                    </button>
                    <button
                        onClick={() => setSubView('salesHistory')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                            subView === 'salesHistory'
                                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                    >
                        <History className="w-3.5 h-3.5" />
                        <span>Sales Ledger ({shopTransactions.length})</span>
                    </button>
                </div>
            </div>

            {/* Sub-view: Sales History Ledger */}
            {subView === 'salesHistory' && (
                <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-400" />
                                <span>Recent Shop Sales & Receipts</span>
                            </h3>
                            <p className="text-[11px] text-zinc-400">Itemized audit ledger of all counter sales and retail purchases</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-zinc-400">Total Recorded Sales:</span>
                            <p className="text-base font-mono font-black text-emerald-400">
                                R{shopTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {shopTransactions.length === 0 ? (
                        <div className="p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800/80 text-zinc-500">
                            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                            <p className="text-sm font-medium">No shop sales recorded yet.</p>
                            <p className="text-xs text-zinc-500 mt-1">Completed sales in Point of Sale will automatically appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                            {shopTransactions.map(tx => (
                                <div 
                                    key={tx.id}
                                    className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-amber-400">
                                                {tx.receiptNumber || tx.id.slice(0, 14)}
                                            </span>
                                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
                                                {tx.paymentMethod || 'Cash'}
                                            </span>
                                            {tx.customerName && (
                                                <span className="text-xs text-zinc-300 flex items-center gap-1">
                                                    <User className="w-3 h-3 text-zinc-500" />
                                                    {tx.customerName} {tx.customerCallsign && `"${tx.customerCallsign}"`}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400">{tx.description}</p>
                                        <p className="text-[10px] text-zinc-500">
                                            {new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 sm:text-right self-end sm:self-center">
                                        <div>
                                            <span className="text-[10px] text-zinc-500 uppercase block">Total</span>
                                            <span className="text-base font-mono font-black text-emerald-400">
                                                R{Number(tx.amount || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setViewingPastReceipt(tx)}
                                            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                                        >
                                            <Receipt className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Receipt</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Sub-view: Point of Sale Main Screen */}
            {subView === 'shop' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left 7 Columns: Product Catalog & Search */}
                    <div className="lg:col-span-7 space-y-3">
                        {/* Search & Filter Bar */}
                        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Search shop items by title, SKU, specs..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                                    />
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm('')} 
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>

                                <Button
                                    onClick={() => setShowManualModal(true)}
                                    variant="secondary"
                                    size="sm"
                                    className="!py-2 !px-3 text-xs flex items-center justify-center gap-1.5 border-amber-500/30 hover:border-amber-500/60 text-amber-400 font-bold whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Manual Sale Entry</span>
                                </Button>
                            </div>

                            {/* Category Filter Pills & Toggle */}
                            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                                <div className="flex items-center gap-1.5 overflow-x-auto">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                                selectedCategory === cat
                                                    ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                                                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                                            }`}
                                        >
                                            {cat === 'all' ? 'All Items' : cat}
                                        </button>
                                    ))}
                                </div>

                                <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer whitespace-nowrap shrink-0 pl-2">
                                    <input
                                        type="checkbox"
                                        checked={showAllInventory}
                                        onChange={e => setShowAllInventory(e.target.checked)}
                                        className="h-3.5 w-3.5 rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-amber-500"
                                    />
                                    <span>Show all stock</span>
                                </label>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {displayedItems.length === 0 ? (
                            <div className="p-12 text-center rounded-xl bg-zinc-900/30 border border-zinc-800/80 text-zinc-500">
                                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                                <p className="text-sm font-medium">No items found matching criteria.</p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    Mark inventory items as <strong className="text-amber-400">"Available in Shop"</strong> in the Inventory tab, or click <strong className="text-zinc-300">Manual Sale Entry</strong> above.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[66vh] overflow-y-auto pr-1">
                                {displayedItems.map(item => {
                                    const inCart = cart.find(c => c.inventoryId === item.id);
                                    const isOutOfStock = item.stock <= 0;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`p-2.5 rounded-xl bg-zinc-900/50 border flex flex-col justify-between transition-all group ${
                                                inCart 
                                                    ? 'border-amber-500/60 bg-amber-950/10' 
                                                    : isOutOfStock
                                                    ? 'border-zinc-800/60 opacity-60'
                                                    : 'border-zinc-800/80 hover:border-zinc-700'
                                            }`}
                                        >
                                            <div>
                                                {/* Image */}
                                                <div 
                                                    onClick={() => setInspectingItem(item)}
                                                    className="w-full h-24 rounded-lg bg-zinc-950 overflow-hidden mb-2 relative border border-zinc-800/80 flex items-center justify-center cursor-pointer group-hover:border-amber-500/40"
                                                >
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-zinc-700" />
                                                    )}
                                                    <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/70 text-[9px] text-zinc-300 backdrop-blur-xs">
                                                        {item.category || 'Gear'}
                                                    </span>
                                                </div>

                                                {/* Title & Price */}
                                                <h4 
                                                    onClick={() => setInspectingItem(item)}
                                                    className="font-bold text-xs text-white truncate cursor-pointer hover:text-amber-400"
                                                    title={item.name}
                                                >
                                                    {item.name}
                                                </h4>

                                                <div className="flex items-center justify-between text-[10px] mt-1">
                                                    <span className="text-zinc-400">Stock:</span>
                                                    <span className={`font-mono font-bold ${isOutOfStock ? 'text-red-400' : 'text-zinc-300'}`}>
                                                        {item.stock} {isOutOfStock && '(Out)'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between mt-1">
                                                    <span className="text-xs font-mono font-black text-emerald-400">
                                                        R{(item.salePrice || 0).toFixed(2)}
                                                    </span>
                                                    <span className="text-[9px] text-zinc-500 px-1 py-0.2 rounded bg-zinc-800">
                                                        {item.condition}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-2.5 pt-2 border-t border-zinc-800/60">
                                                {inCart ? (
                                                    <div className="flex items-center justify-between bg-zinc-950 rounded-lg p-1 border border-amber-500/40">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(inCart.id, inCart.quantity - 1)}
                                                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="font-mono text-xs font-bold text-amber-400 px-2">
                                                            {inCart.quantity} in cart
                                                        </span>
                                                        <button
                                                            onClick={() => handleAddToCart(item)}
                                                            disabled={inCart.quantity >= item.stock}
                                                            className="p-1 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleAddToCart(item)}
                                                        disabled={isOutOfStock}
                                                        size="sm"
                                                        className="w-full !py-1 text-xs !bg-zinc-800 hover:!bg-amber-600 text-white font-bold"
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Right 5 Columns: Cart & Checkout Register */}
                    <div className="lg:col-span-5 space-y-3">
                        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800/90 shadow-xl space-y-3">
                            {/* Cart Header */}
                            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                                    <h3 className="font-black text-sm text-white uppercase tracking-wider">
                                        Current Sale Cart ({cart.length})
                                    </h3>
                                </div>
                                {cart.length > 0 && (
                                    <button
                                        onClick={handleClearCart}
                                        className="text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        <span>Clear</span>
                                    </button>
                                )}
                            </div>

                            {/* Cart Items List */}
                            {cart.length === 0 ? (
                                <div className="py-10 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                                    <p className="text-xs font-medium">Cart is empty</p>
                                    <p className="text-[10px] text-zinc-600 mt-0.5">Click "Add to Cart" or "Manual Sale Entry"</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {cart.map(item => (
                                        <div
                                            key={item.id}
                                            className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-2 text-xs"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-white truncate">{item.name}</span>
                                                    {item.isManual && (
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800/40">
                                                            Manual
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                                                    <span>R{item.price.toFixed(2)} each</span>
                                                    <span>&bull;</span>
                                                    <span className="text-emerald-400 font-mono font-bold">
                                                        Total: R{item.total.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center text-xs"
                                                >
                                                    -
                                                </button>
                                                <span className="font-mono text-xs font-bold text-white w-5 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center text-xs"
                                                >
                                                    +
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveFromCart(item.id)}
                                                    className="text-zinc-500 hover:text-red-400 p-1 transition-colors ml-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Player Allocation (Optional) */}
                            <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Allocate to Player (Optional)</span>
                                    </label>
                                    {selectedPlayer && (
                                        <button
                                            onClick={() => { setSelectedPlayerId(''); setPlayerSearchQuery(''); }}
                                            className="text-[10px] text-red-400 hover:underline"
                                        >
                                            Remove Allocation
                                        </button>
                                    )}
                                </div>

                                {selectedPlayer ? (
                                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                                                {selectedPlayer.name[0]}{selectedPlayer.surname[0]}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white">
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
                                    <div className="space-y-1.5">
                                        <input
                                            type="text"
                                            value={playerSearchQuery}
                                            onChange={e => setPlayerSearchQuery(e.target.value)}
                                            placeholder="Search registered player (Callsign, Name, Code)..."
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                                        />
                                        {playerSearchQuery.trim() && (
                                            <div className="max-h-32 overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-lg p-1 space-y-0.5">
                                                {filteredPlayers.length === 0 ? (
                                                    <p className="p-2 text-[11px] text-zinc-500 italic text-center">No matching player found</p>
                                                ) : (
                                                    filteredPlayers.map(p => (
                                                        <button
                                                            key={p.id}
                                                            onClick={() => {
                                                                setSelectedPlayerId(p.id);
                                                                setPlayerSearchQuery('');
                                                            }}
                                                            className="w-full text-left p-1.5 rounded hover:bg-zinc-800 flex items-center justify-between text-xs text-zinc-300 transition-colors"
                                                        >
                                                            <span className="font-medium text-white truncate">
                                                                {p.name} {p.surname} {p.callsign ? `"${p.callsign}"` : ''}
                                                            </span>
                                                            <span className="font-mono text-[10px] text-zinc-400 shrink-0 ml-2">
                                                                [{p.playerCode}]
                                                            </span>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                        <p className="text-[10px] text-zinc-500">
                                            If left blank, this will be logged as an anonymous walk-in counter sale.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Method Selector */}
                            <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                                <label className="text-xs font-bold text-white block">Payment Method</label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('Cash')}
                                        className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                                            paymentMethod === 'Cash'
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                                                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                                        }`}
                                    >
                                        <Banknote className="w-4 h-4" />
                                        <span>Cash</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('Card')}
                                        className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                                            paymentMethod === 'Card'
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                                                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                                        }`}
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        <span>Card (POS)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('EFT')}
                                        className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                                            paymentMethod === 'EFT'
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                                                : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                                        }`}
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>EFT Transfer</span>
                                    </button>
                                </div>

                                {/* Tender / Total Paid & Change Calculator for Cash, Card, and EFT */}
                                <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 mt-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
                                                {paymentMethod === 'Cash' && <Banknote className="w-3.5 h-3.5 text-emerald-400" />}
                                                {paymentMethod === 'Card' && <CreditCard className="w-3.5 h-3.5 text-blue-400" />}
                                                {paymentMethod === 'EFT' && <Send className="w-3.5 h-3.5 text-purple-400" />}
                                                <span>Total Paid ({paymentMethod}):</span>
                                            </span>
                                            <span className="text-[10px] text-zinc-500">
                                                Enter amount paid to calculate change
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
                                                className="w-full bg-zinc-900 border border-zinc-700 focus:border-amber-500 rounded px-2 py-1 text-right text-xs text-white font-mono font-bold focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Preset Buttons for Tender */}
                                    {finalTotal > 0 && (
                                        <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-800/60 overflow-x-auto text-[10px]">
                                            <span className="text-zinc-500 shrink-0">Exact:</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const val = finalTotal.toFixed(2);
                                                    setAmountPaidManual(val);
                                                    setCashTendered(val);
                                                }}
                                                className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono"
                                            >
                                                R{finalTotal.toFixed(2)}
                                            </button>

                                            {/* Smart roundups if cash or EFT */}
                                            {paymentMethod === 'Cash' && (
                                                <>
                                                    {[50, 100, 200, 500].filter(n => n >= finalTotal).slice(0, 3).map(roundVal => (
                                                        <button
                                                            key={roundVal}
                                                            type="button"
                                                            onClick={() => {
                                                                const val = roundVal.toFixed(2);
                                                                setAmountPaidManual(val);
                                                                setCashTendered(val);
                                                            }}
                                                            className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono"
                                                        >
                                                            R{roundVal}
                                                        </button>
                                                    ))}
                                                </>
                                            )}

                                            {amountPaidManual && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAmountPaidManual('');
                                                        setCashTendered('');
                                                    }}
                                                    className="ml-auto text-zinc-500 hover:text-zinc-300 text-[10px]"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Real-time Change Due / Balance Indicator */}
                                    {parseFloat(amountPaidManual) > 0 && (
                                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800">
                                            <span className="text-zinc-400 font-medium">
                                                {parseFloat(amountPaidManual) >= finalTotal ? 'Change Due to Customer:' : 'Shortage / Still Due:'}
                                            </span>
                                            <span className={`font-mono font-black text-sm ${parseFloat(amountPaidManual) >= finalTotal ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {parseFloat(amountPaidManual) >= finalTotal
                                                    ? `R${changeDue.toFixed(2)}`
                                                    : `-R${(finalTotal - parseFloat(amountPaidManual)).toFixed(2)}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Discount & Notes */}
                            <div className="pt-2 border-t border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-400">Discount (ZAR):</span>
                                    <div className="flex items-center gap-1 w-24">
                                        <span className="text-zinc-500 text-xs">-R</span>
                                        <input
                                            type="number"
                                            value={discountAmount || ''}
                                            onChange={e => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                                            placeholder="0"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-right text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    value={saleNotes}
                                    onChange={e => setSaleNotes(e.target.value)}
                                    placeholder="Optional sale reference / notes..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            {/* Financial Summary */}
                            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1 text-xs">
                                <div className="flex justify-between text-zinc-400">
                                    <span>Subtotal:</span>
                                    <span className="font-mono font-bold text-zinc-200">R{cartSubtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-amber-400">
                                        <span>Discount:</span>
                                        <span className="font-mono font-bold">-R{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-1.5 border-t border-zinc-800 text-sm">
                                    <span className="font-black text-white uppercase tracking-wider">Total Payable:</span>
                                    <span className="text-lg font-mono font-black text-emerald-400">
                                        R{finalTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Complete Sale Button */}
                            <Button
                                onClick={handleCompleteSale}
                                disabled={cart.length === 0 || isProcessing}
                                variant="primary"
                                className="w-full !py-2.5 text-xs font-black uppercase tracking-wider !bg-emerald-600 hover:!bg-emerald-500 shadow-lg shadow-emerald-950/40"
                            >
                                {isProcessing ? 'Processing Transaction...' : `Complete Sale • R${finalTotal.toFixed(2)}`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Sale Entry Modal */}
            {showManualModal && (
                <Modal isOpen={true} onClose={() => setShowManualModal(false)} title="Manual Sale Entry (Unlisted Item)">
                    <form onSubmit={handleAddManualItem} className="space-y-3 text-xs">
                        <p className="text-zinc-400 text-[11px]">
                            Add an unlisted, custom, or field-service item to the active cart with manual pricing.
                        </p>

                        <div>
                            <label className="block text-zinc-400 mb-1">Item Title / Description *</label>
                            <input
                                type="text"
                                required
                                value={manualItemForm.name}
                                onChange={e => setManualItemForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Field Bucking Replacement / 0.28g BB Bag"
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-zinc-400 mb-1">Category / Group</label>
                            <select
                                value={manualItemForm.category}
                                onChange={e => setManualItemForm(f => ({ ...f, category: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                            <div className="w-full h-48 rounded-xl bg-zinc-950 overflow-hidden border border-zinc-800 flex items-center justify-center">
                                <img
                                    src={inspectingItem.imageUrl}
                                    alt={inspectingItem.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                            <div>
                                <span className="text-[10px] text-zinc-400 block">Retail Price:</span>
                                <span className="text-base font-mono font-black text-emerald-400">
                                    R{(inspectingItem.salePrice || 0).toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-400 block">Stock Available:</span>
                                <span className="text-base font-mono font-bold text-white">
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

                        {inspectingItem.description && (
                            <div>
                                <h5 className="text-[11px] font-bold text-zinc-400 uppercase mb-1">Specifications & Description</h5>
                                <p className="text-zinc-300 leading-relaxed bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800">
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

            {/* Completed Receipt Modal */}
            {completedSale && (
                <Modal isOpen={true} onClose={() => setCompletedSale(null)} title="Sale Completed Successfully">
                    <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                            <h4 className="text-sm font-bold text-emerald-300">Transaction Finalized</h4>
                            <p className="text-[11px] text-zinc-300 font-mono">
                                Receipt #{completedSale.receiptNumber}
                            </p>
                        </div>

                        {/* Printable Tactical Receipt Container */}
                        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono text-zinc-300 print:bg-white print:text-black">
                            <div className="text-center border-b border-zinc-800 pb-2.5 space-y-0.5">
                                <h3 className="font-black text-sm uppercase text-white tracking-widest">
                                    {companyDetails?.name || 'BOSJOL TACTICAL AIRSOFT'}
                                </h3>
                                <p className="text-[10px] text-zinc-400">Tactical Armory & Counter Register</p>
                                <p className="text-[10px] text-zinc-500">
                                    {new Date(completedSale.date).toLocaleString()}
                                </p>
                            </div>

                            <div className="text-[11px] space-y-0.5">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Customer:</span>
                                    <span className="text-white font-bold">
                                        {completedSale.customerName || 'Walk-in'}
                                    </span>
                                </div>
                                {completedSale.customerCode && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Player Code:</span>
                                        <span className="text-zinc-300">{completedSale.customerCode}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Payment:</span>
                                    <span className="text-amber-400 font-bold">{completedSale.paymentMethod}</span>
                                </div>
                            </div>

                            {/* Itemized list */}
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

                            {/* Financial totals */}
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
                                        <span>Amount Paid ({completedSale.paymentMethod}):</span>
                                        <span className="font-mono">R{Number(completedSale.amountTendered).toFixed(2)}</span>
                                    </div>
                                )}
                                {completedSale.changeDue !== undefined && Number(completedSale.changeDue) > 0 && (
                                    <div className="flex justify-between text-xs text-emerald-400 font-bold">
                                        <span>Change Given:</span>
                                        <span className="font-mono">R{Number(completedSale.changeDue).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-center text-[9px] text-zinc-500 pt-2">
                                Thank you for deploying with Bosjol Tactical. Keep your receipt safe.
                            </p>
                        </div>

                        <div className="pt-2 flex justify-between gap-2">
                            <Button variant="secondary" size="sm" onClick={handlePrintReceipt} className="flex items-center gap-1">
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print Receipt</span>
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => setCompletedSale(null)} className="!bg-emerald-600 hover:!bg-emerald-500">
                                <span>New Sale</span>
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Past Receipt Inspection Modal */}
            {viewingPastReceipt && (
                <Modal isOpen={true} onClose={() => setViewingPastReceipt(null)} title={`Receipt: ${viewingPastReceipt.receiptNumber || viewingPastReceipt.id}`}>
                    <div className="space-y-3 text-xs">
                        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono text-zinc-300">
                            <div className="text-center border-b border-zinc-800 pb-2 space-y-0.5">
                                <h3 className="font-bold text-sm uppercase text-white">
                                    {companyDetails?.name || 'BOSJOL TACTICAL AIRSOFT'}
                                </h3>
                                <p className="text-[10px] text-zinc-400">Receipt #{viewingPastReceipt.receiptNumber}</p>
                                <p className="text-[10px] text-zinc-500">{new Date(viewingPastReceipt.date).toLocaleString()}</p>
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
                                <span>TOTAL PAID:</span>
                                <span>R{Number(viewingPastReceipt.amount || 0).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                            <Button variant="secondary" size="sm" onClick={() => setViewingPastReceipt(null)}>
                                Close
                            </Button>
                            <Button variant="primary" size="sm" onClick={handlePrintReceipt} className="flex items-center gap-1">
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print</span>
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
