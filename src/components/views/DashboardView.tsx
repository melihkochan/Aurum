import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { TotalNetWorth } from '../dashboard/TotalNetWorth';
import { PerformanceChart } from '../dashboard/PerformanceChart';
import { AssetAllocation } from '../dashboard/AssetAllocation';
import { MonthlyCashflowCard } from '../dashboard/MonthlyCashflowCard';
import { DashboardGoalsPreview } from '../dashboard/DashboardGoalsPreview';
import { AssetCard } from '../dashboard/AssetCard';
import { MarketOverview } from '../dashboard/MarketOverview';
import { RecentActivity } from '../dashboard/RecentActivity';
import { AssetDetailModal } from '../assets/AssetDetailModal';
import type { AssetAllocationItem } from '../../context/PortfolioContext';

interface DashboardViewProps {
  onOpenAddModal: (assetKey?: string) => void;
  onOpenCashflowModal?: (type: 'income' | 'expense') => void;
  onNavigateToGoals?: () => void;
  onOpenAddGoal?: () => void;
  onNavigateToIncomeExpense?: () => void;
  onNavigateToTransactions?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onOpenCashflowModal = () => {},
  onNavigateToGoals = () => {},
  onOpenAddGoal = () => {},
  onNavigateToIncomeExpense: _onNavigateToIncomeExpense = () => {},
  onNavigateToTransactions,
}) => {
  const { ownedAssets } = usePortfolio();
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<AssetAllocationItem | null>(null);

  return (
    <div className="space-y-12 lg:space-y-14 pb-24 md:pb-16">
      {/* 1. TOTAL NET WORTH HERO (Centerpiece with breathing room) */}
      <section>
        <TotalNetWorth onOpenAddModal={(key) => onOpenAddModal(key)} />
      </section>

      {/* 2. PERFORMANCE + ALLOCATION (2-column: 68% / 32%) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        <div className="lg:col-span-8">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-4">
          <AssetAllocation />
        </div>
      </section>

      {/* 3. MONTHLY CASHFLOW & SAVINGS GOALS (2-column balanced section) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <MonthlyCashflowCard onOpenCashflowModal={onOpenCashflowModal} />
        </div>
        <div className="lg:col-span-6 flex flex-col">
          <DashboardGoalsPreview
            onNavigateToGoals={onNavigateToGoals}
            onOpenAddGoal={onOpenAddGoal}
          />
        </div>
      </section>

      {/* 4. MY ASSETS (Dynamic responsive grid: 2x2 or 4-row when 4 items, never 3+1) */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C]">
              VARLIKLARIM
            </h3>
            {ownedAssets.length > 0 && (
              <span className="text-xs text-zinc-400 font-medium">
                {ownedAssets.length} aktif birikim
              </span>
            )}
          </div>
        </div>

        {ownedAssets.length === 0 ? (
          /* Empty state */
          <div className="rounded-[2rem] bg-white/[0.02] border border-dashed border-white/[0.08] p-12 sm:p-16 text-center flex flex-col items-center justify-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#E5B85C]/10 border border-[#E5B85C]/25 flex items-center justify-center text-[#F3C969]">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className="text-lg font-bold text-white">PORTFÖYÜNÜZ HENÜZ BOŞ</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Altın veya döviz birikimlerinizi ekleyerek anlık kâr/zarar ve toplam değerinizi takip etmeye başlayın.
              </p>
            </div>
            <button
              onClick={() => onOpenAddModal()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] font-bold text-xs tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>İLK BİRİKİMİ EKLE</span>
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 items-stretch ${
              ownedAssets.length === 1
                ? 'grid-cols-1 max-w-lg'
                : ownedAssets.length === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : ownedAssets.length === 4
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {ownedAssets.map((asset: AssetAllocationItem) => (
              <AssetCard
                key={asset.key}
                asset={asset}
                onClick={() => setSelectedAssetForDetail(asset)}
              />
            ))}
          </div>
        )}
      </section>


      {/* 4. MARKET OVERVIEW */}
      <section>
        <MarketOverview />
      </section>

      {/* 5. RECENT ACTIVITY */}
      <section>
        <RecentActivity onNavigateToTransactions={onNavigateToTransactions} />
      </section>

      {/* Asset Detail Modal */}
      <AssetDetailModal
        isOpen={!!selectedAssetForDetail}
        onClose={() => setSelectedAssetForDetail(null)}
        asset={selectedAssetForDetail}
        onAddMore={(key) => onOpenAddModal(key)}
      />
    </div>
  );
};
