import React, { useState } from 'react';
import { useApp, formatPriceJMD } from '../../context/AppContext';
import { AdminInboxItem, AdminInboxCategory } from '../../types';
import {
  Inbox,
  ClipboardList,
  DollarSign,
  Star,
  Mail,
  CheckCheck,
  Trash2,
  Search,
  CheckCircle2,
  Calendar,
  Phone,
  MessageCircle,
  ExternalLink,
  Filter,
  Eye,
  Bell,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const formatJMD = (val?: number) => (val !== undefined ? formatPriceJMD(val) : '$0 JMD');

interface AdminInboxViewProps {
  onNavigateToTab?: (tab: string) => void;
}

export const AdminInboxView: React.FC<AdminInboxViewProps> = ({ onNavigateToTab }) => {
  const {
    adminInbox,
    markInboxItemAsRead,
    markAllInboxAsRead,
    deleteInboxItem,
    addInboxItem,
    showNotification,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<AdminInboxItem | null>(null);

  // Filter items
  const filteredItems = adminInbox.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
    const matchesUnread = !unreadOnly || !item.isRead;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      item.title.toLowerCase().includes(q) ||
      item.senderName.toLowerCase().includes(q) ||
      (item.senderEmail && item.senderEmail.toLowerCase().includes(q)) ||
      (item.senderPhone && item.senderPhone.includes(q)) ||
      item.summary.toLowerCase().includes(q) ||
      (item.tripName && item.tripName.toLowerCase().includes(q)) ||
      (item.referenceNumber && item.referenceNumber.toLowerCase().includes(q));

    return matchesCategory && matchesUnread && matchesSearch;
  });

  const unreadCount = adminInbox.filter((i) => !i.isRead).length;
  const inquiryCount = adminInbox.filter((i) => i.type === 'inquiry').length;
  const depositCount = adminInbox.filter((i) => i.type === 'deposit').length;
  const reviewCount = adminInbox.filter((i) => i.type === 'review').length;
  const messageCount = adminInbox.filter((i) => i.type === 'message').length;

  const totalDepositsLogged = adminInbox
    .filter((i) => i.type === 'deposit' && i.amount)
    .reduce((sum, curr) => sum + (curr.amount || 0), 0);

  const getCategoryBadge = (type: AdminInboxCategory) => {
    switch (type) {
      case 'deposit':
        return {
          label: 'DEPOSIT MONEY',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: DollarSign,
          iconColor: 'text-emerald-700 bg-emerald-500/20',
        };
      case 'inquiry':
        return {
          label: 'BOOKING INQUIRY',
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: ClipboardList,
          iconColor: 'text-purple-700 bg-purple-500/20',
        };
      case 'review':
        return {
          label: 'TRAVELER REVIEW',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Star,
          iconColor: 'text-amber-700 bg-amber-500/20',
        };
      case 'message':
        return {
          label: 'CONTACT MESSAGE',
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Mail,
          iconColor: 'text-blue-700 bg-blue-500/20',
        };
      default:
        return {
          label: 'NOTIFICATION',
          bg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
          icon: Bell,
          iconColor: 'text-neutral-700 bg-neutral-200',
        };
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return ts;
    }
  };

  const handleInspectAction = (item: AdminInboxItem) => {
    markInboxItemAsRead(item.id);
    if (!onNavigateToTab) return;

    if (item.type === 'inquiry' || item.type === 'deposit') {
      onNavigateToTab('inquiries');
    } else if (item.type === 'review') {
      onNavigateToTab('testimonials');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#2E0249] text-[#FFC72C] flex items-center justify-center shadow">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-neutral-900 font-['Outfit',sans-serif]">
                  Admin Central Inbox
                </h2>
                {unreadCount > 0 ? (
                  <span className="bg-rose-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full animate-pulse shadow-xs">
                    {unreadCount} Unread
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    All Caught Up
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Real-time activity feed: notifies you instantly whenever a traveler inquires, deposits money, submits a review, or sends a contact message.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllInboxAsRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-purple-700" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Core Activity Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <button
            onClick={() => setActiveCategory('inquiry')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeCategory === 'inquiry'
                ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-400/30'
                : 'bg-neutral-50/80 border-neutral-200 hover:border-purple-300 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-purple-900 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-purple-600" />
                Inquiries
              </span>
              <span className="font-mono text-sm">{inquiryCount}</span>
            </div>
            <p className="text-[11px] text-neutral-500">Trip booking inquiries received</p>
          </button>

          <button
            onClick={() => setActiveCategory('deposit')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeCategory === 'deposit'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30'
                : 'bg-neutral-50/80 border-neutral-200 hover:border-emerald-300 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-emerald-900 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Deposits
              </span>
              <span className="font-mono text-sm">{depositCount}</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              {totalDepositsLogged > 0 ? `${formatJMD(totalDepositsLogged)} total` : 'Money deposits logged'}
            </p>
          </button>

          <button
            onClick={() => setActiveCategory('review')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeCategory === 'review'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-neutral-50/80 border-neutral-200 hover:border-amber-300 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-600" />
                Reviews
              </span>
              <span className="font-mono text-sm">{reviewCount}</span>
            </div>
            <p className="text-[11px] text-neutral-500">Customer feedback & ratings</p>
          </button>

          <button
            onClick={() => setActiveCategory('message')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeCategory === 'message'
                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/30'
                : 'bg-neutral-50/80 border-neutral-200 hover:border-blue-300 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-blue-900 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-600" />
                Messages
              </span>
              <span className="font-mono text-sm">{messageCount}</span>
            </div>
            <p className="text-[11px] text-neutral-500">Direct contact form submissions</p>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs">
            {[
              { id: 'all', label: `All (${adminInbox.length})` },
              { id: 'inquiry', label: `Inquiries (${inquiryCount})` },
              { id: 'deposit', label: `Deposits (${depositCount})` },
              { id: 'review', label: `Reviews (${reviewCount})` },
              { id: 'message', label: `Messages (${messageCount})` },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#2E0249] text-[#FFC72C] shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Unread Only Toggle */}
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer select-none shrink-0 bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-neutral-300 focus:ring-purple-500"
              />
              <span>Unread Only</span>
            </label>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sender, trip, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inbox List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 font-['Outfit',sans-serif]">
              No Notifications Found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {unreadOnly
                ? 'There are no unread notifications in this view. Switch off "Unread Only" to view older entries.'
                : 'No inbox items match your current filters. Any new booking inquiries, deposits, reviews, or messages will show up here.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const badge = getCategoryBadge(item.type);
            const Icon = badge.icon;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-5 border transition-all space-y-3 relative ${
                  !item.isRead
                    ? 'border-purple-300 bg-gradient-to-r from-purple-50/40 via-white to-white shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Unread indicator dot */}
                {!item.isRead && (
                  <span className="absolute top-5 right-5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>
                )}

                {/* Top meta row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${badge.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badge.bg}`}>
                      {badge.label}
                    </span>
                    {item.referenceNumber && (
                      <span className="text-[11px] font-mono font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                        #{item.referenceNumber}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-neutral-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>

                {/* Content Details */}
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-neutral-900 font-['Outfit',sans-serif] flex items-center gap-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Highlights by category */}
                  {item.type === 'deposit' && item.amount && (
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold my-1">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Deposit Amount Recorded:</span>
                      <strong className="text-sm text-emerald-950 font-black">
                        {formatJMD(item.amount)}
                      </strong>
                    </div>
                  )}

                  {item.type === 'review' && item.rating && (
                    <div className="flex items-center gap-1 my-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating!
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-neutral-700 ml-1.5">
                        {item.rating}.0 / 5.0 Rating
                      </span>
                    </div>
                  )}

                  {item.details && (
                    <p className="text-xs text-neutral-500 bg-neutral-50 p-3 rounded-xl border border-neutral-100 italic">
                      "{item.details}"
                    </p>
                  )}
                </div>

                {/* Sender bar & actions */}
                <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-600">
                    <span className="font-bold text-neutral-900">
                      From: {item.senderName}
                    </span>
                    {item.senderPhone && (
                      <a
                        href={`tel:${item.senderPhone.replace(/[^0-9]/g, '')}`}
                        className="text-purple-700 hover:text-purple-900 flex items-center gap-1 font-medium"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{item.senderPhone}</span>
                      </a>
                    )}
                    {item.senderPhone && (
                      <a
                        href={`https://wa.me/${item.senderPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 font-medium"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {item.senderEmail && (
                      <a
                        href={`mailto:${item.senderEmail}`}
                        className="text-neutral-500 hover:text-neutral-800 flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{item.senderEmail}</span>
                      </a>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedItemForModal(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Inspect notification details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    {(item.type === 'inquiry' || item.type === 'deposit' || item.type === 'review') && onNavigateToTab && (
                      <button
                        onClick={() => handleInspectAction(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold flex items-center gap-1 border border-purple-200 cursor-pointer transition-colors"
                      >
                        <span>
                          {item.type === 'inquiry'
                            ? 'Go to Inquiries'
                            : item.type === 'deposit'
                            ? 'View Bookings'
                            : 'Go to Reviews'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => markInboxItemAsRead(item.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        item.isRead
                          ? 'text-neutral-400 hover:text-neutral-600'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold'
                      }`}
                      title={item.isRead ? 'Mark as read' : 'Mark as read'}
                    >
                      <CheckCheck className="w-3.5 h-3.5 inline mr-1" />
                      <span>{item.isRead ? 'Read' : 'Mark Read'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this notification from admin inbox?')) {
                          deleteInboxItem(item.id);
                        }
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: View full details */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-neutral-300 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${getCategoryBadge(selectedItemForModal.type).iconColor}`}>
                  {React.createElement(getCategoryBadge(selectedItemForModal.type).icon, { className: 'w-4 h-4' })}
                </div>
                <h3 className="font-bold text-base text-neutral-900 font-['Outfit',sans-serif]">
                  Notification Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Title</span>
                <p className="font-bold text-sm text-neutral-900 mt-0.5">{selectedItemForModal.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Sender</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{selectedItemForModal.senderName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Date & Time</span>
                  <p className="text-neutral-700 mt-0.5">{formatTimestamp(selectedItemForModal.timestamp)}</p>
                </div>
                {selectedItemForModal.senderPhone && (
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Phone</span>
                    <a href={`tel:${selectedItemForModal.senderPhone}`} className="text-purple-700 font-medium">
                      {selectedItemForModal.senderPhone}
                    </a>
                  </div>
                )}
                {selectedItemForModal.senderEmail && (
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Email</span>
                    <a href={`mailto:${selectedItemForModal.senderEmail}`} className="text-purple-700 font-medium truncate block">
                      {selectedItemForModal.senderEmail}
                    </a>
                  </div>
                )}
              </div>

              {selectedItemForModal.amount && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Amount Deposited:</span>
                  <span className="font-black text-base text-emerald-950">
                    {formatJMD(selectedItemForModal.amount)}
                  </span>
                </div>
              )}

              {selectedItemForModal.tripName && (
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Associated Trip Package</span>
                  <p className="font-bold text-neutral-800 mt-0.5">{selectedItemForModal.tripName}</p>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Summary</span>
                <p className="text-neutral-700 mt-0.5 leading-relaxed">{selectedItemForModal.summary}</p>
              </div>

              {selectedItemForModal.details && (
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Full Submission Body / Details</span>
                  <div className="p-3 bg-neutral-100 rounded-xl text-neutral-800 mt-1 leading-relaxed whitespace-pre-wrap">
                    {selectedItemForModal.details}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <button
                onClick={() => {
                  deleteInboxItem(selectedItemForModal.id);
                  setSelectedItemForModal(null);
                }}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={() => {
                  markInboxItemAsRead(selectedItemForModal.id);
                  setSelectedItemForModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#2E0249] text-[#FFC72C] text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
