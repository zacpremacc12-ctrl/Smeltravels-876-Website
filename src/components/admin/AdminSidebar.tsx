import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  UserCheck,
  Inbox,
  Mail,
  Plane,
  Compass,
  Sparkles,
  MapPin,
  Globe,
  Layers,
  BookOpen,
  HelpCircle,
  Tag,
  Star,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Building2,
  X,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  unreadInboxCount: number;
  excelOrdersCount: number;
  bookingsCount: number;
  tripsCount: number;
  localTripsCount: number;
  destinationsCount: number;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  closeMobile: () => void;
  onLogout: () => void;
  adminRole: string;
  adminEmail: string | null;
}

interface NavSection {
  title: string;
  id: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadInboxCount,
  excelOrdersCount,
  bookingsCount,
  tripsCount,
  localTripsCount,
  destinationsCount,
  isCollapsed,
  toggleCollapse,
  isMobileOpen,
  closeMobile,
  onLogout,
  adminRole,
  adminEmail,
}) => {
  // Navigation sections structure
  const navSections: NavSection[] = [
    {
      title: 'Executive Overview',
      id: 'overview-section',
      items: [
        {
          id: 'overview',
          label: 'Dashboard Overview',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Bookings & Orders',
      id: 'bookings-section',
      items: [
        {
          id: 'excel-orders',
          label: 'Master Bookings & Excel',
          icon: FileSpreadsheet,
          badge: excelOrdersCount,
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        },
        {
          id: 'inquiries',
          label: 'Website Inquiries',
          icon: UserCheck,
          badge: bookingsCount,
        },
        {
          id: 'inbox',
          label: 'Admin Inbox & Briefs',
          icon: Inbox,
          badge: unreadInboxCount > 0 ? `${unreadInboxCount} new` : undefined,
          badgeColor: 'bg-amber-400 text-slate-900 font-extrabold animate-pulse',
        },
      ],
    },
    {
      title: 'Travel Inventory',
      id: 'inventory-section',
      items: [
        {
          id: 'trips',
          label: 'International Packages',
          icon: Plane,
          badge: tripsCount,
        },
        {
          id: 'local-trips',
          label: 'Jamaican Local Trips',
          icon: Compass,
          badge: localTripsCount,
        },
        {
          id: 'featured-trip',
          label: 'Featured Hero Trip',
          icon: Sparkles,
        },
        {
          id: 'destinations',
          label: 'Destinations Catalog',
          icon: MapPin,
          badge: destinationsCount,
        },
        {
          id: 'custom-destinations',
          label: 'Custom Trip Destinations',
          icon: Globe,
        },
      ],
    },
    {
      title: 'Pricing & Flights',
      id: 'pricing-section',
      items: [
        {
          id: 'origin-pricing',
          label: 'Origin & Route Pricing',
          icon: Layers,
        },
        {
          id: 'wingo-rates',
          label: 'Wingo Rates Database',
          icon: Plane,
          badge: '11 Countries',
          badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        },
      ],
    },
    {
      title: 'Content & Marketing',
      id: 'content-section',
      items: [
        {
          id: 'guides',
          label: 'Blog & Travel Guides',
          icon: BookOpen,
        },
        {
          id: 'faqs',
          label: 'FAQs Management',
          icon: HelpCircle,
        },
        {
          id: 'offers',
          label: 'Promotional Offers',
          icon: Tag,
        },
        {
          id: 'testimonials',
          label: 'Reviews & Testimonials',
          icon: Star,
        },
      ],
    },
    {
      title: 'Agency Administration',
      id: 'admin-section',
      items: [
        {
          id: 'email-notifications',
          label: 'Email Notifications & Logs',
          icon: Mail,
          badge: 'Resend',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        },
        {
          id: 'settings',
          label: 'Agency Settings & WiPay',
          icon: SettingsIcon,
        },
      ],
    },
  ];

  // Accordion open/close state for sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobileOpen) {
      closeMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B132B] text-slate-300 select-none border-r border-slate-800/80">
      {/* Top Header / Agency Brand */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
            <img
              src="/logo.png"
              alt="SMELTRAVELS876"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="font-extrabold text-white text-sm tracking-tight truncate font-['Outfit',sans-serif]">
                SMELTRAVELS876
              </div>
              <div className="text-[10px] text-[#38BDF8] font-bold tracking-wider uppercase truncate">
                Admin Console
              </div>
            </div>
          )}
        </div>

        {/* Collapse / Expand Toggle Button (Desktop) */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Close Button (Mobile) */}
        <button
          onClick={closeMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role / Live Indicator Pill */}
      {!isCollapsed && (
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/50 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-semibold">{adminRole || 'Administrator'}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
      )}

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((section) => {
          const isSectionOpen = !collapsedSections[section.id];
          const hasActiveItem = section.items.some((item) => item.id === activeTab);

          return (
            <div key={section.id} className="space-y-1">
              {/* Section Header (Collapsible) */}
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors group cursor-pointer"
                >
                  <span className={hasActiveItem ? 'text-[#38BDF8]' : ''}>
                    {section.title}
                  </span>
                  <span className="text-slate-400 group-hover:text-slate-200">
                    {isSectionOpen ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </span>
                </button>
              )}

              {/* Items List */}
              {(isCollapsed || isSectionOpen) && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer relative group ${
                          isActive
                            ? 'bg-[#1E293B] text-[#38BDF8] font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        {/* Active vertical bar indicator */}
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#38BDF8]"></span>
                        )}

                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#38BDF8]' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />

                        {!isCollapsed && (
                          <span className="truncate flex-1 text-left">
                            {item.label}
                          </span>
                        )}

                        {!isCollapsed && item.badge !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {adminEmail || 'Administrator'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Signed in as {adminRole || 'Super Admin'}
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
            title="Sign out of Admin Console"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Container */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        <div className="sticky top-0 h-screen">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={closeMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
