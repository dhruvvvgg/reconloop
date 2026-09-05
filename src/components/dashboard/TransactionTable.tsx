import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { EconomicEvent } from '../../types';
import { formatINR, RUPEE } from '../../utils/formatters';

interface TransactionTableProps {
  events: EconomicEvent[];
  selectedFilter: string;
  selectedEvent: EconomicEvent | null;
  onSelectEvent: (event: EconomicEvent) => void;
  onOpenAmbiguityDemo?: (event: EconomicEvent) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
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

  const uniqueDiscrepancies = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.discrepancy_class) set.add(e.discrepancy_class);
    });
    return Array.from(set).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (selectedFilter !== 'ALL') {
          if (e.status !== selectedFilter) return false;
        }

        if (discrepancyFilter !== 'ALL' && e.discrepancy_class !== discrepancyFilter) {
          return false;
        }

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchOrder = e.order_id?.toLowerCase().includes(q);
          const matchCustomer = e.customer_id?.toLowerCase().includes(q);
          const matchRef = e.payment_ref?.toLowerCase().includes(q);
          const matchSettlement = e.linked_settlement_ids?.some((id) => id.toLowerCase().includes(q));
          const matchBank = e.linked_bank_row_ids?.some((id) => id.toLowerCase().includes(q));
          return matchOrder || matchCustomer || matchRef || matchSettlement || matchBank;
        }

        return true;
      })
      .sort((a, b) => {
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
      setSortAsc(false);
    }
  };

  return (
    <div 
      className="surface-card rounded-lg border overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Search & Filter Toolbar */}
      <div 
        className="p-3.5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
        style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)' }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Order ID, Payment Ref, or UTR..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none transition-colors"
            style={{ 
              backgroundColor: 'var(--surface)', 
              borderColor: 'var(--border)', 
              color: 'var(--text-primary)' 
            }}
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Class:</span>
            <select
              value={discrepancyFilter}
              onChange={(e) => {
                setDiscrepancyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1 px-2.5 rounded-lg border text-xs focus:outline-none"
              style={{ 
                backgroundColor: 'var(--surface)', 
                borderColor: 'var(--border)', 
                color: 'var(--text-primary)' 
              }}
            >
              <option value="ALL">All Categories ({uniqueDiscrepancies.length})</option>
              {uniqueDiscrepancies.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {filteredEvents.length} events
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr 
              className="border-b text-[11px] font-medium uppercase tracking-wider"
              style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <th className="py-3 px-3.5 min-w-[135px]">
                <button
                  onClick={() => handleSort('order_id')}
                  className="flex items-center space-x-1 hover:opacity-80"
                >
                  <span>Order ID</span>
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </button>
              </th>
              <th className="py-3 px-3 min-w-[95px]">Date</th>
              <th className="py-3 px-3 min-w-[125px]">Payment Ref</th>
              <th className="py-3 px-3 text-right min-w-[105px]">Invoiced Gross</th>
              <th className="py-3 px-3 text-right min-w-[105px]">
                <button
                  onClick={() => handleSort('policy_expected_net')}
                  className="inline-flex items-center space-x-1 hover:opacity-80 ml-auto"
                >
                  <span>Policy Net</span>
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </button>
              </th>
              <th className="py-3 px-3 text-right min-w-[105px]">Gateway Net</th>
              <th className="py-3 px-3 text-right min-w-[110px]">Bank Cash</th>
              <th className="py-3 px-3 text-right min-w-[105px]">
                <button
                  onClick={() => handleSort('variance')}
                  className="inline-flex items-center space-x-1 hover:opacity-80 ml-auto"
                >
                  <span>Variance</span>
                  <ArrowUpDown className="w-3 h-3 opacity-50" />
                </button>
              </th>
              <th className="py-3 px-3 text-center min-w-[100px]">Status</th>
              <th className="py-3 px-3.5 min-w-[160px]">Discrepancy Category</th>
              <th className="py-3 px-2 w-[40px]"></th>
            </tr>
          </thead>

          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {paginatedEvents.map((e) => {
              const isSelected = selectedEvent?.event_id === e.event_id;
              const hasVariance = Math.abs(e.policy_vs_bank_variance) > 0.01;

              return (
                <tr
                  key={e.event_id}
                  onClick={() => onSelectEvent(e)}
                  className="cursor-pointer transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  style={{
                    backgroundColor: isSelected ? 'var(--surface-raised)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                  }}
                >
                  <td className="py-3 px-3.5 font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {e.order_id}
                  </td>
                  <td className="py-3 px-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {e.order_date}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] truncate max-w-[125px]" style={{ color: 'var(--text-muted)' }}>
                    {e.payment_ref}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatINR(e.order_amount)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatINR(e.policy_expected_net)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatINR(e.gateway_reported_net)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-xs" style={{ color: 'var(--text-primary)' }}>
                    {formatINR(e.bank_received_net)}
                  </td>
                  <td 
                    className="py-3 px-3 text-right font-mono tabular-nums text-xs" 
                    style={{ color: hasVariance ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                  >
                    {hasVariance ? formatINR(e.policy_vs_bank_variance, true) : '—'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span 
                      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide"
                      style={{
                        backgroundColor: e.status === 'RESOLVED' 
                          ? 'var(--positive-subtle)' 
                          : e.status === 'PENDING_EXPECTED' 
                          ? 'var(--warning-subtle)' 
                          : 'var(--error-subtle)',
                        color: e.status === 'RESOLVED' 
                          ? 'var(--positive-text)' 
                          : e.status === 'PENDING_EXPECTED' 
                          ? 'var(--warning-text)' 
                          : 'var(--error-text)',
                      }}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-[11px] truncate max-w-[170px]" style={{ color: 'var(--text-muted)' }}>
                    {e.discrepancy_class ? e.discrepancy_class.replace(/_/g, ' ') : 'Standard Settlement'}
                  </td>
                  <td className="py-3 px-2 text-right" style={{ color: 'var(--text-muted)' }}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div 
        className="p-3 border-t flex items-center justify-between text-xs"
        style={{ backgroundColor: 'var(--surface-inset)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <div>
          Page {currentPage} of {totalPages} ({filteredEvents.length} transactions)
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border disabled:opacity-30 transition-colors"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border disabled:opacity-30 transition-colors"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
