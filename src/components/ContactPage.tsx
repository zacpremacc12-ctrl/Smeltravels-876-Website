import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Clock,
  UserCheck,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  ShieldCheck,
  Star,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TravelInterestType, Ambassador } from '../types';

export const ContactPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    trips,
    createBooking,
    showNotification,
    isAdminLoggedIn,
    currentUser,
    loginAdminWithCredentials
  } = useApp();

  const isAdmin = isAdminLoggedIn || (currentUser?.isAdmin ?? false);

  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryOrParish, setCountryOrParish] = useState('Kingston & St. Andrew, Jamaica');
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || '');
  const [adultsCount, setAdultsCount] = useState(1);
  const [preferredTravelDate, setPreferredTravelDate] = useState('');
  const [travelInterestType, setTravelInterestType] = useState<TravelInterestType>('more_info');
  const [message, setMessage] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'whatsapp' | 'phone' | 'email'>('whatsapp');

  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambassador Admin Edit State
  const [editingAmbassador, setEditingAmbassador] = useState<Ambassador | null>(null);
  const [isAddingAmbassador, setIsAddingAmbassador] = useState(false);
  const [isSavingAmbassador, setIsSavingAmbassador] = useState(false);
  const [ambassadorForm, setAmbassadorForm] = useState<{
    id?: string;
    name: string;
    title: string;
    phone: string;
    email: string;
    code: string;
    parishOrRegion: string;
    isActive: boolean;
    isPrimary: boolean;
  }>({
    name: '',
    title: 'Travel Ambassador',
    phone: '(876) 848-9772',
    email: 'zbuchanan.smeltravels@gmail.com',
    code: 'ZAC876',
    parishOrRegion: 'Kingston & St. Andrew',
    isActive: true,
    isPrimary: false,
  });

  // Admin Quick Unlock Modal
  const [adminUnlockOpen, setAdminUnlockOpen] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('smeltravels876@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminUnlockError, setAdminUnlockError] = useState<string | null>(null);

  const activeTrip = trips.find(t => t.id === selectedTripId) || trips[0];

  const currentAmbassadorsList: Ambassador[] = (settings.ambassadors && settings.ambassadors.length > 0)
    ? settings.ambassadors
    : [
        {
          id: 'amb-default',
          name: settings.ambassadorName || 'Zachary Buchanan',
          title: settings.ambassadorTitle || 'Travel Ambassador',
          phone: settings.ambassadorPhone || '(876) 848-9772',
          email: settings.ambassadorEmail || 'zbuchanan.smeltravels@gmail.com',
          code: 'ZAC876',
          isActive: true,
          parishOrRegion: 'Kingston & St. Andrew',
        },
      ];

  const startEditAmbassador = (amb: Ambassador) => {
    const isPrimary = (settings.ambassadorEmail === amb.email) || (settings.ambassadorName === amb.name);
    setEditingAmbassador(amb);
    setIsAddingAmbassador(false);
    setAmbassadorForm({
      id: amb.id,
      name: amb.name,
      title: amb.title || 'Travel Ambassador',
      phone: amb.phone,
      email: amb.email,
      code: amb.code || '',
      parishOrRegion: amb.parishOrRegion || '',
      isActive: amb.isActive !== false,
      isPrimary,
    });
  };

  const startAddAmbassador = () => {
    setEditingAmbassador(null);
    setIsAddingAmbassador(true);
    setAmbassadorForm({
      name: '',
      title: 'Travel Ambassador',
      phone: '(876) ',
      email: '',
      code: `AMB${Math.floor(100 + Math.random() * 900)}`,
      parishOrRegion: 'Kingston & St. Andrew',
      isActive: true,
      isPrimary: false,
    });
  };

  const handleSaveAmbassador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambassadorForm.name.trim()) {
      showNotification('Missing Name', 'Please enter the ambassador full name.', 'warning');
      return;
    }
    if (!ambassadorForm.phone.trim()) {
      showNotification('Missing Phone', 'Please provide a valid phone number.', 'warning');
      return;
    }
    if (!ambassadorForm.email.trim()) {
      showNotification('Missing Email', 'Please enter a valid email address.', 'warning');
      return;
    }

    setIsSavingAmbassador(true);

    try {
      let updatedList: Ambassador[];
      const targetId = editingAmbassador?.id;

      if (targetId) {
        updatedList = currentAmbassadorsList.map((a) =>
          a.id === targetId
            ? {
                ...a,
                name: ambassadorForm.name.trim(),
                title: ambassadorForm.title.trim() || 'Travel Ambassador',
                phone: ambassadorForm.phone.trim(),
                email: ambassadorForm.email.trim(),
                code: ambassadorForm.code.trim().toUpperCase() || a.code,
                parishOrRegion: ambassadorForm.parishOrRegion.trim(),
                isActive: ambassadorForm.isActive,
              }
            : a
        );
      } else {
        const newAmb: Ambassador = {
          id: `amb-${Date.now()}`,
          name: ambassadorForm.name.trim(),
          title: ambassadorForm.title.trim() || 'Travel Ambassador',
          phone: ambassadorForm.phone.trim(),
          email: ambassadorForm.email.trim(),
          code: ambassadorForm.code.trim().toUpperCase() || `AMB${Math.floor(100 + Math.random() * 900)}`,
          parishOrRegion: ambassadorForm.parishOrRegion.trim(),
          isActive: ambassadorForm.isActive,
        };
        updatedList = [...currentAmbassadorsList, newAmb];
      }

      const shouldBePrimary = ambassadorForm.isPrimary ||
        (targetId ? settings.ambassadorEmail === editingAmbassador?.email : updatedList.length === 1);

      const newSettings = {
        ...settings,
        ambassadors: updatedList,
        ...(shouldBePrimary
          ? {
              ambassadorName: ambassadorForm.name.trim(),
              ambassadorTitle: ambassadorForm.title.trim() || 'Travel Ambassador',
              ambassadorPhone: ambassadorForm.phone.trim(),
              ambassadorEmail: ambassadorForm.email.trim(),
            }
          : {}),
      };

      await updateSettings(newSettings);

      setEditingAmbassador(null);
      setIsAddingAmbassador(false);

      showNotification(
        'Published LIVE to Website! ✨',
        `${ambassadorForm.name}'s contact info is now LIVE and visible to all customers across the website.`
      );
    } catch (err: any) {
      showNotification('Save Error', 'Failed to publish changes. Please try again.', 'warning');
    } finally {
      setIsSavingAmbassador(false);
    }
  };

  const handleSetPrimaryAmbassador = async (amb: Ambassador) => {
    const newSettings = {
      ...settings,
      ambassadorName: amb.name,
      ambassadorTitle: amb.title,
      ambassadorPhone: amb.phone,
      ambassadorEmail: amb.email,
    };
    await updateSettings(newSettings);
    showNotification('Primary Ambassador Updated', `${amb.name} is now designated as the primary agency contact across the site.`);
  };

  const handleToggleAmbassadorActive = async (amb: Ambassador) => {
    const updated = currentAmbassadorsList.map((a) =>
      a.id === amb.id ? { ...a, isActive: a.isActive === false ? true : false } : a
    );
    await updateSettings({ ...settings, ambassadors: updated });
    showNotification('Visibility Updated', `${amb.name} is now ${amb.isActive === false ? 'visible to all customers' : 'hidden from public view'}.`);
  };

  const handleDeleteAmbassador = async (amb: Ambassador) => {
    if (!window.confirm(`Are you sure you want to remove ambassador "${amb.name}" from the website? This will update LIVE for all customers.`)) {
      return;
    }
    const updated = currentAmbassadorsList.filter((a) => a.id !== amb.id);
    const isDeletingPrimary = settings.ambassadorEmail === amb.email;
    const nextPrimary = updated[0];

    const newSettings = {
      ...settings,
      ambassadors: updated,
      ...(isDeletingPrimary && nextPrimary
        ? {
            ambassadorName: nextPrimary.name,
            ambassadorTitle: nextPrimary.title,
            ambassadorPhone: nextPrimary.phone,
            ambassadorEmail: nextPrimary.email,
          }
        : {}),
    };

    await updateSettings(newSettings);
    showNotification('Ambassador Removed', `${amb.name} was removed from the website.`, 'info');
  };

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminUnlockError(null);
    const res = loginAdminWithCredentials(adminEmailInput, adminPasswordInput);
    if (res.success) {
      setAdminUnlockOpen(false);
      setAdminPasswordInput('');
      showNotification('Admin Controls Unlocked', 'You can now edit ambassador names, emails, and phone numbers directly.');
    } else {
      setAdminUnlockError(res.error || 'Invalid admin credentials.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !phone) {
      showNotification('Missing Fields', 'Please complete your name, email, and phone number.', 'warning');
      return;
    }

    setIsSubmitting(true);

    const ref = createBooking({
      tripId: activeTrip?.id || 'general-inquiry',
      tripName: activeTrip?.name || 'General Inquiry',
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      countryOrParish: countryOrParish.trim(),
      adultsCount,
      childrenCount: 0,
      preferredTravelDate: preferredTravelDate || activeTrip?.dates || 'Flexible',
      travelInterestType,
      specialRequests: message.trim(),
      preferredContactMethod,
      status: 'New',
      depositPaid: 0,
      totalPrice: activeTrip?.price || 0,
      currency: 'JMD',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRef(ref);
      showNotification('Inquiry Registered', `Reference code ${ref} generated.`);
    }, 400);
  };

  const copyRef = () => {
    if (!submittedRef) return;
    navigator.clipboard.writeText(submittedRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const getWhatsAppLink = () => {
    const text = `Hi SMELTRAVELS876! I just sent an inquiry (${submittedRef}) regarding travel planning. My name is ${customerName}.`;
    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#2E0249] text-xs font-bold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5" />
            <span>CONNECT WITH SMELTRAVELS876</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight font-['Outfit',sans-serif]">
            Get In Touch With Our Travel Advisors
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">
            Have questions about upcoming departures, deposit structures, or Schengen Visa assistance? We are here to guide your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details & Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Agency Office */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                SMELTRAVELS876 Headquarters
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 font-semibold block">Official Phone & WhatsApp</span>
                    <a
                      href={`tel:${settings.primaryPhone.replace(/[^0-9]/g, '')}`}
                      className="font-bold text-neutral-900 hover:text-[#2E0249] text-base"
                    >
                      {settings.primaryPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 font-semibold block">Official Email</span>
                    <a
                      href={`mailto:${settings.primaryEmail}`}
                      className="font-bold text-neutral-900 hover:text-[#2E0249]"
                    >
                      {settings.primaryEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 font-semibold block">Operating Base</span>
                    <span className="font-semibold text-neutral-800">{settings.operatingBase}</span>
                    <p className="text-xs text-neutral-500 mt-0.5">Departures coordinated via Norman Manley Int'l (KIN).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 font-semibold block">Business Hours</span>
                    <span className="font-semibold text-neutral-800">{settings.businessHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ambassador Dedicated Contact & Live Admin Editor */}
            <div
              id="contact-ambassadors-container"
              className="bg-gradient-to-br from-[#2E0249] to-[#3B185F] text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4 relative overflow-hidden border border-purple-800/60"
            >
              {/* Header with Admin Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FFC72C] text-[#2E0249] flex items-center justify-center font-black shadow">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFC72C] block">
                      Agency Ambassadors
                    </span>
                    <h3 className="text-lg font-bold font-['Outfit',sans-serif]">
                      Connect with an Ambassador
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isAdmin ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Admin Mode: Live Sync
                      </span>
                      <button
                        type="button"
                        onClick={startAddAmbassador}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFC72C] hover:bg-yellow-400 text-[#2E0249] font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
                        title="Add a new ambassador to the website"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Ambassador</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded-full text-purple-200">
                        Direct Support
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdminUnlockOpen(true)}
                        className="text-[11px] text-purple-300 hover:text-[#FFC72C] px-2 py-0.5 rounded-lg border border-purple-700/60 hover:border-[#FFC72C]/80 flex items-center gap-1 cursor-pointer transition-all"
                        title="Admin Access to Edit Ambassadors"
                      >
                        <ShieldCheck className="w-3 h-3 text-[#FFC72C]" />
                        <span>Admin Edit</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Descriptive context */}
              {isAdmin ? (
                <div className="bg-purple-950/80 border border-[#FFC72C]/40 rounded-xl p-3 text-xs text-purple-100 flex items-start gap-2.5 shadow-inner">
                  <Sparkles className="w-4 h-4 text-[#FFC72C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#FFC72C]">Live Ambassador CMS Active:</strong> You can edit any ambassador's name, email, phone number, and territory directly below. All changes publish <strong className="text-white">LIVE to all website visitors</strong> immediately.
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-200 leading-relaxed">
                  Need specialized assistance with group packages, custom itineraries, or payment plan scheduling? Connect directly with any of our verified ambassadors:
                </p>
              )}

              {/* Ambassadors list */}
              <div className="space-y-3 pt-2 border-t border-purple-800/80 text-xs">
                {(isAdmin ? currentAmbassadorsList : currentAmbassadorsList.filter((a) => a.isActive !== false)).map((amb) => {
                  const isPrimary = settings.ambassadorEmail === amb.email || settings.ambassadorName === amb.name;
                  const isHidden = amb.isActive === false;

                  return (
                    <div
                      key={amb.id}
                      className={`bg-purple-950/60 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        isPrimary
                          ? 'border-[#FFC72C]/60 shadow-md ring-1 ring-[#FFC72C]/20'
                          : 'border-purple-800/60 hover:border-purple-700'
                      } ${isHidden ? 'opacity-70 border-dashed border-amber-500/50' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        {/* Ambassador Details */}
                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="font-black text-white text-sm sm:text-base font-['Outfit',sans-serif]">
                              {amb.name}
                            </span>
                            {isPrimary && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FFC72C] bg-[#FFC72C]/15 border border-[#FFC72C]/40 px-2 py-0.5 rounded-md">
                                <Star className="w-2.5 h-2.5 fill-[#FFC72C]" />
                                Primary Contact
                              </span>
                            )}
                            {isAdmin && isHidden && (
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md">
                                Hidden from Public
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-purple-300 font-medium">
                            {amb.title}
                            {amb.parishOrRegion ? ` • ${amb.parishOrRegion}` : ''}
                          </div>

                          <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px]">
                            {amb.email && (
                              <a
                                href={`mailto:${amb.email}`}
                                className="text-neutral-300 hover:text-[#FFC72C] flex items-center gap-1.5 transition-colors font-medium"
                              >
                                <Mail className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
                                <span className="underline decoration-purple-700 hover:decoration-[#FFC72C]">{amb.email}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Public Phone Button */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                          <a
                            href={`tel:${amb.phone.replace(/[^0-9]/g, '')}`}
                            className="text-xs font-bold text-[#FFC72C] hover:underline bg-[#2E0249] px-3.5 py-1.5 rounded-lg border border-purple-700 flex items-center gap-1.5 shadow-sm hover:border-[#FFC72C] transition-all"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{amb.phone}</span>
                          </a>
                        </div>
                      </div>

                      {/* Admin Quick Action Controls */}
                      {isAdmin && (
                        <div className="mt-3 pt-3 border-t border-purple-800/60 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditAmbassador(amb)}
                              className="text-xs font-bold text-[#FFC72C] bg-purple-900/90 hover:bg-purple-800 border border-purple-600 hover:border-[#FFC72C] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                              title="Edit ambassador name, email, phone, or region"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Details</span>
                            </button>

                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryAmbassador(amb)}
                                className="text-[11px] font-semibold text-purple-200 hover:text-[#FFC72C] bg-purple-950 px-2.5 py-1.5 rounded-lg border border-purple-800 hover:border-purple-600 flex items-center gap-1 cursor-pointer transition-all"
                                title="Set this ambassador as the primary agency contact"
                              >
                                <Star className="w-3 h-3" />
                                <span>Set as Primary</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleAmbassadorActive(amb)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                amb.isActive === false
                                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300 hover:bg-emerald-900'
                                  : 'bg-purple-950 border-purple-800 text-purple-300 hover:text-white'
                              }`}
                              title={amb.isActive === false ? 'Publish to customers' : 'Hide from public view'}
                            >
                              {amb.isActive === false ? (
                                <>
                                  <Eye className="w-3 h-3 text-emerald-400" />
                                  <span>Make Visible</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 text-amber-300" />
                                  <span>Hide</span>
                                </>
                              )}
                            </button>

                            {currentAmbassadorsList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAmbassador(amb)}
                                className="p-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-950/80 rounded-lg border border-purple-800 hover:border-rose-600 cursor-pointer transition-all"
                                title="Remove ambassador from website"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Form or Confirmation */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200 shadow-sm">
              {submittedRef ? (
                <div className="space-y-6 text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-neutral-900 font-['Outfit',sans-serif]">
                      Inquiry Successfully Received!
                    </h3>
                    <p className="text-sm text-neutral-600 max-w-md mx-auto">
                      Thank you, {customerName}. Your travel inquiry has been saved into the SMELTRAVELS876 management system.
                    </p>
                  </div>

                  {/* Reference Display */}
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 max-w-md mx-auto space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-900 block">
                      Your Unique Reference Number
                    </span>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl sm:text-3xl font-mono font-black text-[#2E0249]">
                        {submittedRef}
                      </span>
                      <button
                        onClick={copyRef}
                        className="p-2 rounded-lg bg-white border border-purple-300 hover:bg-purple-100 text-[#2E0249] transition-colors"
                        title="Copy code"
                      >
                        {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Next Steps Checklist */}
                  <div className="bg-neutral-50 rounded-2xl p-5 text-xs text-neutral-700 text-left max-w-md mx-auto space-y-2.5 border border-neutral-200">
                    <h4 className="font-bold text-neutral-900 text-sm">What Happens Next:</h4>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2E0249] text-[#FFC72C] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                      <span>A travel coordinator reviews availability for {activeTrip?.name}.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2E0249] text-[#FFC72C] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                      <span>We reach out via your preferred method ({preferredContactMethod.toUpperCase()}) to confirm your package spot.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#2E0249] text-[#FFC72C] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                      <span>We provide bank/card transfer details for your deposit to lock in your reservation.</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm px-6 py-3 rounded-xl shadow transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Message with Reference on WhatsApp</span>
                    </a>

                    <button
                      onClick={() => setSubmittedRef(null)}
                      className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-neutral-900 font-['Outfit',sans-serif]">
                      Send Us an Inquiry
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Fill out your travel preferences and we will generate an official booking reference.
                    </p>
                  </div>

                  {/* Stage of Interest */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                      Your Booking Stage
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setTravelInterestType('ready_to_book')}
                        className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                          travelInterestType === 'ready_to_book'
                            ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249]'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        ✓ Ready to book
                      </button>

                      <button
                        type="button"
                        onClick={() => setTravelInterestType('more_info')}
                        className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                          travelInterestType === 'more_info'
                            ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249]'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        ℹ Want more info
                      </button>

                      <button
                        type="button"
                        onClick={() => setTravelInterestType('need_help')}
                        className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                          travelInterestType === 'need_help'
                            ? 'bg-[#2E0249] text-[#FFC72C] border-[#2E0249]'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                        }`}
                      >
                        💬 Interested / Need help
                      </button>
                    </div>
                  </div>

                  {/* Traveler Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Althea Thompson"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. althea@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. (876) 834-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Country / Parish
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kingston, St. Catherine, Diaspora"
                        value={countryOrParish}
                        onChange={(e) => setCountryOrParish(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      />
                    </div>
                  </div>

                  {/* Trip Selection & Travelers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Interested Trip Package
                      </label>
                      <select
                        value={selectedTripId}
                        onChange={(e) => setSelectedTripId(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      >
                        {trips.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.countryFlag} {t.name} ({t.dates})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Preferred Contact Method
                      </label>
                      <select
                        value={preferredContactMethod}
                        onChange={(e) => setPreferredContactMethod(e.target.value as any)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                      >
                        <option value="whatsapp">WhatsApp (Fastest response)</option>
                        <option value="phone">Phone Call</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Message / Special Requests / Visa Inquiries
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ask about payment schedules, single occupancy upgrades, Schengen visa guidance, or custom requests..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-3 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2E0249] hover:bg-[#3B185F] text-[#FFC72C] font-bold text-sm py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Inquiry & Generate Reference</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Live Ambassador Editor Modal */}
        {(editingAmbassador !== null || isAddingAmbassador) && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 my-8 border border-neutral-200 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-['Outfit',sans-serif] text-neutral-900">
                      {isAddingAmbassador ? 'Add Agency Ambassador' : 'Edit Ambassador Profile'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Updates publish LIVE across entire website</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAmbassador(null);
                    setIsAddingAmbassador(false);
                  }}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAmbassador} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ambassador Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Ambassador Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={ambassadorForm.name}
                      onChange={(e) => setAmbassadorForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Zachary Buchanan"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 font-semibold focus:outline-none focus:border-[#2E0249] focus:ring-1 focus:ring-[#2E0249]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Official Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={ambassadorForm.email}
                      onChange={(e) => setAmbassadorForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. zbuchanan.smeltravels@gmail.com"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249] focus:ring-1 focus:ring-[#2E0249]"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Direct Phone / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={ambassadorForm.phone}
                      onChange={(e) => setAmbassadorForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. (876) 848-9772"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249] focus:ring-1 focus:ring-[#2E0249]"
                    />
                  </div>

                  {/* Title / Role */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Agency Role / Title
                    </label>
                    <input
                      type="text"
                      value={ambassadorForm.title}
                      onChange={(e) => setAmbassadorForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Senior Travel Ambassador"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249] focus:ring-1 focus:ring-[#2E0249]"
                    />
                  </div>

                  {/* Territory / Parish */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Parish / Coverage Territory
                    </label>
                    <input
                      type="text"
                      value={ambassadorForm.parishOrRegion}
                      onChange={(e) => setAmbassadorForm(prev => ({ ...prev, parishOrRegion: e.target.value }))}
                      placeholder="e.g. Kingston & St. Andrew"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249] focus:ring-1 focus:ring-[#2E0249]"
                    />
                  </div>

                  {/* Referral / Staff Code */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Ambassador Discount / Referral Code
                    </label>
                    <input
                      type="text"
                      value={ambassadorForm.code}
                      onChange={(e) => setAmbassadorForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. ZAC876"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 uppercase font-mono focus:outline-none focus:border-[#2E0249] focus:ring-1 focus:ring-[#2E0249]"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ambassadorForm.isPrimary}
                      onChange={(e) => setAmbassadorForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#2E0249] focus:ring-[#2E0249] mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#2E0249] block">
                        Designate as Primary Agency Ambassador
                      </span>
                      <span className="text-[11px] text-neutral-600">
                        Synchronizes across website header, footer, booking forms, and agency touchpoints.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ambassadorForm.isActive}
                      onChange={(e) => setAmbassadorForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#2E0249] focus:ring-[#2E0249] mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-neutral-800 block">
                        Visible on Website to All Customers
                      </span>
                      <span className="text-[11px] text-neutral-600">
                        When unchecked, this ambassador is hidden from customer contact lists.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Live Preview Box */}
                <div className="bg-neutral-900 text-white rounded-2xl p-4 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                    <span>Live Customer View Preview</span>
                    <span className="text-[#FFC72C] font-semibold">Real-Time Sync</span>
                  </div>
                  <div className="bg-purple-950/80 p-3.5 rounded-xl border border-purple-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{ambassadorForm.name || 'Ambassador Name'}</span>
                        {ambassadorForm.isPrimary && (
                          <span className="text-[10px] font-bold text-[#FFC72C] bg-[#FFC72C]/20 border border-[#FFC72C]/40 px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-purple-300">
                        {ambassadorForm.title || 'Travel Ambassador'} • {ambassadorForm.parishOrRegion || 'Jamaica'}
                      </div>
                      <div className="text-[11px] text-neutral-300 mt-0.5">
                        {ambassadorForm.email || 'ambassador@smeltravels.com'}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#FFC72C] bg-[#2E0249] px-3 py-1.5 rounded-lg border border-purple-700">
                      {ambassadorForm.phone || '(876) 000-0000'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAmbassador(null);
                      setIsAddingAmbassador(false);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-100 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAmbassador}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2E0249] to-[#3B185F] text-[#FFC72C] font-bold text-xs shadow-lg hover:shadow-xl hover:from-[#3B185F] hover:to-[#2E0249] cursor-pointer flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSavingAmbassador ? (
                      <span>Publishing Live...</span>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save &amp; Publish LIVE to Website</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Quick Unlock Modal */}
        {adminUnlockOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 border border-neutral-200 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#2E0249] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-[#2E0249]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-['Outfit',sans-serif] text-neutral-900">
                      Admin Authentication
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Unlock live ambassador editing
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminUnlockOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {adminUnlockError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminUnlockError}</span>
                </div>
              )}

              <form onSubmit={handleAdminUnlock} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="smeltravels876@gmail.com"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#2E0249]"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminEmailInput('smeltravels876@gmail.com');
                      setAdminPasswordInput('Jjrrss5521');
                    }}
                    className="text-xs text-purple-700 hover:text-purple-900 font-semibold underline cursor-pointer"
                  >
                    Quick Autofill Super Admin (smeltravels876@gmail.com)
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdminUnlockOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-semibold text-xs hover:bg-neutral-100 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#2E0249] text-[#FFC72C] font-bold text-xs shadow-md hover:bg-[#3B185F] cursor-pointer transition-colors"
                  >
                    Sign In &amp; Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
