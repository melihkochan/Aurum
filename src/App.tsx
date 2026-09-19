import React, { useState, useMemo } from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Sidebar } from './components/navigation/Sidebar';
import type { NavTab } from './components/navigation/Sidebar';
import { MobileHeader } from './components/navigation/MobileHeader';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { MobileDrawer } from './components/navigation/MobileDrawer';
import { AddAssetModal } from './components/assets/AddAssetModal';
import { AddIncomeModal } from './components/modals/AddIncomeModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { TransferModal } from './components/modals/TransferModal';
import { AddGoalModal } from './components/goals/AddGoalModal';
import { QuickActionModal } from './components/modals/QuickActionModal';
import type { QuickActionType } from './components/modals/QuickActionModal';
import { DashboardView } from './components/views/DashboardView';
import { PortfolioView } from './components/views/PortfolioView';
import { GoalsView } from './components/views/GoalsView';
import { IncomeExpenseView } from './components/views/IncomeExpenseView';
import { TransactionsView } from './components/views/TransactionsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { NotesView } from './components/views/NotesView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthView } from './components/auth/AuthView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { UserAvatar } from './components/ui/UserAvatar';
import { ScrollToTop } from './components/ui/ScrollToTop';
import type { AssetKey } from './services/market/types';
import { Zap, Calendar, Sparkles, LogOut } from 'lucide-react';

const MainShell: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preselectedAsset, setPreselectedAsset] = useState<AssetKey | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New action modals state with stack tracking
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isFromQuickAction, setIsFromQuickAction] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);

  const { preferences } = usePortfolio();
  const { user, logout, isOnboardingOpen, setIsOnboardingOpen } = useAuth();
  const displayName = user?.name || preferences.name || 'Melih';

  const todayDateStr = useMemo(() => {
    const now = new Date();
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  const handleOpenAddModal = (assetKey?: string) => {
    if (assetKey) {
      setPreselectedAsset(assetKey as AssetKey);
    } else {
      setPreselectedAsset(null);
    }
    setIsAddModalOpen(true);
  };

  const handleOpenCashflow = (type: 'income' | 'expense') => {
    if (type === 'income') {
      setIsIncomeModalOpen(true);
    } else {
      setIsExpenseModalOpen(true);
    }
  };

  const handleSelectQuickAction = (action: QuickActionType) => {
    setIsFromQuickAction(true);
    setIsQuickActionOpen(false);
    if (action === 'asset') {
      handleOpenAddModal();
    } else if (action === 'income') {
      setIsIncomeModalOpen(true);
    } else if (action === 'expense') {
      setIsExpenseModalOpen(true);
    } else if (action === 'transfer') {
      setIsTransferModalOpen(true);
    } else if (action === 'goal') {
      setIsAddGoalModalOpen(true);
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    if (isFromQuickAction) {
      setIsFromQuickAction(false);
      setIsQuickActionOpen(true);
    }
  };

  const handleCloseIncomeModal = () => {
    setIsIncomeModalOpen(false);
    if (isFromQuickAction) {
      setIsFromQuickAction(false);
      setIsQuickActionOpen(true);
    }
  };

  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    if (isFromQuickAction) {
      setIsFromQuickAction(false);
      setIsQuickActionOpen(true);
    }
  };

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    if (isFromQuickAction) {
      setIsFromQuickAction(false);
      setIsQuickActionOpen(true);
    }
  };

  const handleCloseGoalModal = () => {
    setIsAddGoalModalOpen(false);
    if (isFromQuickAction) {
      setIsFromQuickAction(false);
      setIsQuickActionOpen(true);
    }
  };

  const renderView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenAddModal={handleOpenAddModal}
            onOpenCashflowModal={handleOpenCashflow}
            onNavigateToGoals={() => setCurrentTab('goals')}
            onOpenAddGoal={() => setIsAddGoalModalOpen(true)}
            onNavigateToIncomeExpense={() => setCurrentTab('income-expense')}
            onNavigateToTransactions={() => setCurrentTab('transactions')}
          />
        );
      case 'portfolio':
        return <PortfolioView onOpenAddModal={handleOpenAddModal} />;
      case 'goals':
        return <GoalsView />;
      case 'income-expense':
        return <IncomeExpenseView onNavigateToTransactions={() => setCurrentTab('transactions')} />;
      case 'transactions':
        return <TransactionsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'notes':
        return <NotesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onOpenAddModal={handleOpenAddModal}
            onOpenCashflowModal={handleOpenCashflow}
            onNavigateToGoals={() => setCurrentTab('goals')}
            onOpenAddGoal={() => setIsAddGoalModalOpen(true)}
            onNavigateToIncomeExpense={() => setCurrentTab('income-expense')}
            onNavigateToTransactions={() => setCurrentTab('transactions')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white w-full selection:bg-[#E5B85C]/30 selection:text-[#F3C969]">
      {/* Desktop Fixed Left Dock (Pinned to viewport) */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area (Offset by 80px on desktop so sidebar remains fixed) */}
      <div className="lg:pl-20 min-h-screen flex flex-col w-full">
        {/* Mobile Top Header (Reference 1 style) */}
        <MobileHeader
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenAddModal={() => setIsQuickActionOpen(true)}
        />

        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between border-b border-white/[0.06] bg-[#070709]/70 backdrop-blur-2xl sticky top-0 z-20 py-4 px-8 xl:px-12">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-xl font-extrabold tracking-tight text-white">
              {currentTab === 'dashboard' && 'Finansal Kontrol Paneli'}
              {currentTab === 'portfolio' && 'Portföy & Varlıklar'}
              {currentTab === 'goals' && 'Finansal Hedefler'}
              {currentTab === 'income-expense' && 'Gelir & Gider'}
              {currentTab === 'transactions' && 'İşlem Geçmişi'}
              {currentTab === 'analytics' && 'Portföy Analitiği'}
              {currentTab === 'notes' && 'Notlar ve Yapılacaklar'}
              {currentTab === 'settings' && 'Ayarlar'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Quick Action Button in Header */}
            <button
              onClick={() => {
                setIsFromQuickAction(false);
                setIsQuickActionOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#E5B85C]/15 hover:bg-[#E5B85C]/25 border border-[#E5B85C]/30 text-xs font-bold text-[#F3C969] transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(229,184,92,0.15)]"
            >
              <Zap className="w-3.5 h-3.5 fill-[#F3C969]" />
              <span>Hızlı İşlem</span>
            </button>

            {/* Live Date display */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 bg-white/[0.03] border border-white/[0.05] px-3.5 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-[#E5B85C]" />
              <span>{todayDateStr}</span>
            </div>

            {/* User Profile Badge & Logout Button */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/[0.08]">
              <div
                onClick={() => setCurrentTab('settings')}
                className="cursor-pointer hover:scale-105 transition-transform"
                title="Profil ve Ayarlar"
              >
                <UserAvatar
                  avatar={user?.avatar}
                  avatarType={user?.avatarType}
                  avatarColor={user?.avatarColor}
                  name={displayName}
                  size="sm"
                />
              </div>
              <div
                onClick={() => setCurrentTab('settings')}
                className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity"
                title="Profil ve Ayarlar"
              >
                <span className="text-xs font-bold text-white tracking-tight">{displayName}</span>
                <span className="text-[10px] text-[#E5B85C] font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Premium Kasa
                </span>
              </div>
              <button
                onClick={logout}
                title="Güvenli Çıkış Yap"
                className="ml-2 p-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/15 border border-white/[0.06] hover:border-rose-500/25 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Primary View Container - Fluid 1680px container with generous breathing room */}
        <main className="flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-12 py-6 lg:py-10">
          {renderView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={() => setIsQuickActionOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Mobile Right Slide-Over Glass Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Quick Action Universal Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => {
          setIsQuickActionOpen(false);
          setIsFromQuickAction(false);
        }}
        onSelectAction={handleSelectQuickAction}
      />

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        preselectedAssetKey={preselectedAsset}
      />

      {/* Add Income Modal */}
      <AddIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={handleCloseIncomeModal}
      />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={handleCloseExpenseModal}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransferModal}
      />

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={handleCloseGoalModal}
      />

      {/* Onboarding Profile Completion Modal for Google, Apple, and Email users */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />

      {/* Floating Scroll To Top */}
      <ScrollToTop />
    </div>
  );
};

const AuthGate: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'forgot'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E5B85C] to-[#F5D07A] flex items-center justify-center text-[#0A0A0C] font-black text-2xl shadow-[0_0_30px_rgba(229,184,92,0.3)] animate-pulse">
            A
          </div>
          <span className="text-xs text-zinc-400 font-medium tracking-widest uppercase">AURUM Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authScreen === 'forgot') {
      return <ForgotPasswordView onNavigateToLogin={() => setAuthScreen('login')} />;
    }
    return (
      <AuthView
        initialTab={authScreen === 'register' ? 'register' : 'login'}
        onForgotPassword={() => setAuthScreen('forgot')}
      />
    );
  }

  return (
    <PortfolioProvider>
      <MainShell />
    </PortfolioProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

