import React, { useState } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  MessageCircle,
  ShieldCheck,
  Clock,
  CalendarClock,
} from 'lucide-react';
import { AdminOrderExcelRecord, PaymentInstallment, PaymentSchedule } from '../../types';
import { useApp, formatPriceJMD } from '../../context/AppContext';

interface AdminInstallmentScheduleModalProps {
  order: AdminOrderExcelRecord;
  onClose: () => void;
}

export const AdminInstallmentScheduleModal: React.FC<AdminInstallmentScheduleModalProps> = ({
  order,
  onClose,
}) => {
  const { updateBookingPaymentSchedule, showNotification, settings } = useApp();

  const totalPrice = order.totalPrice || 0;
  const depositPaid = order.depositPaid || 0;
  const remainingBalance = Math.max(0, totalPrice - depositPaid);

  // Initialize installments from existing schedule or generate default 2-stage timeframe
  const [installments, setInstallments] = useState<PaymentInstallment[]>(() => {
    if (order.paymentSchedule?.installments && order.paymentSchedule.installments.length > 0) {
      return order.paymentSchedule.installments;
    }

    if (remainingBalance <= 0) return [];

    const now = new Date();
    const d1 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const d2 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const half = Math.round(remainingBalance / 2);

    return [
      {
        id: `inst-${Date.now()}-1`,
        installmentNumber: 1,
        label: 'Installment #1 (Midway Milestone)',
        amount: half,
        dueDate: d1.toISOString().split('T')[0],
        status: 'Pending',
      },
      {
        id: `inst-${Date.now()}-2`,
        installmentNumber: 2,
        label: 'Installment #2 (Final Balance)',
        amount: remainingBalance - half,
        dueDate: d2.toISOString().split('T')[0],
        status: 'Pending',
      },
    ];
  });

  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Sum of current installments
  const totalAllocated = installments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const diff = remainingBalance - totalAllocated;

  // Preset quick split helpers
  const applyQuickSplit = (numInstallments: number) => {
    if (remainingBalance <= 0) return;
    const now = new Date();
    const intervalDays = 30;
    const baseAmount = Math.floor(remainingBalance / numInstallments);
    const remainder = remainingBalance - (baseAmount * numInstallments);

    const newInst: PaymentInstallment[] = [];
    for (let i = 1; i <= numInstallments; i++) {
      const dueDate = new Date(now.getTime() + (i * intervalDays * 24 * 60 * 60 * 1000));
      const amount = (i === numInstallments) ? baseAmount + remainder : baseAmount;
      newInst.push({
        id: `inst-${Date.now()}-${i}`,
        installmentNumber: i,
        label: i === numInstallments ? `Installment #${i} (Final Balance)` : `Installment #${i}`,
        amount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'Pending',
      });
    }
    setInstallments(newInst);
  };

  const handleAddInstallment = () => {
    const nextNum = installments.length + 1;
    const now = new Date();
    const dueDate = new Date(now.getTime() + (nextNum * 30 * 24 * 60 * 60 * 1000));
    const defaultAmt = Math.max(0, diff);

    setInstallments([
      ...installments,
      {
        id: `inst-${Date.now()}-${nextNum}`,
        installmentNumber: nextNum,
        label: `Installment #${nextNum}`,
        amount: defaultAmt,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'Pending',
      },
    ]);
  };

  const handleRemoveInstallment = (id: string) => {
    const updated = installments
      .filter(inst => inst.id !== id)
      .map((inst, idx) => ({ ...inst, installmentNumber: idx + 1 }));
    setInstallments(updated);
  };

  const handleUpdateInstallment = (id: string, updates: Partial<PaymentInstallment>) => {
    setInstallments(installments.map(inst => {
      if (inst.id === id) {
        return { ...inst, ...updates };
      }
      return inst;
    }));
  };

  const handleSaveSchedule = () => {
    const schedule: PaymentSchedule = {
      totalPrice,
      depositPaid,
      initialDepositDate: order.receivedAt || new Date().toISOString(),
      initialTransactionId: order.orderRef,
      remainingBalance,
      currency: 'JMD',
      configuredByAdmin: 'Executive Concierge Admin',
      lastConfiguredAt: new Date().toISOString(),
      installments: installments.map((inst, i) => ({
        ...inst,
        installmentNumber: i + 1,
        amount: Number(inst.amount) || 0,
      })),
    };

    updateBookingPaymentSchedule(order.id, schedule);
    onClose();
  };

  const buildWhatsAppScheduleMessage = () => {
    let msg = `🌟 *SMELTRAVELS876 PAYMENT SCHEDULE & TIME FRAME*\n`;
    msg += `Hello ${order.customerName}! Here is the confirmed installment timeframe for your trip: *${order.tripOrDestination}*.\n\n`;
    msg += `📄 *Booking Ref:* ${order.orderRef}\n`;
    msg += `💰 *Total Package:* ${formatPriceJMD(totalPrice)}\n`;
    msg += `✅ *Initial WiPay Deposit (Paid):* ${formatPriceJMD(depositPaid)}\n`;
    msg += `⏳ *Remaining Balance:* ${formatPriceJMD(remainingBalance)}\n\n`;
    msg += `📅 *INSTALLMENT DEADLINES & AMOUNTS (JMD):*\n`;

    installments.forEach((inst, idx) => {
      msg += `• *${inst.label}*: ${formatPriceJMD(inst.amount)} — Due: *${inst.dueDate}* [${inst.status.toUpperCase()}]\n`;
    });

    msg += `\n💬 For online payments or transfers, contact us on WhatsApp: (876) 834-1537.\n✨ *Travel More ✈️ Stress Less!*`;
    return msg;
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(buildWhatsAppScheduleMessage());
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2000);
    showNotification('Schedule Copied', 'WhatsApp payment plan message copied to clipboard!');
  };

  const handleSendWhatsApp = () => {
    const phone = (order.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone || '18768341537'}?text=${encodeURIComponent(buildWhatsAppScheduleMessage())}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-neutral-300 overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2E0249] via-[#3B185F] to-[#2E0249] text-white p-5 flex items-center justify-between border-b border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFC72C] flex items-center justify-center text-[#2E0249] font-black shadow-md">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#FFC72C] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Post-Deposit Payment Timeframe
                </span>
                <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-full font-mono text-neutral-200">
                  {order.orderRef}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-['Outfit',sans-serif] leading-tight text-white mt-0.5">
                Set Payment Deadlines & Installments for {order.customerName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Overview Cards */}
        <div className="bg-amber-50/70 p-4 border-b border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase block">Total Package Price</span>
            <span className="text-lg font-black text-neutral-900 font-mono">
              {formatPriceJMD(totalPrice)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-emerald-300 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Initial WiPay Deposit (Paid)
            </span>
            <span className="text-lg font-black text-emerald-700 font-mono">
              {formatPriceJMD(depositPaid)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-purple-200 shadow-2xs">
            <span className="text-[11px] font-semibold text-purple-900 uppercase block">Remaining Balance Due</span>
            <span className="text-lg font-black text-purple-950 font-mono">
              {formatPriceJMD(remainingBalance)}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          {/* Quick Presets Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-neutral-200">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-700" />
                <span>Configure Installment Schedule & Deadlines</span>
              </h4>
              <p className="text-[11px] text-neutral-500">
                Admins can set the deadline date and amount in JMD for each remaining installment.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Quick Split:</span>
              <button
                type="button"
                onClick={() => applyQuickSplit(2)}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-purple-100 text-[#2E0249] text-xs font-bold border border-neutral-300 transition-colors cursor-pointer"
              >
                2 Parts (50/50)
              </button>
              <button
                type="button"
                onClick={() => applyQuickSplit(3)}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-purple-100 text-[#2E0249] text-xs font-bold border border-neutral-300 transition-colors cursor-pointer"
              >
                3 Parts
              </button>
              <button
                type="button"
                onClick={() => applyQuickSplit(4)}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-purple-100 text-[#2E0249] text-xs font-bold border border-neutral-300 transition-colors cursor-pointer"
              >
                4 Parts
              </button>
            </div>
          </div>

          {/* Installments List */}
          <div className="space-y-3">
            {installments.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 text-neutral-500 text-xs">
                No installments configured yet. Click below or pick a Quick Split to add payment milestones.
              </div>
            ) : (
              installments.map((inst, index) => (
                <div
                  key={inst.id}
                  className="p-4 bg-neutral-50/80 hover:bg-white rounded-2xl border border-neutral-200 shadow-2xs transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#2E0249] text-white flex items-center justify-center font-black text-xs">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={inst.label}
                        onChange={(e) => handleUpdateInstallment(inst.id, { label: e.target.value })}
                        placeholder="Installment Label (e.g. Milestone 1)"
                        className="font-bold text-neutral-900 text-xs sm:text-sm bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-[#2E0249] focus:bg-white px-1 py-0.5 rounded outline-none w-52 sm:w-64"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={inst.status}
                        onChange={(e) => handleUpdateInstallment(inst.id, { status: e.target.value as any })}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          inst.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : inst.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Pending">⏳ Pending</option>
                        <option value="Paid">✅ Paid</option>
                        <option value="Overdue">⚠️ Overdue</option>
                        <option value="Waived">⚪ Waived</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveInstallment(inst.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Installment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Deadline & Amount Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-neutral-700 block mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Deadline / Due Date *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={inst.dueDate}
                        onChange={(e) => handleUpdateInstallment(inst.id, { dueDate: e.target.value })}
                        className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs font-semibold focus:border-[#2E0249] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-neutral-700 block mb-1 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Amount in JMD *</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">
                          $
                        </span>
                        <input
                          type="number"
                          required
                          min="0"
                          step="100"
                          value={inst.amount || ''}
                          onChange={(e) => handleUpdateInstallment(inst.id, { amount: Number(e.target.value) })}
                          placeholder="Amount in JMD"
                          className="w-full pl-7 pr-12 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono font-bold focus:border-[#2E0249] focus:outline-none"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-[10px]">
                          JMD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details if Paid */}
                  {inst.status === 'Paid' && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in">
                      <div>
                        <label className="text-[10px] font-bold text-emerald-900 block mb-0.5">Payment Method</label>
                        <select
                          value={inst.paymentMethod || 'WiPay Jamaica'}
                          onChange={(e) => handleUpdateInstallment(inst.id, { paymentMethod: e.target.value })}
                          className="w-full p-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
                        >
                          <option value="WiPay Jamaica">WiPay Jamaica (Credit / Debit)</option>
                          <option value="NCB Bank Transfer">NCB Bank Transfer</option>
                          <option value="Lynk Transfer">Lynk Jamaica</option>
                          <option value="Cash / Office Deposit">Cash / Office Deposit</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-emerald-900 block mb-0.5">Receipt / Transaction Ref</label>
                        <input
                          type="text"
                          value={inst.transactionRef || ''}
                          onChange={(e) => handleUpdateInstallment(inst.id, { transactionRef: e.target.value })}
                          placeholder="e.g. WP-TXN-829102"
                          className="w-full p-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            <button
              type="button"
              onClick={handleAddInstallment}
              className="w-full py-2.5 border-2 border-dashed border-neutral-300 hover:border-purple-600 rounded-2xl text-xs font-bold text-purple-900 hover:bg-purple-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Installment Milestone</span>
            </button>
          </div>

          {/* Allocation Balance Status Check */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
              diff === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : diff > 0
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2">
              {diff === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>
                {diff === 0
                  ? 'All installments match remaining balance perfectly!'
                  : diff > 0
                  ? `Unallocated: ${formatPriceJMD(diff)} remaining to be assigned.`
                  : `Overallocated by ${formatPriceJMD(Math.abs(diff))}.`}
              </span>
            </div>

            <span className="font-mono font-bold">
              Allocated: {formatPriceJMD(totalAllocated)} / {formatPriceJMD(remainingBalance)}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-50 p-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="px-3.5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedWhatsApp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedWhatsApp ? 'Copied Message!' : 'Copy WhatsApp Plan'}</span>
            </button>

            {order.phone && (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveSchedule}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#FACC15] text-[#2E0249] font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-101 active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4 fill-current" />
              <span>Save & Apply Deadlines</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
