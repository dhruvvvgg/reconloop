import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowUpDown, 
  Split, 
  Percent, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { EconomicEvent, DiscrepancyClass } from '../types';

interface EventGridProps {
  events: EconomicEvent[];
  selectedFilter: string;
  selectedEvent: EconomicEvent | null;
  onSelectEvent: (event: EconomicEvent) => void;
}

export const EventGrid: React.FC<EventGridProps> = ({
  events,
  selectedFilter,
  selectedEvent,
  onSelectEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [discrepancyFilter, setDiscrepancyFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'order_id' | 'order_date' | 'policy_expected_net' | 'variance'>('variance');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(val);
  };

  // Extract unique discrepancy classes for the dropdown
  const uniqueDiscrepancies = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.discrepancy_class) set.add(e.discrepancy_class);
    });
    return Array.from(set).sort();
  }, [events]);

  // Filtered & Sorted events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      // Funnel status filter
      if (selectedFilter !== 'ALL' && selectedFilter !== 'SOURCE_EXCEPTIONS') {
        if (e.status !== selectedFilter) return false;
      }

      // Discrepancy category filter
      if (discrepancyFilter !== 'ALL' && e.discrepancy_class !== discrepancyFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesOrderId = e.order_id.toLowerCase().includes(query);
        const matchesCustomer = e.customer_id.toLowerCase().includes(query);
        const matchesPaymentRef = e.payment_ref.toLowerCase().includes(query);
        const matchesSettlement = e.linked_settlement_ids.some((id) => id.toLowerCase().includes(query));
        const matchesBank = e.linked_bank_row_ids.some((id) => id.toLowerCase().includes(query));
        return matchesOrderId || matchesCustomer || matchesPaymentRef || matchesSettlement || matchesBank;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'variance') {
        valA = Math.abs(a.policy_vs_bank_variance);
        valB = Math.abs(b.policy_vs_bank_variance);
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [events, selectedFilter, discrepancyFilter, searchTerm, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage]);

  const handleSort = (field: 'order_id' | 'order_date' | 'policy_expected_net' | 'variance') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending
    }
    setCurrentPage(1);
  };

  const getStatusBadge = (status: EconomicEvent['status']) => {
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400/90 border border-emerald-500/20 font-mono tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
            <span>RESOLVED</span>
          </span>
        );
      case 'PENDING_EXPECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300/90 border border-amber-500/20 font-mono tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
            <span>PENDING</span>
          </span>
        );
      case 'EXCEPTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400/90 border border-rose-500/20 font-mono tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
            <span>EXCEPTION</span>
          </span>
        );
    }
  };

  const getDiscrepancyBadge = (cls: DiscrepancyClass) => {
    switch (cls) {
      case 'CLEAN_MATCH':
        return <span className="text-[10.5px] text-zinc-500 font-mono">CLEAN_MATCH</span>;
      case 'SPLIT_SETTLEMENT':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <Split className="w-2.5 h-2.5" />
            <span>Split Payout</span>
          </span>
        );
      case 'PARTIAL_REFUND':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Percent className="w-2.5 h-2.5" />
            <span>Refund Deducted</span>
          </span>
        );
      case 'PROMPT_INJECTION_REJECTED':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-2.5 h-2.5" />
            <span>Injection Defended</span>
          </span>
        );
      case 'DUPLICATE_BANK_CREDIT':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
            Duplicate Credit
          </span>
        );
      case 'SETTLEMENT_ARITHMETIC_MISMATCH':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Settlement Math Error
          </span>
        );
      case 'MERCHANT_POLICY_MISMATCH':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
            Policy Fee Mismatch
          </span>
        );
      case 'MISSING_AFTER_CUTOFF':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
            Overdue Bank Credit
          </span>
        );
      case 'LATE_SETTLEMENT_AFTER_CUTOFF':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Late Settlement (T+7)
          </span>
        );
      case 'ROUNDING_DRIFT':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
            ₹0.01 Rounding Drift
          </span>
        );
      case 'RESIDUAL_AMBIGUOUS_RESOLVED':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            AI Semantic Match
          </span>
        );
      default:
        return <span className="text-[10.5px] text-zinc-500 font-mono">{cls}</span>;
    }
  };

  return (
    <div className="bg-[#111115] border border-[#222228] rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
      
      {/* Search and Filters Header */}
      <div className="p-3.5 border-b border-[#222228] bg-[#111115] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-events"
            type="text"
            placeholder="Search Order ID, Customer, UTR, or Payment Ref..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg bg-[#0c0c0e] border border-[#26262e] text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 transition-all font-mono"
          />
        </div>

        {/* Dropdowns and Meta */}
        <div className="flex items-center space-x-2.5 text-xs">
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono">Category:</span>
          </div>

          <select
            id="select-discrepancy-filter"
            value={discrepancyFilter}
            onChange={(e) => {
              setDiscrepancyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-[#0c0c0e] border border-[#26262e] text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
          >
            <option value="ALL">All Categories ({events.length})</option>
            {uniqueDiscrepancies.map((d) => (
              <option key={d} value={d}>
                {d.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <span className="text-zinc-500 font-mono text-[11px] pl-2 border-l border-[#222228]">
            Showing {filteredEvents.length} of {events.length}
          </span>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-[#0c0c0e] text-zinc-400 font-mono uppercase tracking-wider text-[10px] border-b border-[#222228]">
            <tr>
              <th className="py-2.5 px-3.5 font-medium">Status</th>
              
              <th 
                className="py-2.5 px-3.5 cursor-pointer hover:text-white font-medium transition-colors"
                onClick={() => handleSort('order_id')}
              >
                <div className="flex items-center space-x-1">
                  <span>Economic Event</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                </div>
              </th>

              <th 
                className="py-2.5 px-3.5 cursor-pointer hover:text-white font-medium transition-colors"
                onClick={() => handleSort('order_date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Order Date</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                </div>
              </th>

              <th 
                className="py-2.5 px-3.5 text-right cursor-pointer hover:text-white font-medium transition-colors"
                onClick={() => handleSort('policy_expected_net')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Policy Net</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                </div>
              </th>

              <th className="py-2.5 px-3.5 text-right font-medium">Gateway Net</th>
              <th className="py-2.5 px-3.5 text-right font-medium">Bank Received</th>
              
              <th 
                className="py-2.5 px-3.5 text-right cursor-pointer hover:text-white font-medium transition-colors"
                onClick={() => handleSort('variance')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Variance (Δ)</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                </div>
              </th>

              <th className="py-2.5 px-3.5 font-medium">Classification</th>
              <th className="py-2.5 px-3.5 text-right font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#1c1c24] font-mono text-[11.5px]">
            {paginatedEvents.map((e) => {
              const isSelected = selectedEvent?.event_id === e.event_id;
              const hasVariance = Math.abs(e.policy_vs_bank_variance) >= 0.01;

              return (
                <tr
                  key={e.event_id}
                  id={`row-event-${e.order_id}`}
                  onClick={() => onSelectEvent(e)}
                  className={`hover:bg-[#16161e] cursor-pointer transition-colors duration-150 ${
                    isSelected ? 'bg-[#181822] border-l-2 border-emerald-400' : ''
                  }`}
                >
                  {/* Status */}
                  <td className="py-2 px-3.5 whitespace-nowrap">
                    {getStatusBadge(e.status)}
                  </td>

                  {/* Order ID & Customer */}
                  <td className="py-2 px-3.5 whitespace-nowrap">
                    <div className="font-semibold text-white tracking-tight">{e.order_id}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{e.customer_id}</div>
                  </td>

                  {/* Order Date */}
                  <td className="py-2 px-3.5 whitespace-nowrap text-zinc-400">
                    <div>{e.order_date}</div>
                    {e.expected_bank_arrival_cutoff && (
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Cutoff: {e.expected_bank_arrival_cutoff}
                      </div>
                    )}
                  </td>

                  {/* Policy Net (Right-Aligned Tabular) */}
                  <td className="py-2 px-3.5 text-right whitespace-nowrap text-zinc-100 font-medium tabular-nums">
                    {formatCurrency(e.policy_expected_net)}
                  </td>

                  {/* Gateway Net (Right-Aligned Tabular) */}
                  <td className="py-2 px-3.5 text-right whitespace-nowrap text-emerald-400 font-medium tabular-nums">
                    {formatCurrency(e.gateway_reported_net)}
                  </td>

                  {/* Bank Net (Right-Aligned Tabular) */}
                  <td className="py-2 px-3.5 text-right whitespace-nowrap text-zinc-300 font-medium tabular-nums">
                    {formatCurrency(e.bank_received_net)}
                  </td>

                  {/* Total Variance (Right-Aligned Tabular) */}
                  <td className="py-2 px-3.5 text-right whitespace-nowrap tabular-nums">
                    <span className={`font-semibold ${
                      hasVariance ? 'text-rose-400' : 'text-zinc-500'
                    }`}>
                      {hasVariance ? formatCurrency(e.policy_vs_bank_variance) : '₹0.00'}
                    </span>
                  </td>

                  {/* Classification */}
                  <td className="py-2 px-3.5 whitespace-nowrap font-sans">
                    {getDiscrepancyBadge(e.discrepancy_class)}
                  </td>

                  {/* Action Link */}
                  <td className="py-2 px-3.5 text-right whitespace-nowrap font-sans">
                    <button
                      onClick={(evt) => {
                        evt.stopPropagation();
                        onSelectEvent(e);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-[#0c0c0e] hover:bg-[#1c1c24] text-zinc-300 hover:text-white text-[10.5px] font-mono border border-[#24242e] transition-colors"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3 text-zinc-500" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {paginatedEvents.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-zinc-500 font-sans">
                  No economic events match the active search or category criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-[#222228] bg-[#0c0c0e] flex items-center justify-between text-xs text-zinc-400 font-mono">
        <div>
          Page {currentPage} of {totalPages} ({filteredEvents.length} events)
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            id="btn-page-prev"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded bg-[#16161c] border border-[#24242e] hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 transition-colors"
          >
            Previous
          </button>
          <button
            id="btn-page-next"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded bg-[#16161c] border border-[#24242e] hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
};
