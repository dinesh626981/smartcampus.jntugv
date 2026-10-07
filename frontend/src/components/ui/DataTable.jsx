import Spinner from './Spinner';
import EmptyState from './EmptyState';

/**
 * Material 3 DataTable Component
 * No outer border, 1px row dividers, 52px row height, label-large header.
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There is no data available to display in this table.',
  keyField = 'id',
  onRowClick,
  className = '',
}) => {
  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <Spinner text="Loading table data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[var(--md-sys-color-outline-variant)] h-12">
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`
                  px-4 text-sm font-medium leading-5 text-[var(--md-sys-color-on-surface-variant)]
                  tracking-[0.1px] whitespace-nowrap select-none
                  ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                  ${col.headerClassName || ''}
                `}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
          {data.map((row, rowIdx) => (
            <tr
              key={row[keyField] || rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`
                h-[52px] text-sm font-normal leading-5 text-[var(--md-sys-color-on-surface)]
                transition-colors duration-150
                ${onRowClick ? 'cursor-pointer hover:bg-[var(--md-sys-color-primary)]/4' : 'hover:bg-neutral-50/50'}
              `}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={col.key || colIdx}
                  className={`
                    px-4 py-3
                    ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                    ${col.className || ''}
                  `}
                >
                  {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
