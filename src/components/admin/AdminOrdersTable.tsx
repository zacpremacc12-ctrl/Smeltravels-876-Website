import React, { useState, useMemo } from 'react';
import { useApp, formatPriceJMD } from '../../context/AppContext';
import {
  AdminOrderExcelRecord,
  OrderTypeCategory,
  OrderPaymentStatus,
  OrderWorkflowStatus,
} from '../../types';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Eye,
  ArrowUpDown,
  RefreshCw,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

const ORDER_TYPES: OrderTypeCategory[] = [
  'Booking Inquiry',
  'Custom Trip',
  'Deposit Record',
  'Contact Order',
  'Direct Order',
];

const PAYMENT_STATUSES: OrderPaymentStatus[] = [
  'Unpaid',
  'Deposit Requested',
  'Deposit Paid',
  'Paid in Full',
  'Refunded',
];

const WORKFLOW_STATUSES: OrderWorkflowStatus[] = [
  'New',
  'Contacted',
  'Pending',
  'Deposit Received',
  'Proposal Sent',
  'Confirmed',
  'Completed',
  'Cancelled',
];

const ADMIN_ROSTER = [
  'Zachary Buchanan',
  'Elvoy Bennett',
  'Executive Operations Desk',
];

export const AdminOrdersTable: React.FC = () => {
  const {
    adminOrdersExcel,
    addAdminOrderExcel,
    updateAdminOrderExcel,
    deleteAdminOrderExcel,
    showNotification,
  } = useApp();

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [adminFilter, setAdminFilter] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof AdminOrderExcelRecord>('receivedAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Active modal states
  const [inspectOrder, setInspectOrder] = useState<AdminOrderExcelRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Inline edit state: track cell being edited { id, field }
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof AdminOrderExcelRecord } | null>(null);
  const [editingValue, setEditingValue] = useState<any>('');
  const [justSavedId, setJustSavedId] = useState<string | null>(null);

  // Add order form state
  const [newOrderForm, setNewOrderForm] = useState<Omit<AdminOrderExcelRecord, 'id' | 'receivedAt' | 'lastUpdated'>>({
    orderRef: `ST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    orderType: 'Booking Inquiry',
    customerName: '',
    email: '',
    phone: '',
    parishOrCountry: 'Kingston, Jamaica',
    tripOrDestination: 'Panama Explorer 2026',
    travelDates: 'Oct 15 - 20, 2026',
    adultsCount: 2,
    childrenCount: 0,
    totalPrice: 280000,
    depositPaid: 45000,
    currency: 'JMD',
    paymentStatus: 'Deposit Paid',
    orderStatus: 'New',
    preferredContact: 'WhatsApp',
    assignedAdmin: 'Zachary Buchanan',
    ambassadorCode: '',
    specialRequests: '',
    inclusions: 'Flights, Hotel, Transfers, Excursions',
    adminNotes: 'Manually logged by administrator in Excel database.',
  });

  // KPI Calculations
  const stats = useMemo(() => {
    const totalOrders = adminOrdersExcel.length;
    const totalInvoiced = adminOrdersExcel.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
    const totalDeposits = adminOrdersExcel.reduce((acc, curr) => acc + (curr.depositPaid || 0), 0);
    const pendingBalance = Math.max(0, totalInvoiced - totalDeposits);
    const newCount = adminOrdersExcel.filter(o => o.orderStatus === 'New').length;
    const depositPaidCount = adminOrdersExcel.filter(o => o.paymentStatus === 'Deposit Paid' || o.paymentStatus === 'Paid in Full').length;

    return {
      totalOrders,
      totalInvoiced,
      totalDeposits,
      pendingBalance,
      newCount,
      depositPaidCount,
    };
  }, [adminOrdersExcel]);

  // Filter and sort items
  const filteredOrders = useMemo(() => {
    return adminOrdersExcel
      .filter((o) => {
        if (typeFilter !== 'All' && o.orderType !== typeFilter) return false;
        if (paymentFilter !== 'All' && o.paymentStatus !== paymentFilter) return false;
        if (statusFilter !== 'All' && o.orderStatus !== statusFilter) return false;
        if (adminFilter !== 'All' && o.assignedAdmin !== adminFilter) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          o.orderRef.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.tripOrDestination.toLowerCase().includes(q) ||
          (o.parishOrCountry && o.parishOrCountry.toLowerCase().includes(q)) ||
          (o.adminNotes && o.adminNotes.toLowerCase().includes(q)) ||
          (o.ambassadorCode && o.ambassadorCode.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [adminOrdersExcel, searchQuery, typeFilter, paymentFilter, statusFilter, adminFilter, sortField, sortAsc]);

  const handleSort = (field: keyof AdminOrderExcelRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Start editing cell
  const startEditing = (id: string, field: keyof AdminOrderExcelRecord, currentVal: any) => {
    setEditingCell({ id, field });
    setEditingValue(currentVal ?? '');
  };

  // Save editing cell
  const saveCell = (id: string, field: keyof AdminOrderExcelRecord) => {
    let finalVal = editingValue;
    if (field === 'totalPrice' || field === 'depositPaid' || field === 'adultsCount' || field === 'childrenCount') {
      finalVal = Number(editingValue) || 0;
    }
    updateAdminOrderExcel(id, { [field]: finalVal });
    setEditingCell(null);
    setJustSavedId(id);
    setTimeout(() => setJustSavedId(null), 1500);
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Order Ref',
      'Received Date',
      'Order Type',
      'Customer Name',
      'Email',
      'Phone',
      'Parish/Country',
      'Trip / Destination',
      'Travel Dates',
      'Adults',
      'Children',
      'Total Price (JMD)',
      'Deposit Paid (JMD)',
      'Balance Due (JMD)',
      'Payment Status',
      'Workflow Status',
      'Preferred Contact',
      'Assigned Admin',
      'Ambassador Code',
      'Inclusions',
      'Special Requests',
      'Admin Notes',
    ];

    const rows = filteredOrders.map(o => [
      `"${o.orderRef}"`,
      `"${new Date(o.receivedAt).toLocaleString()}"`,
      `"${o.orderType}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.email}"`,
      `"${o.phone}"`,
      `"${o.parishOrCountry || ''}"`,
      `"${o.tripOrDestination.replace(/"/g, '""')}"`,
      `"${o.travelDates || ''}"`,
      o.adultsCount,
      o.childrenCount,
      o.totalPrice,
      o.depositPaid,
      Math.max(0, o.totalPrice - o.depositPaid),
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${o.preferredContact || 'WhatsApp'}"`,
      `"${o.assignedAdmin || ''}"`,
      `"${o.ambassadorCode || ''}"`,
      `"${(o.inclusions || '').replace(/"/g, '""')}"`,
      `"${(o.specialRequests || '').replace(/"/g, '""')}"`,
      `"${(o.adminNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smeltravels876_orders_database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showNotification('Export Complete', 'Orders database exported to CSV for Microsoft Excel and Google Sheets.');
  };

  // Add new order
  const handleAddNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.customerName.trim() || !newOrderForm.email.trim()) {
      showNotification('Missing Fields', 'Please provide traveler name and email.', 'warning');
      return;
    }

    addAdminOrderExcel(newOrderForm);
    setIsAddModalOpen(false);
    // Reset form
    setNewOrderForm({
      orderRef: `ST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderType: 'Booking Inquiry',
      customerName: '',
      email: '',
      phone: '',
      parishOrCountry: 'Kingston, Jamaica',
      tripOrDestination: 'Panama Explorer 2026',
      travelDates: 'Oct 15 - 20, 2026',
      adultsCount: 2,
      childrenCount: 0,
      totalPrice: 280000,
      depositPaid: 45000,
      currency: 'JMD',
      paymentStatus: 'Deposit Paid',
      orderStatus: 'New',
      preferredContact: 'WhatsApp',
      assignedAdmin: 'Zachary Buchanan',
      ambassadorCode: '',
      specialRequests: '',
      inclusions: 'Flights, Hotel, Transfers, Excursions',
      adminNotes: 'Manually logged by administrator in Excel database.',
    });
  };

  // Helper status color badges
  const getPaymentStatusBadge = (status: OrderPaymentStatus) => {
    switch (status) {
      case 'Paid in Full':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Deposit Paid':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Deposit Requested':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Unpaid':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Refunded':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getWorkflowBadge = (status: OrderWorkflowStatus) => {
    switch (status) {
      case 'New':
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
      case 'Contacted':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Deposit Received':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Proposal Sent':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Completed':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Cancelled':
        return 'bg-neutral-200 text-neutral-700 border-neutral-300';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-neutral-900 font-['Outfit',sans-serif]">
                  Orders Excel Database
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Centralized spreadsheet: all incoming Admin Inbox orders, custom trips, and deposits are automatically collected here. Click any cell to edit directly or inspect detailed traveler files.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2E0249] hover:bg-[#3E0363] text-[#FFC72C] text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Insert Order Row</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Download Microsoft Excel / Google Sheets CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export to Excel (.CSV)</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Total Orders</div>
            <div className="text-xl font-black text-neutral-900 mt-1 font-['Outfit',sans-serif]">{stats.totalOrders}</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">All tracked records</div>
          </div>

          <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">New Inquiries</div>
            <div className="text-xl font-black text-rose-700 mt-1 font-['Outfit',sans-serif]">{stats.newCount}</div>
            <div className="text-[10px] text-rose-500 mt-0.5">Awaiting first contact</div>
          </div>

          <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Deposits Paid</div>
            <div className="text-xl font-black text-blue-700 mt-1 font-['Outfit',sans-serif]">{stats.depositPaidCount}</div>
            <div className="text-[10px] text-blue-500 mt-0.5">Spots locked in</div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Total Collected</div>
            <div className="text-xl font-black text-emerald-800 mt-1 font-['Outfit',sans-serif]">{formatPriceJMD(stats.totalDeposits)}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Deposits in hand</div>
          </div>

          <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Gross Booking Value</div>
            <div className="text-xl font-black text-purple-900 mt-1 font-['Outfit',sans-serif]">{formatPriceJMD(stats.totalInvoiced)}</div>
            <div className="text-[10px] text-purple-600 mt-0.5">Total trip value</div>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5">
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Balances</div>
            <div className="text-xl font-black text-amber-800 mt-1 font-['Outfit',sans-serif]">{formatPriceJMD(stats.pendingBalance)}</div>
            <div className="text-[10px] text-amber-600 mt-0.5">Scheduled collections</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ref #, traveler, destination, phone, email, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-600">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="All">All Types</option>
              {ORDER_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="All">All Payments</option>
              {PAYMENT_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Workflow Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="All">All Workflow</option>
              {WORKFLOW_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Admin Filter */}
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="All">All Admins</option>
              {ADMIN_ROSTER.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            {(typeFilter !== 'All' || paymentFilter !== 'All' || statusFilter !== 'All' || adminFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setTypeFilter('All');
                  setPaymentFilter('All');
                  setStatusFilter('All');
                  setAdminFilter('All');
                  setSearchQuery('');
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Spreadsheet Instructions Pill */}
      <div className="flex items-center justify-between text-xs text-neutral-600 px-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            Showing <strong>{filteredOrders.length}</strong> of <strong>{adminOrdersExcel.length}</strong> database entries.
            <span className="hidden sm:inline text-neutral-400 ml-1">Tip: Click on any cell to edit directly in place. Press Enter or click outside to save instantly.</span>
          </span>
        </div>
      </div>

      {/* Excel Spreadsheet Table Container */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[750px] relative scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            {/* Header Row */}
            <thead className="bg-[#2E0249] text-white sticky top-0 z-10 shadow-xs select-none">
              <tr>
                <th className="p-3 w-12 text-center font-mono font-bold text-neutral-300 border-r border-purple-900">#</th>
                <th className="p-3 min-w-[130px] font-bold border-r border-purple-900 cursor-pointer hover:bg-purple-950" onClick={() => handleSort('orderRef')}>
                  <div className="flex items-center justify-between">
                    <span>Order Ref</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="p-3 min-w-[130px] font-bold border-r border-purple-900 cursor-pointer hover:bg-purple-950" onClick={() => handleSort('receivedAt')}>
                  <div className="flex items-center justify-between">
                    <span>Received Date</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="p-3 min-w-[130px] font-bold border-r border-purple-900">Type</th>
                <th className="p-3 min-w-[160px] font-bold border-r border-purple-900 cursor-pointer hover:bg-purple-950" onClick={() => handleSort('customerName')}>
                  <div className="flex items-center justify-between">
                    <span>Traveler Name</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="p-3 min-w-[130px] font-bold border-r border-purple-900">Phone</th>
                <th className="p-3 min-w-[180px] font-bold border-r border-purple-900">Email</th>
                <th className="p-3 min-w-[150px] font-bold border-r border-purple-900">Parish / Origin</th>
                <th className="p-3 min-w-[200px] font-bold border-r border-purple-900">Trip / Destination</th>
                <th className="p-3 min-w-[140px] font-bold border-r border-purple-900">Travel Dates</th>
                <th className="p-3 min-w-[70px] text-center font-bold border-r border-purple-900">Guests</th>
                <th className="p-3 min-w-[120px] text-right font-bold border-r border-purple-900 cursor-pointer hover:bg-purple-950" onClick={() => handleSort('totalPrice')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Total (JMD)</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="p-3 min-w-[120px] text-right font-bold border-r border-purple-900 cursor-pointer hover:bg-purple-950" onClick={() => handleSort('depositPaid')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Deposit (JMD)</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="p-3 min-w-[110px] text-right font-bold border-r border-purple-900">Balance Due</th>
                <th className="p-3 min-w-[130px] font-bold border-r border-purple-900">Payment</th>
                <th className="p-3 min-w-[140px] font-bold border-r border-purple-900">Status</th>
                <th className="p-3 min-w-[140px] font-bold border-r border-purple-900">Assigned Admin</th>
                <th className="p-3 min-w-[220px] font-bold border-r border-purple-900">Admin Notes</th>
                <th className="p-3 min-w-[100px] text-center font-bold sticky right-0 bg-[#2E0249] shadow-l">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-neutral-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={19} className="p-12 text-center text-neutral-400 bg-neutral-50/50">
                    <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                    <p className="font-bold text-neutral-600">No orders match the selected filters</p>
                    <p className="text-xs mt-1">Try clearing your search or reset filters above.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const isSaved = justSavedId === order.id;
                  const balanceDue = Math.max(0, (order.totalPrice || 0) - (order.depositPaid || 0));

                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors font-medium ${
                        isSaved ? 'bg-emerald-50/70' : index % 2 === 0 ? 'bg-white hover:bg-neutral-50/80' : 'bg-neutral-50/40 hover:bg-neutral-100/70'
                      }`}
                    >
                      {/* Row Index */}
                      <td className="p-2.5 text-center font-mono text-neutral-400 border-r border-neutral-200 text-[11px]">
                        {index + 1}
                      </td>

                      {/* Order Ref */}
                      <td className="p-2.5 font-mono font-bold text-purple-900 border-r border-neutral-200 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{order.orderRef}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order.orderRef);
                              showNotification('Copied', `Reference ${order.orderRef} copied to clipboard!`);
                            }}
                            className="text-neutral-400 hover:text-neutral-700 p-0.5"
                            title="Copy Ref Code"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Received Date */}
                      <td className="p-2.5 text-neutral-600 border-r border-neutral-200 whitespace-nowrap text-[11px]">
                        {new Date(order.receivedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Order Type */}
                      <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap">
                        {editingCell?.id === order.id && editingCell?.field === 'orderType' ? (
                          <select
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveCell(order.id, 'orderType')}
                            className="bg-white border-2 border-emerald-500 rounded p-1 text-xs w-full focus:outline-none"
                          >
                            {ORDER_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        ) : (
                          <div
                            onClick={() => startEditing(order.id, 'orderType', order.orderType)}
                            className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 rounded text-neutral-800"
                            title="Click to edit type"
                          >
                            <span className="font-semibold text-neutral-800">{order.orderType}</span>
                          </div>
                        )}
                      </td>

                      {/* Customer Name */}
                      <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap font-bold text-neutral-900">
                        {editingCell?.id === order.id && editingCell?.field === 'customerName' ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveCell(order.id, 'customerName')}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(order.id, 'customerName')}
                            className="bg-white border-2 border-emerald-500 rounded p-1 text-xs w-full focus:outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(order.id, 'customerName', order.customerName)}
                            className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 rounded"
                            title="Click to edit name"
                          >
                            {order.customerName}
                          </div>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap font-mono text-[11px] text-neutral-700">
                        {editingCell?.id === order.id && editingCell?.field === 'phone' ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveCell(order.id, 'phone')}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(order.id, 'phone')}
                            className="bg-white border-2 border-emerald-500 rounded p-1 text-xs w-full focus:outline-none font-mono"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(order.id, 'phone', order.phone)}
                            className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 rounded flex items-center gap-1"
                            title="Click to edit phone"
                          >
                            <span>{order.phone || '—'}</span>
                            {order.phone && (
                              <a
                                href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-emerald-600 hover:text-emerald-800 p-0.5"
                                title="Open WhatsApp Chat"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Email */}
                      <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap text-neutral-700">
                        {editingCell?.id === order.id && editingCell?.field === 'email' ? (
                          <input
                            autoFocus
                            type="email"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveCell(order.id, 'email')}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(order.id, 'email')}
                            className="bg-white border-2 border-emerald-500 rounded p-1 text-xs w-full focus:outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(order.id, 'email', order.email)}
                            className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 rounded flex items-center gap-1"
                            title="Click to edit email"
                          >
                            <span>{order.email}</span>
                            <a
                              href={`mailto:${order.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-neutral-400 hover:text-purple-700 p-0.5"
                              title="Send Email"
                            >
                              <Mail className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Parish / Origin */}
                      <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap text-neutral-700">
                        {editingCell?.id === order.id && editingCell?.field === 'parishOrCountry' ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveCell(order.id, 'parishOrCountry')}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(order.id, 'parishOrCountry')}
                            className="bg-white border-2 border-emerald-500 rounded p-1 text-xs w-full focus:outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(order.id, 'parishOrCountry', order.parishOrCountry)}
                            className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 rounded"
                            title="Click to edit parish"
                          >
                            {order.parishOrCountry || 'Jamaica'}
                          </div>
                        )}
                      </td>

                      {/* Trip / Destination */}
                      <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap font-bold text-neutral-900">
                        {editingCell?.id === order.id && editingCell?.field === 'tripOrDestination' ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveCell(order.id, 'tripOrDestination')}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(order.id, 'tripOrDestination')}
                            className="bg-white border-2 border-emerald-500 rounded p-1 text-xs w-full focus:outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(order.id, 'tripOrDestination', order.tripOrDestination)}
                            className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 rounded truncate max-w-[240px]"
                            title={order.tripOrDestination}
                          >
                            {order.tripOrDestination}
                          </div>
                        )}
                      </td>

                      {/* Travel Dates */}
                      <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap text-neutral-700 text-[11px]">
                        {editingCell?.id === order.id && editingCell?.field === 'travelDates' ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveCell(order.id, 'travelDates')}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(order.id, 'travelDates')}
                            className="bg-white border-2 border-emerald-500 rounded p-1 text-xs w-full focus:outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(order.id, 'travelDates', order.travelDates)}
                            className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 rounded"
                            title="Click to edit travel dates"
                          >
                            {order.travelDates || 'Flexible'}
                          </div>
                        )}
                      </td>

                      {/* Guests Count */}
                      <td className="p-2.5 border-r border-neutral-200 text-center whitespace-nowrap text-neutral-700">
                        {editingCell?.id === order.id && editingCell?.field === 'adultsCount' ? (
                          <input
                            autoFocus
                            type="number"
                            min="1"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveCell(order.id, 'adultsCount')}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(order.id, 'adultsCount')}
                            className="bg-white border-2 border-emerald-500 rounded p-1 text-xs w-16 text-center focus:outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(order.id, 'adultsCount', order.adultsCount)}
                            className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 rounded font-mono"
                            title="Click to edit adults count"
                          >
                            {order.adultsCount}{order.childrenCount ? ` + ${order.childrenCount}k` : ''}
                          </div>
                        )}
                      </td>

                      {/* Total Price (JMD) */}
                      <td className="p-2.5 border-r border-neutral-200 text-right whitespace-nowrap font-mono font-bold text-neutral-900">
                        {editingCell?.id === order.id && editingCell?.field === 'totalPrice' ? (
                          <input
                            autoFocus
                            type="number"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveCell(order.id, 'totalPrice')}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(order.id, 'totalPrice')}
                            className="bg-white border-2 border-emerald-500 rounded p-1 text-xs w-28 text-right focus:outline-none font-mono"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(order.id, 'totalPrice', order.totalPrice)}
                            className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 rounded"
                            title="Click to edit total price"
                          >
                            {formatPriceJMD(order.totalPrice || 0)}
                          </div>
                        )}
                      </td>

                      {/* Deposit Paid (JMD) */}
                      <td className="p-2.5 border-r border-neutral-200 text-right whitespace-nowrap font-mono font-bold text-emerald-700">
                        {editingCell?.id === order.id && editingCell?.field === 'depositPaid' ? (
                          <input
                            autoFocus
                            type="number"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveCell(order.id, 'depositPaid')}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(order.id, 'depositPaid')}
                            className="bg-white border-2 border-emerald-500 rounded p-1 text-xs w-28 text-right focus:outline-none font-mono"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(order.id, 'depositPaid', order.depositPaid)}
                            className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 rounded"
                            title="Click to edit deposit paid"
                          >
                            {formatPriceJMD(order.depositPaid || 0)}
                          </div>
                        )}
                      </td>

                      {/* Balance Due */}
                      <td className="p-2.5 border-r border-neutral-200 text-right whitespace-nowrap font-mono font-bold text-neutral-600">
                        {formatPriceJMD(balanceDue)}
                      </td>

                      {/* Payment Status Dropdown */}
                      <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap">
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => {
                            updateAdminOrderExcel(order.id, { paymentStatus: e.target.value as OrderPaymentStatus });
                            showNotification('Status Updated', `Payment set to ${e.target.value} for ${order.orderRef}`);
                          }}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${getPaymentStatusBadge(order.paymentStatus)}`}
                        >
                          {PAYMENT_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      {/* Workflow Status Dropdown */}
                      <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => {
                            updateAdminOrderExcel(order.id, { orderStatus: e.target.value as OrderWorkflowStatus });
                            showNotification('Status Updated', `Workflow set to ${e.target.value} for ${order.orderRef}`);
                          }}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${getWorkflowBadge(order.orderStatus)}`}
                        >
                          {WORKFLOW_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      {/* Assigned Admin */}
                      <td className="p-2.5 border-r border-neutral-200 whitespace-nowrap">
                        <select
                          value={order.assignedAdmin || 'Zachary Buchanan'}
                          onChange={(e) => {
                            updateAdminOrderExcel(order.id, { assignedAdmin: e.target.value });
                            showNotification('Admin Assigned', `Assigned to ${e.target.value}`);
                          }}
                          className="bg-neutral-50 border border-neutral-200 text-neutral-800 text-[11px] font-semibold px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
                        >
                          {ADMIN_ROSTER.map(a => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </td>

                      {/* Admin Notes */}
                      <td className="p-2.5 border-r border-neutral-200 text-neutral-600 text-[11px]">
                        {editingCell?.id === order.id && editingCell?.field === 'adminNotes' ? (
                          <input
                            autoFocus
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveCell(order.id, 'adminNotes')}
                            onKeyDown={(e) => e.key === 'Enter' && saveCell(order.id, 'adminNotes')}
                            className="bg-white border-2 border-emerald-500 rounded p-1 text-xs w-full focus:outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(order.id, 'adminNotes', order.adminNotes)}
                            className="cursor-pointer hover:bg-neutral-100 px-1 py-0.5 rounded truncate max-w-[220px]"
                            title={order.adminNotes || 'Click to add notes'}
                          >
                            {order.adminNotes || <span className="text-neutral-300 italic">Add note...</span>}
                          </div>
                        )}
                      </td>

                      {/* Actions Column (Sticky Right) */}
                      <td className="p-2.5 text-center sticky right-0 bg-white/95 backdrop-blur-xs shadow-l whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setInspectOrder(order)}
                            className="p-1.5 rounded-lg text-purple-900 hover:bg-purple-100 transition-colors cursor-pointer"
                            title="Inspect & Edit Full Traveler File"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(order.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Delete Row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT / DETAILED EDIT DRAWER MODAL */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-neutral-200 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-900 font-['Outfit',sans-serif]">
                    Order Record: {inspectOrder.orderRef}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Received on {new Date(inspectOrder.receivedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact Bar */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="font-bold text-neutral-800">{inspectOrder.customerName}</div>
                <span className="text-neutral-400">•</span>
                <div className="text-neutral-600 font-mono">{inspectOrder.phone}</div>
                <span className="text-neutral-400">•</span>
                <div className="text-neutral-600">{inspectOrder.email}</div>
              </div>

              <div className="flex items-center gap-2">
                {inspectOrder.phone && (
                  <a
                    href={`https://wa.me/${inspectOrder.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
                {inspectOrder.phone && (
                  <a
                    href={`tel:${inspectOrder.phone}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}
                <a
                  href={`mailto:${inspectOrder.email}?subject=SMELTRAVELS876%20Booking%20Order%20${inspectOrder.orderRef}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            {/* Editable Fields Grid in Inspector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Traveler Name</label>
                <input
                  type="text"
                  value={inspectOrder.customerName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInspectOrder({ ...inspectOrder, customerName: val });
                    updateAdminOrderExcel(inspectOrder.id, { customerName: val });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Order Type</label>
                <select
                  value={inspectOrder.orderType}
                  onChange={(e) => {
                    const val = e.target.value as OrderTypeCategory;
                    setInspectOrder({ ...inspectOrder, orderType: val });
                    updateAdminOrderExcel(inspectOrder.id, { orderType: val });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                >
                  {ORDER_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Trip / Destination</label>
                <input
                  type="text"
                  value={inspectOrder.tripOrDestination}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInspectOrder({ ...inspectOrder, tripOrDestination: val });
                    updateAdminOrderExcel(inspectOrder.id, { tripOrDestination: val });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Travel Dates</label>
                <input
                  type="text"
                  value={inspectOrder.travelDates || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInspectOrder({ ...inspectOrder, travelDates: val });
                    updateAdminOrderExcel(inspectOrder.id, { travelDates: val });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Total Trip Price (JMD)</label>
                <input
                  type="number"
                  value={inspectOrder.totalPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setInspectOrder({ ...inspectOrder, totalPrice: val });
                    updateAdminOrderExcel(inspectOrder.id, { totalPrice: val });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Deposit Paid (JMD)</label>
                <input
                  type="number"
                  value={inspectOrder.depositPaid}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setInspectOrder({ ...inspectOrder, depositPaid: val });
                    updateAdminOrderExcel(inspectOrder.id, { depositPaid: val });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Payment Status</label>
                <select
                  value={inspectOrder.paymentStatus}
                  onChange={(e) => {
                    const val = e.target.value as OrderPaymentStatus;
                    setInspectOrder({ ...inspectOrder, paymentStatus: val });
                    updateAdminOrderExcel(inspectOrder.id, { paymentStatus: val });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-emerald-600"
                >
                  {PAYMENT_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Workflow Status</label>
                <select
                  value={inspectOrder.orderStatus}
                  onChange={(e) => {
                    const val = e.target.value as OrderWorkflowStatus;
                    setInspectOrder({ ...inspectOrder, orderStatus: val });
                    updateAdminOrderExcel(inspectOrder.id, { orderStatus: val });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:border-emerald-600"
                >
                  {WORKFLOW_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Assigned Admin</label>
                <select
                  value={inspectOrder.assignedAdmin || 'Zachary Buchanan'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInspectOrder({ ...inspectOrder, assignedAdmin: val });
                    updateAdminOrderExcel(inspectOrder.id, { assignedAdmin: val });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                >
                  {ADMIN_ROSTER.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Parish or Origin</label>
                <input
                  type="text"
                  value={inspectOrder.parishOrCountry || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInspectOrder({ ...inspectOrder, parishOrCountry: val });
                    updateAdminOrderExcel(inspectOrder.id, { parishOrCountry: val });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-neutral-700 mb-1">Inclusions / Package Details</label>
                <input
                  type="text"
                  value={inspectOrder.inclusions || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInspectOrder({ ...inspectOrder, inclusions: val });
                    updateAdminOrderExcel(inspectOrder.id, { inclusions: val });
                  }}
                  placeholder="e.g. Flights, 4-Star Hotel, Roundtrip Airport Transfers, 2 Excursions"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-neutral-700 mb-1">Special Requests / Traveler Notes</label>
                <textarea
                  rows={3}
                  value={inspectOrder.specialRequests || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInspectOrder({ ...inspectOrder, specialRequests: val });
                    updateAdminOrderExcel(inspectOrder.id, { specialRequests: val });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-neutral-700 mb-1">Internal Admin Notes</label>
                <textarea
                  rows={3}
                  value={inspectOrder.adminNotes || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInspectOrder({ ...inspectOrder, adminNotes: val });
                    updateAdminOrderExcel(inspectOrder.id, { adminNotes: val });
                  }}
                  placeholder="Internal comments, follow-up logs, itinerary details..."
                  className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
              <div className="text-xs text-neutral-400">
                Last modified: {new Date(inspectOrder.lastUpdated).toLocaleString()}
              </div>
              <button
                onClick={() => {
                  showNotification('Changes Saved', `Record ${inspectOrder.orderRef} saved in live database.`);
                  setInspectOrder(null);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow transition-colors cursor-pointer"
              >
                Close & Confirm Saved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSERT NEW ORDER ROW MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 border border-neutral-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#2E0249] text-[#FFC72C] flex items-center justify-center shadow">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900 font-['Outfit',sans-serif]">
                    Insert Order Into Excel Database
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Manually log an inquiry, phone booking, or payment record.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Order Ref Code *</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.orderRef}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, orderRef: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Order Type</label>
                  <select
                    value={newOrderForm.orderType}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, orderType: e.target.value as OrderTypeCategory })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900"
                  >
                    {ORDER_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Traveler Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shakira Gordon"
                    value={newOrderForm.customerName}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="shakira@example.com"
                    value={newOrderForm.email}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="876-555-0199"
                    value={newOrderForm.phone}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Parish or Country</label>
                  <input
                    type="text"
                    placeholder="Kingston, Jamaica"
                    value={newOrderForm.parishOrCountry}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, parishOrCountry: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Trip / Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="Panama Explorer 2026"
                    value={newOrderForm.tripOrDestination}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, tripOrDestination: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Travel Dates</label>
                  <input
                    type="text"
                    placeholder="Oct 15 - 20, 2026"
                    value={newOrderForm.travelDates}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, travelDates: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Total Trip Price (JMD)</label>
                  <input
                    type="number"
                    value={newOrderForm.totalPrice}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, totalPrice: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Deposit Paid (JMD)</label>
                  <input
                    type="number"
                    value={newOrderForm.depositPaid}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, depositPaid: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Payment Status</label>
                  <select
                    value={newOrderForm.paymentStatus}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, paymentStatus: e.target.value as OrderPaymentStatus })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900"
                  >
                    {PAYMENT_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Workflow Status</label>
                  <select
                    value={newOrderForm.orderStatus}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, orderStatus: e.target.value as OrderWorkflowStatus })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900"
                  >
                    {WORKFLOW_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Admin Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes on traveler request, flight preferences, etc."
                  value={newOrderForm.adminNotes}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-bold text-xs hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2E0249] hover:bg-[#3E0363] text-[#FFC72C] font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insert Row into Database</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-neutral-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-neutral-900 text-base">Delete Database Entry?</h4>
              <p className="text-xs text-neutral-500">
                Are you sure you want to delete this order row from the Excel database? This action will remove the record permanently.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
              >
                Keep Row
              </button>
              <button
                onClick={() => {
                  deleteAdminOrderExcel(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Delete Row
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
