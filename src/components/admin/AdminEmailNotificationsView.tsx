import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Trash2,
  ShieldCheck,
  Building2,
  ExternalLink,
  Sparkles,
  Inbox,
  Clock,
  Check,
  X,
  FileCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface EmailLogItem {
  id: string;
  templateType: string;
  sender: string;
  recipient: string | string[];
  subject: string;
  status: 'Delivered' | 'Queued' | 'Simulated' | 'Failed';
  messageId?: string;
  error?: string;
  timestamp: string;
  htmlContent?: string;
  referenceNumber?: string;
  customerName?: string;
}

export const AdminEmailNotificationsView: React.FC = () => {
  const { adminEmail, showNotification } = useApp();

  // Status state
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [statusLoading, setStatusLoading] = useState<boolean>(true);

  // Delivery logs state
  const [logs, setLogs] = useState<EmailLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [senderFilter, setSenderFilter] = useState<string>('all');

  // Preview modal state
  const [previewEmail, setPreviewEmail] = useState<EmailLogItem | null>(null);

  // Test email state
  const [testTo, setTestTo] = useState(adminEmail || 'zacpremacc12@gmail.com');
  const [testSenderChoice, setTestSenderChoice] = useState<'bookings' | 'notifications'>('bookings');
  const [testTemplateType, setTestTemplateType] = useState<string>('test_email');
  const [testCustomSubject, setTestCustomSubject] = useState('');
  const [testCustomMessage, setTestCustomMessage] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: string;
    messageId?: string;
    error?: string;
    subject?: string;
  } | null>(null);

  // Fetch status and logs
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/resend/status');
      const data = await res.json();
      setIsConfigured(Boolean(data.configured));
    } catch {
      setIsConfigured(false);
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/resend/logs');
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.warn('Failed to fetch Resend logs', e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle Test Email Dispatch
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTo.trim()) {
      showNotification('Missing Recipient', 'Please provide a destination email address.', 'warning');
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/resend/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testTo.trim(),
          senderChoice: testSenderChoice,
          templateType: testTemplateType,
          customSubject: testCustomSubject.trim() || undefined,
          customMessage: testCustomMessage.trim() || undefined,
        }),
      });

      const data = await res.json();
      setTestResult(data);

      if (data.success) {
        showNotification(
          'Email Dispatched!',
          `Test message sent to ${testTo} (${data.status}). Check inbox or logs below.`,
          'success'
        );
        fetchLogs();
      } else {
        showNotification('Delivery Notice', data.error || 'Failed to dispatch email.', 'warning');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 'Failed',
        error: err.message || 'Network error occurred.',
      });
      showNotification('Dispatch Error', err.message || 'Failed to contact server.', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Handle Clear Logs
  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear the transactional email delivery logs?')) {
      return;
    }
    try {
      await fetch('/api/resend/logs', { method: 'DELETE' });
      setLogs([]);
      showNotification('Logs Cleared', 'Email delivery audit trail has been reset.', 'info');
    } catch (e: any) {
      showNotification('Error', 'Failed to clear logs.', 'error');
    }
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const recipients = Array.isArray(log.recipient) ? log.recipient.join(' ') : log.recipient;
      const matchesSearch =
        !q ||
        recipients.toLowerCase().includes(q) ||
        (log.subject || '').toLowerCase().includes(q) ||
        (log.customerName || '').toLowerCase().includes(q) ||
        (log.referenceNumber || '').toLowerCase().includes(q) ||
        (log.sender || '').toLowerCase().includes(q);

      // Status
      const matchesStatus =
        statusFilter === 'all' || (log.status || '').toLowerCase() === statusFilter.toLowerCase();

      // Sender
      const matchesSender =
        senderFilter === 'all' ||
        (senderFilter === 'bookings' && log.sender?.includes('bookings@smeltravels876.com')) ||
        (senderFilter === 'notifications' && log.sender?.includes('notifications@smeltravels876.com'));

      return matchesSearch && matchesStatus && matchesSender;
    });
  }, [logs, searchQuery, statusFilter, senderFilter]);

  const deliveredCount = logs.filter((l) => l.status === 'Delivered').length;
  const simulatedCount = logs.filter((l) => l.status === 'Simulated').length;
  const failedCount = logs.filter((l) => l.status === 'Failed').length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Resend Verified Integration Status */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1E0836] to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-purple-900/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-400/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Resend Domain Verified: smeltravels876.com
              </span>
              <span className="bg-[#FFC72C]/20 text-[#FFC72C] border border-[#FFC72C]/30 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#FFC72C]" />
                Official Transactional API
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit',sans-serif] tracking-tight text-white">
              Resend Transactional Email Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Automated high-deliverability email dispatch powered by Resend for booking receipts, traveler enquiries, account registrations, and executive security notifications.
            </p>
          </div>

          {/* Quick Metrics Banner */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-2xl font-black text-[#FFC72C] tabular-nums">{logs.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-300">Total Logged</div>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-2xl font-black text-emerald-400 tabular-nums">{deliveredCount}</div>
              <div className="text-[10px] uppercase font-bold text-slate-300">Delivered</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-amber-300 tabular-nums">{simulatedCount}</div>
              <div className="text-[10px] uppercase font-bold text-slate-300">Simulated</div>
            </div>
          </div>
        </div>

        {/* Sender Channel Badges */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>bookings@smeltravels876.com</span>
                <span className="bg-blue-400/20 text-blue-200 text-[9px] px-1.5 py-0.5 rounded font-mono">Channel 1</span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Handles booking requests, confirmed reservations, deposit receipts, custom trip itineraries, and customer enquiries.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>notifications@smeltravels876.com</span>
                <span className="bg-purple-400/20 text-purple-200 text-[9px] px-1.5 py-0.5 rounded font-mono">Channel 2</span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Handles traveler account registrations (welcome message) and sign-in security notifications.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Test Email Tool (Left 5 cols) & Delivery Logs (Right 7 cols or full) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test Email Dispatch Console (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                  Send Test Transactional Email
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verify templates and domain dispatch with Resend
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Interactive
            </span>
          </div>

          <form onSubmit={handleSendTestEmail} className="space-y-4 text-xs">
            {/* Sender Address Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Select Resend Sender Address <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTestSenderChoice('bookings')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    testSenderChoice === 'bookings'
                      ? 'border-[#2E0249] bg-purple-50/70 text-[#2E0249] ring-2 ring-purple-900/10'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-[11px]">bookings@</div>
                  <div className="text-[10px] text-slate-500 truncate">smeltravels876.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTestSenderChoice('notifications')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    testSenderChoice === 'notifications'
                      ? 'border-[#2E0249] bg-purple-50/70 text-[#2E0249] ring-2 ring-purple-900/10'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-[11px]">notifications@</div>
                  <div className="text-[10px] text-slate-500 truncate">smeltravels876.com</div>
                </button>
              </div>
            </div>

            {/* Template Archetype */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Template Preview Archetype
              </label>
              <select
                value={testTemplateType}
                onChange={(e) => setTestTemplateType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:border-[#2E0249]"
              >
                <option value="test_email">Standard Diagnostic Verification</option>
                <option value="booking_customer">Customer Booking Confirmation & Deposit ($40,000 JMD)</option>
                <option value="inquiry_customer">Customer Inquiry Receipt & Reference Code</option>
                <option value="custom_trip_customer">Custom Trip Itinerary Request (Panama City)</option>
                <option value="welcome_account">VIP Traveler Account Welcome Message</option>
                <option value="security_alert">Sign-in Security Notification (Jamaica Time)</option>
              </select>
            </div>

            {/* Recipient Input */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Target Recipient Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="your-email@example.com"
                className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#2E0249]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Dispatches to this address with fully styled HTML template matching SMELTRAVELS876.
              </span>
            </div>

            {/* Optional Custom Subject */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Custom Subject (Optional)
              </label>
              <input
                type="text"
                value={testCustomSubject}
                onChange={(e) => setTestCustomSubject(e.target.value)}
                placeholder="Leave blank to use default template subject"
                className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>

            {/* Optional Custom Note */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Custom Body Note (Optional)
              </label>
              <textarea
                rows={2}
                value={testCustomMessage}
                onChange={(e) => setTestCustomMessage(e.target.value)}
                placeholder="e.g. Testing Resend delivery after verified domain setup on smeltravels876.com"
                className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-700"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSendingTest}
              className="w-full py-3 px-4 bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Send className={`w-4 h-4 ${isSendingTest ? 'animate-bounce' : ''}`} />
              <span>{isSendingTest ? 'Dispatching via Resend...' : 'Send Test Email Now'}</span>
            </button>
          </form>

          {/* Test Result Callout */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>Status: {testResult.status}</span>
              </div>
              {testResult.messageId && (
                <div className="font-mono text-[10px] text-slate-600">
                  Message ID: {testResult.messageId}
                </div>
              )}
              {testResult.error && (
                <div className="text-[11px] text-rose-700 mt-1">
                  {testResult.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transactional Delivery Logs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                Transactional Delivery Logs &amp; Audit Trail
              </h3>
              <p className="text-[11px] text-slate-500">
                Permanent records of emails sent to customers and administrators
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchLogs}
                disabled={logsLoading}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
                title="Refresh logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
              </button>

              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold border border-rose-200 flex items-center gap-1 cursor-pointer"
                  title="Clear delivery logs"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
            <div className="sm:col-span-6 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search recipient, ref, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2E0249]"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="delivered">Delivered</option>
                <option value="simulated">Simulated / Logged</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={senderFilter}
                onChange={(e) => setSenderFilter(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="all">All Senders</option>
                <option value="bookings">bookings@</option>
                <option value="notifications">notifications@</option>
              </select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            {filteredLogs.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3">Time</th>
                    <th className="p-3">Sender Channel</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    const recipientStr = Array.isArray(log.recipient) ? log.recipient.join(', ') : log.recipient;
                    const isBookings = log.sender?.includes('bookings@');

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <div className="text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                              isBookings
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {isBookings ? 'bookings@' : 'notifications@'}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-800 truncate max-w-[130px]">
                            {log.customerName || recipientStr}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]">
                            {recipientStr}
                          </div>
                        </td>

                        <td className="p-3 max-w-[200px]">
                          <div className="text-slate-800 truncate font-medium">
                            {log.subject}
                          </div>
                          {log.referenceNumber && (
                            <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-500">
                              #{log.referenceNumber}
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.status === 'Simulated'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>

                        <td className="p-3 text-right whitespace-nowrap">
                          {log.htmlContent && (
                            <button
                              type="button"
                              onClick={() => setPreviewEmail(log)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#2E0249] hover:text-[#FFC72C] text-slate-700 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Preview rendered HTML"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Preview</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No email logs found matching the filter criteria.</p>
                <p className="text-[11px] text-slate-400">
                  Transactional emails sent through customer bookings, inquiries, or test sends appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HTML Email Preview Modal */}
      {previewEmail && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 border border-slate-300 shadow-2xl my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-['Outfit',sans-serif]">
                    Rendered HTML Email Preview
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Subject: {previewEmail.subject}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEmail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Meta Info */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-slate-500">Sender: </span>
                <span className="font-bold text-slate-800">{previewEmail.sender}</span>
              </div>
              <div>
                <span className="text-slate-500">Recipient: </span>
                <span className="font-bold text-slate-800">
                  {Array.isArray(previewEmail.recipient) ? previewEmail.recipient.join(', ') : previewEmail.recipient}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Dispatched: </span>
                <span className="font-bold text-slate-800">
                  {new Date(previewEmail.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Rendered iframe preview */}
            <div className="flex-1 min-h-[450px] border border-slate-200 rounded-2xl overflow-hidden bg-slate-100">
              <iframe
                title="Email Preview"
                srcDoc={previewEmail.htmlContent}
                className="w-full h-full min-h-[450px] border-0"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewEmail(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
