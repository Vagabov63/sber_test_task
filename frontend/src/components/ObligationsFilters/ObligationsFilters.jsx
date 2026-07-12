import { useFilters } from '../../hooks/useFilters';

import './ObligationsFilters.css';

const CATEGORY_OPTIONS = [
  { value: 'subscription', label: 'Подписка' },
  { value: 'bill', label: 'Счет' },
  { value: 'warranty', label: 'Гарантия' },
  { value: 'insurance', label: 'Страхование' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Активные' },
  { value: 'expired', label: 'Просроченные' },
  { value: 'cancelled', label: 'Отмененные' },
  { value: 'paid', label: 'Оплаченные' },
];

export default function ObligationsFilters() {
  const { filters, updateFilter, resetFilters } = useFilters();

  const hasActiveFilters = filters.search || filters.category || filters.status;

  return (
    <div className="filters-container">
      <div className="filters-row">
        <div className="filter-group filter-group-search">
          <input
            type="text"
            className="filter-input"
            placeholder="Поиск по названию..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            <option value="">Все категории</option>
            {CATEGORY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="">Все статусы</option>
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button className="filter-reset-btn" onClick={resetFilters}>
            ✕ Сбросить
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Активные фильтры:</span>
          {filters.search && (
            <span className="filter-tag">
              Поиск: "{filters.search}"
              <button 
                className="filter-tag-remove"
                onClick={() => updateFilter('search', '')}
              >
                ×
              </button>
            </span>
          )}
          {filters.category && (
            <span className="filter-tag">
              {CATEGORY_OPTIONS.find(opt => opt.value === filters.category)?.label || filters.category}
              <button 
                className="filter-tag-remove"
                onClick={() => updateFilter('category', '')}
              >
                ×
              </button>
            </span>
          )}
          {filters.status && (
            <span className="filter-tag">
              {STATUS_OPTIONS.find(opt => opt.value === filters.status)?.label || filters.status}
              <button 
                className="filter-tag-remove"
                onClick={() => updateFilter('status', '')}
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}