import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  CalendarDays,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  RotateCcw,
  Award,
  Flame,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ShieldCheck,
  Percent,
  Scissors,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { AnalyticsData } from '../types';

interface Props {
  token: string | null;
}

export const AdminAnalyticsDashboard: React.FC<Props> = ({ token }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState<'all' | '6months' | '30days' | 'thisMonth' | '7days'>('all');
  const [trendMetric, setTrendMetric] = useState<'revenue' | 'bookings'>('revenue');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token, range]);

  if (isLoading && !data) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="inline-flex p-4 rounded-full bg-[#FCE7EC] text-[#541224] animate-spin">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h4 className="font-serif font-bold text-base text-[#541224]">
          Computing Salon Business Analytics...
        </h4>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Aggregating appointment revenues, client repeat patterns, peak hour heatmaps, and category performances.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 text-rose-700 space-y-3">
        <p className="text-sm font-semibold">Unable to compile analytics metrics.</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 cursor-pointer"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const { kpis, monthlyTrends, categoryBreakdown, dayOfWeekTrends, hourlyTraffic, statusBreakdown, topServices, topClients } = data;

  // ---------------------------------------------------------------------------
  // SVG AREA & LINE CHART CALCULATIONS
  // ---------------------------------------------------------------------------
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 30;

  const trendValues = monthlyTrends.map((m) => (trendMetric === 'revenue' ? m.revenue : m.bookings));
  const maxTrendVal = Math.max(...trendValues, 1);
  const minTrendVal = 0;

  const points = monthlyTrends.map((m, idx) => {
    const val = trendMetric === 'revenue' ? m.revenue : m.bookings;
    const x = paddingX + (idx / Math.max(monthlyTrends.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (val / maxTrendVal) * (chartHeight - paddingY * 2);
    return { x, y, val, ...m };
  });

  const linePathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[idx - 1];
    const cX1 = prev.x + (pt.x - prev.x) / 2;
    const cY1 = prev.y;
    const cX2 = prev.x + (pt.x - prev.x) / 2;
    const cY2 = pt.y;
    return `${acc} C ${cX1} ${cY1}, ${cX2} ${cY2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPathD = points.length > 0
    ? `${linePathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  // ---------------------------------------------------------------------------
  // DONUT PIE CHART CALCULATIONS
  // ---------------------------------------------------------------------------
  const donutSize = 200;
  const donutCenter = donutSize / 2;
  const donutRadius = 75;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * donutRadius;

  let accumulatedPercent = 0;
  const donutSlices = categoryBreakdown.map((cat) => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += cat.percentage;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset
    };
  });

  // Maximum day bookings for bar chart
  const maxDayBookings = Math.max(...dayOfWeekTrends.map((d) => d.bookings), 1);
  const maxHourlyCount = Math.max(...hourlyTraffic.map((h) => h.count), 1);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Date Filter Switcher */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#3D0A18] via-[#541224] to-[#751B32] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-[#F8CAD5] backdrop-blur-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F8CAD5]" />
              <span>Confidential Salon Intelligence</span>
            </span>
            <span className="text-[11px] text-[#F8CAD5]/80 font-medium">
              • Administrator Eyes Only
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            Durga Salon Executive Analytics
          </h2>
          <p className="text-xs text-[#FCE7EC]/80 max-w-xl leading-relaxed">
            Real-time financial performance, treatment conversion funnels, client retention ratios, and peak rush forecasting.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/25 backdrop-blur-md rounded-2xl border border-white/10 z-10 self-start md:self-center">
          <button
            onClick={() => setRange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              range === 'all'
                ? 'bg-white text-[#541224] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setRange('6months')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              range === '6months'
                ? 'bg-white text-[#541224] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setRange('thisMonth')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              range === 'thisMonth'
                ? 'bg-white text-[#541224] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setRange('30days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              range === '30days'
                ? 'bg-white text-[#541224] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setRange('7days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              range === '7days'
                ? 'bg-white text-[#541224] shadow-xs'
                : 'text-white/80 hover:text-white'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => window.print()}
            title="Print or Export Executive Report"
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6 EXECUTIVE METRIC KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white border border-[#D4A5AC]/40 shadow-xs space-y-1 relative group hover:border-[#541224] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
              Net Revenue
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[#541224] block">
            ₹{kpis.totalRevenue.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            *Completed bookings only
          </span>
        </div>

        {/* Total Bookings */}
        <div className="p-5 rounded-2xl bg-white border border-[#D4A5AC]/40 shadow-xs space-y-1 relative group hover:border-[#541224] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
              Total Appointments
            </span>
            <span className="p-1.5 rounded-lg bg-[#FCE7EC] text-[#541224]">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 block">
            {kpis.totalBookings}
          </span>
          <span className="text-[10px] text-blue-700 font-semibold block">
            {kpis.completedBookings} Completed • {kpis.confirmedBookings} Confirmed
          </span>
        </div>

        {/* Completion Rate */}
        <div className="p-5 rounded-2xl bg-white border border-[#D4A5AC]/40 shadow-xs space-y-1 relative group hover:border-[#541224] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
              Completion Rate
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700 block">
            {kpis.completionRate}%
          </span>
          <span className="text-[10px] text-gray-500 font-medium block">
            {kpis.cancelledBookings} Cancellations ({kpis.totalBookings > 0 ? Math.round((kpis.cancelledBookings / kpis.totalBookings) * 100) : 0}%)
          </span>
        </div>

        {/* Average Order Value */}
        <div className="p-5 rounded-2xl bg-white border border-[#D4A5AC]/40 shadow-xs space-y-1 relative group hover:border-[#541224] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
              Avg Ticket Size
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 block">
            ₹{kpis.averageOrderValue.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-gray-500 font-medium block">
            Per completed customer
          </span>
        </div>

        {/* Client Retention */}
        <div className="p-5 rounded-2xl bg-white border border-[#D4A5AC]/40 shadow-xs space-y-1 relative group hover:border-[#541224] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
              Loyal Repeat Clients
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-purple-900 block">
            {kpis.repeatRate}%
          </span>
          <span className="text-[10px] text-purple-700 font-semibold block">
            {kpis.repeatCustomers} of {kpis.uniqueCustomers} unique clients
          </span>
        </div>

        {/* Busiest Peak Day */}
        <div className="p-5 rounded-2xl bg-[#541224] text-white shadow-xs space-y-1 relative group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-[#F8CAD5] uppercase tracking-wider font-bold">
              Busiest Salon Day
            </span>
            <span className="p-1.5 rounded-lg bg-white/15 text-[#F8CAD5]">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
            </span>
          </div>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-white block">
            {kpis.busiestDay}
          </span>
          <span className="text-[10px] text-[#FCE7EC]/80 font-medium block">
            Top Service: {kpis.topCategory.split('&')[0]}
          </span>
        </div>
      </div>

      {/* GRAPH 1: REVENUE GROWTH & BOOKINGS MONTHLY TREND (INTERACTIVE SVG AREA/LINE) */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-[#541224] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#B76E79]" />
                <span>Monthly Revenue Growth & Treatment Volume Trend</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                Live Aggregation
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Continuous month-over-month trajectory of completed treatments and gross salon receipts.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setTrendMetric('revenue')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                trendMetric === 'revenue'
                  ? 'bg-white text-[#541224] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Revenue (₹)
            </button>
            <button
              onClick={() => setTrendMetric('bookings')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                trendMetric === 'bookings'
                  ? 'bg-white text-[#541224] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Bookings Count
            </button>
          </div>
        </div>

        {/* SVG Curve Chart */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[640px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 overflow-visible select-none"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B76E79" stopOpacity="0.35" />
                  <stop offset="80%" stopColor="#541224" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#541224" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#B76E79" />
                  <stop offset="50%" stopColor="#801830" />
                  <stop offset="100%" stopColor="#541224" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = chartHeight - paddingY - pct * (chartHeight - paddingY * 2);
                const labelVal = Math.round(minTrendVal + pct * maxTrendVal);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#F3F4F6"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] fill-gray-400 font-mono"
                    >
                      {trendMetric === 'revenue' ? `₹${labelVal >= 1000 ? `${Math.round(labelVal / 1000)}k` : labelVal}` : labelVal}
                    </text>
                  </g>
                );
              })}

              {/* Filled Area */}
              {areaPathD && (
                <path d={areaPathD} fill="url(#areaGradient)" />
              )}

              {/* Smooth Spline Line */}
              {linePathD && (
                <path
                  d={linePathD}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Points */}
              {points.map((pt, idx) => {
                const isHovered = hoveredMonth === idx;
                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredMonth(idx)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="cursor-pointer group"
                  >
                    {/* Hover vertical guide line */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={paddingY}
                        x2={pt.x}
                        y2={chartHeight - paddingY}
                        stroke="#B76E79"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Outer glow ring */}
                    <circle
                      cx={pt.x}
                      y={pt.y}
                      r={isHovered ? 8 : 4.5}
                      className="fill-white stroke-[#541224] transition-all duration-200"
                      strokeWidth={isHovered ? 3 : 2}
                    />

                    {/* Month X-axis label */}
                    <text
                      x={pt.x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      className={`text-[10px] font-semibold transition-colors ${
                        isHovered ? 'fill-[#541224] font-bold' : 'fill-gray-500'
                      }`}
                    >
                      {pt.month.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Bottom Monthly Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {monthlyTrends.map((m, idx) => {
            const isHovered = hoveredMonth === idx;
            return (
              <div
                key={m.key}
                onMouseEnter={() => setHoveredMonth(idx)}
                onMouseLeave={() => setHoveredMonth(null)}
                className={`p-3 rounded-2xl border transition-all text-xs cursor-pointer ${
                  isHovered
                    ? 'border-[#541224] bg-[#FDF2F4] shadow-xs scale-102'
                    : 'border-gray-100 bg-gray-50/70'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-gray-800">{m.month}</span>
                  {m.growth !== 0 && (
                    <span className={`text-[9px] font-bold flex items-center ${
                      m.growth > 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {m.growth > 0 ? '+' : ''}{m.growth}%
                    </span>
                  )}
                </div>
                <span className="font-serif font-bold text-[#541224] block text-sm">
                  ₹{m.revenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  {m.completed} of {m.bookings} completed
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-COLUMN SECTION: CATEGORY DISTRIBUTION (DONUT) & DAY OF WEEK TRAFFIC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 2: SERVICE CATEGORY REVENUE & BOOKINGS DONUT */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-serif text-base font-bold text-[#541224] flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-[#B76E79]" />
                <span>Service Category Revenue Share</span>
              </h3>
              <span className="text-[11px] text-gray-400 font-semibold">
                Share of ₹{kpis.totalRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Relative income distribution across bridal packages, skincare, hair coloring, and everyday trims.
            </p>
          </div>

          {/* Donut Visual and Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
            {/* SVG Donut */}
            <div className="relative shrink-0 w-52 h-52 flex items-center justify-center">
              <svg width={donutSize} height={donutSize} className="rotate-[-90deg] overflow-visible">
                {/* Background Ring */}
                <circle
                  cx={donutCenter}
                  cy={donutCenter}
                  r={donutRadius}
                  fill="transparent"
                  stroke="#F3F4F6"
                  strokeWidth={strokeWidth}
                />
                {/* Slices */}
                {donutSlices.map((slice, idx) => {
                  const isHovered = hoveredCategory === slice.category;
                  return (
                    <circle
                      key={idx}
                      cx={donutCenter}
                      cy={donutCenter}
                      r={donutRadius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      onMouseEnter={() => setHoveredCategory(slice.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className="transition-all duration-300 cursor-pointer"
                    />
                  );
                })}
              </svg>

              {/* Center Details */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Total
                </span>
                <span className="font-serif font-bold text-[#541224] text-xl">
                  ₹{kpis.totalRevenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  {kpis.completedBookings} Completed
                </span>
              </div>
            </div>

            {/* Category Legend List */}
            <div className="space-y-2.5 flex-1 w-full max-w-xs">
              {categoryBreakdown.map((cat) => {
                const isHovered = hoveredCategory === cat.category;
                return (
                  <div
                    key={cat.category}
                    onMouseEnter={() => setHoveredCategory(cat.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`p-2 rounded-xl transition-all text-xs flex justify-between items-center cursor-pointer ${
                      isHovered ? 'bg-[#FDF2F4] scale-102' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-gray-800 truncate">{cat.label}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-serif font-bold text-gray-900 block text-xs">
                        ₹{cat.revenue.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {cat.percentage}% ({cat.count} bkgs)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Primary Revenue Driver:</span>
            <strong className="text-[#541224]">{kpis.topCategory}</strong>
          </div>
        </div>

        {/* GRAPH 3: DAY OF THE WEEK TRAFFIC (BAR CHART) */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-serif text-base font-bold text-[#541224] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#B76E79]" />
                <span>Weekly Appointment Traffic & Rush Days</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold">
                Peak: {kpis.busiestDay}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Appointment booking frequency and completed revenue broken down from Monday to Sunday.
            </p>
          </div>

          {/* Bar Chart Visual */}
          <div className="space-y-3 py-2">
            {dayOfWeekTrends.map((d) => {
              const isBusiest = d.fullDay === kpis.busiestDay;
              const isHovered = hoveredDay === d.day;
              const fillPct = (d.bookings / maxDayBookings) * 100;

              return (
                <div
                  key={d.day}
                  onMouseEnter={() => setHoveredDay(d.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`p-2 rounded-xl transition-all text-xs cursor-pointer ${
                    isHovered ? 'bg-[#FDF2F4]' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 font-bold ${isBusiest ? 'text-[#541224]' : 'text-gray-700'}`}>
                        {d.day}
                      </span>
                      <span className="text-gray-500 text-[11px]">{d.fullDay}</span>
                      {isBusiest && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-900">
                          🔥 Peak
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{d.bookings} Bookings</span>
                      <span className="font-serif font-bold text-[#541224] w-20 text-right">
                        ₹{d.revenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBusiest
                          ? 'bg-gradient-to-r from-[#B76E79] to-[#541224]'
                          : 'bg-[#D4A5AC]/80'
                      }`}
                      style={{ width: `${Math.max(fillPct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Staff Scheduling Tip:</span>
            <span className="text-gray-700 font-medium">Ensure peak stylist attendance on {kpis.busiestDay}s.</span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: HOURLY TRAFFIC HEATMAP & CONVERSION FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 4: PEAK HOURS SALON TRAFFIC */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h3 className="font-serif text-base font-bold text-[#541224] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#B76E79]" />
              <span>Salon Peak Operating Hours</span>
            </h3>
            <span className="text-[11px] text-gray-400 font-medium">10:00 AM — 07:00 PM</span>
          </div>
          <p className="text-xs text-gray-500">
            Client arrival distribution across morning slots, midday sessions, and evening festive styling.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {hourlyTraffic.map((h, idx) => {
              const isRush = h.count === maxHourlyCount;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isRush
                      ? 'border-[#541224] bg-[#FDF2F4] shadow-xs'
                      : 'border-gray-100 bg-gray-50/70 hover:bg-white'
                  }`}
                >
                  <span className="text-[11px] font-bold text-gray-800 block">{h.slot}</span>
                  <span className={`font-serif font-bold text-lg block my-0.5 ${
                    isRush ? 'text-[#541224]' : 'text-gray-900'
                  }`}>
                    {h.count}
                  </span>
                  <span className={`text-[10px] font-semibold block ${
                    isRush ? 'text-[#B76E79]' : 'text-gray-400'
                  }`}>
                    {h.percentage}% clients
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRAPH 5: BOOKING CONVERSION FUNNEL & STATUS HEALTH */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h3 className="font-serif text-base font-bold text-[#541224] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#B76E79]" />
              <span>Booking Pipeline & Conversion Health</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {kpis.completionRate}% Fulfillment
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Ratio of successfully completed treatments versus confirmed scheduled clients and cancellations.
          </p>

          {/* Progress Bars */}
          <div className="space-y-3.5 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Completed Treatments ({statusBreakdown.completed})</span>
                </span>
                <span className="font-mono text-emerald-800 font-bold">
                  {kpis.totalBookings > 0 ? Math.round((statusBreakdown.completed / kpis.totalBookings) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${(statusBreakdown.completed / Math.max(kpis.totalBookings, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Upcoming Confirmed ({statusBreakdown.confirmed})</span>
                </span>
                <span className="font-mono text-blue-800 font-bold">
                  {kpis.totalBookings > 0 ? Math.round((statusBreakdown.confirmed / kpis.totalBookings) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${(statusBreakdown.confirmed / Math.max(kpis.totalBookings, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Pending Inquiries ({statusBreakdown.pending})</span>
                </span>
                <span className="font-mono text-amber-800 font-bold">
                  {kpis.totalBookings > 0 ? Math.round((statusBreakdown.pending / kpis.totalBookings) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(statusBreakdown.pending / Math.max(kpis.totalBookings, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Cancelled ({statusBreakdown.cancelled})</span>
                </span>
                <span className="font-mono text-rose-800 font-bold">
                  {kpis.totalBookings > 0 ? Math.round((statusBreakdown.cancelled / kpis.totalBookings) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${(statusBreakdown.cancelled / Math.max(kpis.totalBookings, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: TOP SERVICES MATRIX & TOP VIP CLIENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEADERBOARD: TOP SERVICES */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h3 className="font-serif text-base font-bold text-[#541224] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#B76E79]" />
              <span>Top Revenue-Generating Treatments</span>
            </h3>
            <span className="text-[11px] text-gray-400 font-semibold">Ranked by Income</span>
          </div>

          <div className="space-y-3">
            {topServices.map((service, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-gray-100 hover:border-[#D4A5AC] transition-all space-y-2">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-gray-900 text-sm">{service.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#FCE7EC] text-[#541224]">
                        {service.category}
                      </span>
                    </div>
                    <span className="text-gray-400 text-[11px]">
                      {service.bookings} client appointments booked
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-serif font-bold text-emerald-700 text-sm">
                      ₹{service.revenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {service.share}% salon revenue
                    </span>
                  </div>
                </div>

                {/* Relative progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${Math.min(service.share * 2.5, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VIP CLIENT RETENTION & TOP SPENDERS */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h3 className="font-serif text-base font-bold text-[#541224] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#B76E79]" />
              <span>Highest Spending VIP Regulars</span>
            </h3>
            <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full">
              {kpis.repeatRate}% Loyalty
            </span>
          </div>

          <div className="space-y-3">
            {topClients.map((client, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FCE7EC] text-[#541224] font-serif font-bold text-base flex items-center justify-center shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-gray-900 text-sm">{client.name}</span>
                      {client.visits > 1 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 text-[9px] font-bold">
                          VIP Regular
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-[11px] block">{client.phone} • {client.visits} Visits</span>
                    <span className="text-[10px] text-gray-500 italic block mt-0.5 truncate max-w-[200px]">
                      Favorite: {client.favoriteService}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-serif font-bold text-[#541224] text-sm block">
                    ₹{client.totalSpent.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    Last: {client.lastVisit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
