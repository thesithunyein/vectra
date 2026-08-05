"use client";

import { Zap, Gauge, Clock, BadgeDollarSign } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { PageTransition, StaggerChildren, StaggerItem } from "@/components/motion/PageTransition";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ProductionTrendChart } from "@/components/dashboard/ProductionTrendChart";
import { CostBreakdown } from "@/components/dashboard/CostBreakdown";
import { PerformanceRadar } from "@/components/dashboard/PerformanceRadar";
import { ProductionBars } from "@/components/dashboard/ProductionBars";
import { DowntimeDonut } from "@/components/dashboard/DowntimeDonut";
import { kpis } from "@/lib/seed";

export default function AnalyticsPage() {
  return (
    <>
      <TopBar
        title="Analytics Dashboard"
        subtitle="Comprehensive operational analytics and insights."
      />
      <PageTransition>
        <div className="space-y-5 px-8 pb-10">
          <StaggerChildren className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StaggerItem>
              <KpiCard
                label="Energy Cost Today"
                value={kpis.energyCostToday}
                prefix="$"
                delta={Math.abs(kpis.energyDelta)}
                deltaLabel="% vs yesterday"
                positiveIsGood={false}
                icon={Zap}
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                label="Production Efficiency"
                value={kpis.productionEfficiency}
                decimals={1}
                suffix="%"
                delta={kpis.efficiencyDelta}
                deltaLabel="% this week"
                icon={Gauge}
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                label="Total Downtime"
                value={kpis.totalDowntimeHours}
                decimals={1}
                suffix=" hrs"
                delta={kpis.downtimeDelta}
                deltaLabel="hrs vs average"
                positiveIsGood={false}
                icon={Clock}
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                label="Cost Savings"
                value={kpis.costSavingsMonth / 1000}
                decimals={1}
                prefix="$"
                suffix="K"
                delta={12}
                deltaLabel="This month"
                icon={BadgeDollarSign}
              />
            </StaggerItem>
          </StaggerChildren>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <ProductionTrendChart />
            </div>
            <CostBreakdown />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <PerformanceRadar />
            <ProductionBars />
            <DowntimeDonut />
          </div>
        </div>
      </PageTransition>
    </>
  );
}
