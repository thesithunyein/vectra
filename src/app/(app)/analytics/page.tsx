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
import { EmptyWorkspace } from "@/components/EmptyWorkspace";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { kpis } from "@/lib/seed";

export default function AnalyticsPage() {
  const { usingSample } = useStore();
  const { user } = useAuth();

  return (
    <>
      <TopBar
        title="Analytics Dashboard"
        subtitle={`Operational analytics · ${user?.plant ?? "My plant"}`}
      />
      <PageTransition>
        <div className="space-y-5 px-8 pb-10">
          {!usingSample && (
            <EmptyWorkspace
              title="No analytics yet"
              description="Charts fill in when your plant streams production and downtime data."
            />
          )}

          <StaggerChildren className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StaggerItem>
              <KpiCard
                label="Energy Cost Today"
                value={usingSample ? kpis.energyCostToday : 0}
                prefix="$"
                delta={usingSample ? Math.abs(kpis.energyDelta) : 0}
                deltaLabel={usingSample ? "% vs yesterday" : "awaiting telemetry"}
                positiveIsGood={false}
                icon={Zap}
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                label="Production Efficiency"
                value={usingSample ? kpis.productionEfficiency : 0}
                decimals={1}
                suffix="%"
                delta={usingSample ? kpis.efficiencyDelta : 0}
                deltaLabel={usingSample ? "% this week" : "awaiting telemetry"}
                icon={Gauge}
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                label="Total Downtime"
                value={usingSample ? kpis.totalDowntimeHours : 0}
                decimals={1}
                suffix=" hrs"
                delta={usingSample ? kpis.downtimeDelta : 0}
                deltaLabel={usingSample ? "hrs vs average" : "no events"}
                positiveIsGood={false}
                icon={Clock}
              />
            </StaggerItem>
            <StaggerItem>
              <KpiCard
                label="Cost Savings"
                value={usingSample ? kpis.costSavingsMonth / 1000 : 0}
                decimals={1}
                prefix="$"
                suffix="K"
                delta={usingSample ? 12 : 0}
                deltaLabel={usingSample ? "This month" : "no events"}
                icon={BadgeDollarSign}
              />
            </StaggerItem>
          </StaggerChildren>

          {usingSample && (
            <>
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
            </>
          )}
        </div>
      </PageTransition>
    </>
  );
}
