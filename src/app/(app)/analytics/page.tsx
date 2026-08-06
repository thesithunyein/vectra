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
import { usePlantMetrics } from "@/lib/use-plant-metrics";

export default function AnalyticsPage() {
  const { hasPlantData } = useStore();
  const { user } = useAuth();
  const metrics = usePlantMetrics();

  return (
    <>
      <TopBar
        title="Analytics Dashboard"
        subtitle={`Operational analytics · ${user?.plant ?? "My plant"}`}
      />
      <PageTransition>
        <div className="space-y-5 px-8 pb-10">
          <EmptyWorkspace
            when="no-plant"
            title="No analytics yet"
            description="Import your plant or connect telemetry in Settings. Charts derive from your machines, alerts, and maintenance."
          />

          {hasPlantData && (
            <>
              <StaggerChildren className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StaggerItem>
                  <KpiCard
                    label="Energy Cost Today"
                    value={metrics.kpis.energyCostToday}
                    prefix="$"
                    delta={Math.abs(metrics.kpis.energyDelta)}
                    deltaLabel="% vs yesterday"
                    positiveIsGood={false}
                    icon={Zap}
                  />
                </StaggerItem>
                <StaggerItem>
                  <KpiCard
                    label="Production Efficiency"
                    value={metrics.kpis.productionEfficiency}
                    decimals={1}
                    suffix="%"
                    delta={Math.abs(metrics.kpis.efficiencyDelta)}
                    deltaLabel="% this week"
                    icon={Gauge}
                  />
                </StaggerItem>
                <StaggerItem>
                  <KpiCard
                    label="Total Downtime"
                    value={metrics.kpis.totalDowntimeHours}
                    decimals={1}
                    suffix=" hrs"
                    delta={metrics.kpis.downtimeDelta}
                    deltaLabel="hrs vs average"
                    positiveIsGood={false}
                    icon={Clock}
                  />
                </StaggerItem>
                <StaggerItem>
                  <KpiCard
                    label="Cost Savings"
                    value={metrics.kpis.costSavingsMonth / 1000}
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
                  <ProductionTrendChart data={metrics.productionTrend} />
                </div>
                <CostBreakdown data={metrics.costBreakdown} />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <PerformanceRadar data={metrics.performanceRadar} />
                <ProductionBars data={metrics.weekdayProduction} />
                <DowntimeDonut data={metrics.downtimeBreakdown} />
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </>
  );
}
