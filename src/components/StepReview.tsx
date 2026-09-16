/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  TrendingDown,
  TrendingUp,
  Percent,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Download,
  Building2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export interface TaxCalculationResult {
  effectiveTaxRate: number; // e.g. 0.00%
  marginalTaxRate: number;  // e.g. 0.00%
  priorYearEffectiveTaxRate: number; // e.g. 0.00%
  yearOverYearChange: number; // e.g. 0.00%
  taxYear: number;
  grossRevenue: number;
  exemptDeductions: number;
  netTaxableIncome: number;
  totalTaxLiability: number;
  entityClassification: string;
  exemptionId: string;
  calculationTimestamp?: string;
  auditStatus: 'Compliant' | 'Pending Audit Review' | 'Verified 501(c)(3)';
}

export interface StepReviewProps {
  calculationResults?: Partial<TaxCalculationResult>;
  onConfirm?: () => void;
  onBack?: () => void;
  onExportAuditReport?: () => void;
  className?: string;
}

// Standard baseline calculation results for church 501(c)(3) ecclesiastical tax status
const defaultChurchTaxResults: TaxCalculationResult = {
  effectiveTaxRate: 0.00,
  marginalTaxRate: 0.00,
  priorYearEffectiveTaxRate: 0.00,
  yearOverYearChange: 0.00,
  taxYear: 2026,
  grossRevenue: 485000,
  exemptDeductions: 485000,
  netTaxableIncome: 0,
  totalTaxLiability: 0,
  entityClassification: '501(c)(3) Ecclesiastical Religious Organization',
  exemptionId: 'EXEMPT-501C3-984321',
  calculationTimestamp: new Date().toISOString(),
  auditStatus: 'Verified 501(c)(3)'
};

export const StepReview: React.FC<StepReviewProps> = ({
  calculationResults,
  onConfirm,
  onBack,
  onExportAuditReport,
  className = ''
}) => {
  // Scenario switcher for administrative simulation
  const [selectedScenario, setSelectedScenario] = useState<'churchExempt' | 'clergyHousing' | 'auxiliaryUnrelated'>('churchExempt');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Determine active calculation results based on props or selected scenario
  const currentResults: TaxCalculationResult = useMemo(() => {
    if (calculationResults && Object.keys(calculationResults).length > 0) {
      return {
        ...defaultChurchTaxResults,
        ...calculationResults
      };
    }

    // Default scenarios
    if (selectedScenario === 'clergyHousing') {
      return {
        effectiveTaxRate: 4.25,
        marginalTaxRate: 12.00,
        priorYearEffectiveTaxRate: 4.80,
        yearOverYearChange: -0.55,
        taxYear: 2026,
        grossRevenue: 120000,
        exemptDeductions: 78000, // IRC Section 107 Parsonage Allowance
        netTaxableIncome: 42000,
        totalTaxLiability: 5100,
        entityClassification: 'Pastoral Compensation & Parsonage Allowance (IRC § 107)',
        exemptionId: 'CLERGY-IRC107-7729',
        calculationTimestamp: new Date().toISOString(),
        auditStatus: 'Compliant'
      };
    }

    if (selectedScenario === 'auxiliaryUnrelated') {
      return {
        effectiveTaxRate: 8.50,
        marginalTaxRate: 21.00,
        priorYearEffectiveTaxRate: 7.90,
        yearOverYearChange: 0.60,
        taxYear: 2026,
        grossRevenue: 85000,
        exemptDeductions: 51000,
        netTaxableIncome: 34000,
        totalTaxLiability: 7225,
        entityClassification: 'Church Auxiliary Bookstore & Media Enterprise (UBIT Form 990-T)',
        exemptionId: 'UBIT-AUX-49201',
        calculationTimestamp: new Date().toISOString(),
        auditStatus: 'Pending Audit Review'
      };
    }

    return defaultChurchTaxResults;
  }, [calculationResults, selectedScenario]);

  const handleExportCSV = () => {
    if (onExportAuditReport) {
      onExportAuditReport();
      return;
    }

    const headers = ['Tax Metric', 'Calculated Value', 'Prior Year / Benchmark', 'Year-over-Year Change', 'Statutory Basis'];
    const rows = [
      ['Effective Tax Rate', `${currentResults.effectiveTaxRate.toFixed(2)}%`, `${currentResults.priorYearEffectiveTaxRate.toFixed(2)}%`, `${currentResults.yearOverYearChange > 0 ? '+' : ''}${currentResults.yearOverYearChange.toFixed(2)}%`, currentResults.entityClassification],
      ['Marginal Tax Rate', `${currentResults.marginalTaxRate.toFixed(2)}%`, '0.00% Statutory Non-Profit Bracket', '0.00% (Stable)', 'IRC Section 501(c)(3)'],
      ['Year-over-Year Change', `${currentResults.yearOverYearChange > 0 ? '+' : ''}${currentResults.yearOverYearChange.toFixed(2)}%`, '0.00% Baseline Variance', `${currentResults.yearOverYearChange > 0 ? '+' : ''}${currentResults.yearOverYearChange.toFixed(2)}%`, 'Fiscal Year 2025 vs 2026 Audit'],
      ['Gross Ministry Revenue', `$${currentResults.grossRevenue.toLocaleString()}`, '$450,000.00', '+7.78%', 'Tithes, Offerings & Gifts'],
      ['Allowable Exempt Deductions', `$${currentResults.exemptDeductions.toLocaleString()}`, '$450,000.00', '+7.78%', '100% Religious Purpose Exemption'],
      ['Net Taxable Income', `$${currentResults.netTaxableIncome.toLocaleString()}`, '$0.00', '0.00%', 'Zero Tax Base'],
      ['Total Tax Liability', `$${currentResults.totalTaxLiability.toLocaleString()}`, '$0.00', '0.00%', 'Fully Exempt (0% Tax)']
    ];

    const escapeCSV = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tax_insights_step_review_${currentResults.taxYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess('Tax Insights summary report downloaded as CSV for administrative reporting.');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div id="step-review-container" className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#0B1F4D] via-[#241758] to-[#7D3AC1] text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Fiscal Audit & Step Review Pipeline</span>
          </div>
          <h2 className="font-serif-cinzel text-2xl font-bold mt-1">
            Step Review: Ministry Tax & Financial Calculation
          </h2>
          <p className="text-xs md:text-sm text-slate-200 mt-1">
            Review calculated statutory tax metrics, 501(c)(3) ecclesiastical exemptions, and marginal bracket breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            id="step-review-export-csv-btn"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Download Tax Insights calculation table as a CSV file"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>Export Tax Audit CSV</span>
          </button>

          {onConfirm && (
            <button
              onClick={onConfirm}
              id="step-review-confirm-btn"
              className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0B1F4D] text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <span>Confirm & Proceed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
          <span className="text-[11px] opacity-80">RFC 4180 / UTF-8</span>
        </div>
      )}

      {/* Scenario Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Calculation Scenario:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedScenario('churchExempt')}
            id="scenario-btn-church-exempt"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedScenario === 'churchExempt'
                ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            501(c)(3) Church Exemption (0% Tax)
          </button>
          <button
            onClick={() => setSelectedScenario('clergyHousing')}
            id="scenario-btn-clergy-housing"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedScenario === 'clergyHousing'
                ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Clergy Housing & IRC § 107
          </button>
          <button
            onClick={() => setSelectedScenario('auxiliaryUnrelated')}
            id="scenario-btn-auxiliary-unrelated"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedScenario === 'auxiliaryUnrelated'
                ? 'bg-[#0B1F4D] dark:bg-[#7D3AC1] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Auxiliary Bookstore (UBIT Form 990-T)
          </button>
        </div>
      </div>

      {/* Tax Insights Section */}
      <section
        id="tax-insights-section"
        aria-labelledby="tax-insights-heading"
        className="p-6 rounded-2xl bg-white dark:bg-[#071430] border border-slate-200 dark:border-indigo-950 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#7D3AC1] to-[#0B1F4D] text-[#D4AF37] shadow-xs">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="tax-insights-heading"
                className="font-serif-cinzel font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2"
              >
                <span>Tax Insights</span>
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                  {currentResults.auditStatus}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Calculated effective tax rate, marginal rate analysis, and year-over-year change for {currentResults.taxYear}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Exemption ID</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {currentResults.exemptionId}
              </span>
            </div>
          </div>
        </div>

        {/* Highlight KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Effective Tax Rate</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold">
                Actual Burden
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {currentResults.effectiveTaxRate.toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>Prior year: {currentResults.priorYearEffectiveTaxRate.toFixed(2)}%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Marginal Tax Rate</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold">
                Top Bracket
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {currentResults.marginalTaxRate.toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              <span>Statutory ceiling bracket</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Year-over-Year Change</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                Delta
              </span>
            </div>
            <div className="text-2xl font-bold font-mono flex items-center gap-1.5">
              {currentResults.yearOverYearChange === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">0.00%</span>
              ) : currentResults.yearOverYearChange < 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                  <TrendingDown className="w-5 h-5 mr-1" />
                  {currentResults.yearOverYearChange.toFixed(2)}%
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-1" />
                  +{currentResults.yearOverYearChange.toFixed(2)}%
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                {currentResults.yearOverYearChange === 0
                  ? 'Zero variance (Maintained full exemption)'
                  : `${Math.abs(currentResults.yearOverYearChange).toFixed(2)}% variance vs FY 2025`}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Table of Calculated Results */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table
            id="tax-insights-summary-table"
            className="w-full text-left text-xs border-collapse"
          >
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5 font-bold">Tax Metric / Parameter</th>
                <th className="p-3.5 font-bold">Calculated Rate / Amount</th>
                <th className="p-3.5 font-bold">Prior Year / Benchmark</th>
                <th className="p-3.5 font-bold">Year-over-Year Change</th>
                <th className="p-3.5 font-bold">Statutory Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Row 1: Effective Tax Rate */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Effective Tax Rate</span>
                </td>
                <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {currentResults.effectiveTaxRate.toFixed(2)}%
                </td>
                <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                  {currentResults.priorYearEffectiveTaxRate.toFixed(2)}%
                </td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-xs ${
                      currentResults.yearOverYearChange === 0
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        : currentResults.yearOverYearChange < 0
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {currentResults.yearOverYearChange === 0 ? (
                      '0.00% (No change)'
                    ) : (
                      <>
                        {currentResults.yearOverYearChange < 0 ? (
                          <TrendingDown className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5" />
                        )}
                        {currentResults.yearOverYearChange > 0 ? '+' : ''}
                        {currentResults.yearOverYearChange.toFixed(2)}%
                      </>
                    )}
                  </span>
                </td>
                <td className="p-3.5 text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      {currentResults.effectiveTaxRate === 0
                        ? '100% Tax Exempt (0% Effective Burden)'
                        : 'Calculated Net Effective Liability'}
                    </span>
                  </span>
                </td>
              </tr>

              {/* Row 2: Marginal Tax Rate */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Marginal Tax Rate</span>
                </td>
                <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {currentResults.marginalTaxRate.toFixed(2)}%
                </td>
                <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                  0.00% (Non-Profit Base)
                </td>
                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {currentResults.marginalTaxRate === 0 ? '0.00% (Baseline)' : `${currentResults.marginalTaxRate.toFixed(2)}% Bracket`}
                  </span>
                </td>
                <td className="p-3.5 text-slate-600 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">
                    {currentResults.marginalTaxRate === 0
                      ? 'Zero Marginal Tax Bracket (§ 501(c)(3))'
                      : 'Applicable Incremental Marginal Threshold'}
                  </span>
                </td>
              </tr>

              {/* Row 3: Year-over-Year Change */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Year-over-Year Change</span>
                </td>
                <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {currentResults.yearOverYearChange > 0 ? '+' : ''}
                  {currentResults.yearOverYearChange.toFixed(2)}%
                </td>
                <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                  0.00% Expected Delta
                </td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded text-xs ${
                      currentResults.yearOverYearChange === 0
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : currentResults.yearOverYearChange < 0
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {currentResults.yearOverYearChange === 0 ? (
                      'Stable (0.00%)'
                    ) : (
                      `${currentResults.yearOverYearChange > 0 ? '+' : ''}${currentResults.yearOverYearChange.toFixed(2)}% net change`
                    )}
                  </span>
                </td>
                <td className="p-3.5 text-slate-600 dark:text-slate-300">
                  <span>
                    {currentResults.yearOverYearChange === 0
                      ? 'Audit Compliant & Exemption Reaffirmed'
                      : 'Variance Documented for Board Oversight'}
                  </span>
                </td>
              </tr>

              {/* Row 4: Gross Ministry Inflows */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                  Gross Ministry Receipts
                </td>
                <td className="p-3.5 font-mono font-semibold text-slate-900 dark:text-white">
                  ${currentResults.grossRevenue.toLocaleString()}
                </td>
                <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                  $450,000.00
                </td>
                <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  +7.78% (Growth)
                </td>
                <td className="p-3.5 text-slate-500 dark:text-slate-400">
                  Ecclesiastical Tithes, Offerings & Gifts
                </td>
              </tr>

              {/* Row 5: Total Tax Due */}
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 font-bold">
                <td className="p-3.5 text-slate-900 dark:text-white">
                  Calculated Net Tax Liability
                </td>
                <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  ${currentResults.totalTaxLiability.toLocaleString()}
                </td>
                <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                  $0.00
                </td>
                <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400">
                  {currentResults.totalTaxLiability === 0 ? '$0.00 (Fully Exempt)' : `$${currentResults.totalTaxLiability.toLocaleString()}`}
                </td>
                <td className="p-3.5 text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official 501(c)(3) Zero Liability</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legal & Exemption Attestation */}
        <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#7D3AC1] dark:text-[#D4AF37]">
            <FileCheck className="w-4 h-4" />
            <span>Statutory Verification & Tax Compliance Notes</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            As a recognized ecclesiastical 501(c)(3) organization under the Internal Revenue Code, the church maintains an effective and marginal tax rate of <strong>0.00%</strong> on contributions, tithes, and qualified religious operations. Year-over-year change remains consistent with statutory non-profit standards.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-purple-200/50 dark:border-purple-900/30">
            <span>Entity ID: {currentResults.exemptionId}</span>
            <span>Audit Engine: Autonomous Financial Review v4.2</span>
            <span>Last Calculated: {new Date(currentResults.calculationTimestamp || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </section>

      {/* Step Review Actions */}
      <div className="flex items-center justify-between pt-2">
        {onBack ? (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : <div />}

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-[#7D3AC1] dark:text-[#D4AF37]" />
            <span>Download Summary Table (CSV)</span>
          </button>

          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-5 py-2 rounded-xl bg-[#7D3AC1] hover:bg-[#6b2fa8] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <span>Confirm & Complete Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepReview;
