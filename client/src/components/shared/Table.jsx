import React from 'react';

const Table = ({ children, className = '', ...props }) => {
  return (
    <table className={`min-w-full divide-y divide-border rounded-xl overflow-hidden ${className}`} {...props}>
      {children}
    </table>
  );
};

export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-background ${className}`} {...props}>
      <tr>{children}</tr>
    </thead>
  );
};

export const TableColumn = ({ children, className = '', ...props }) => {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`bg-surface divide-y divide-border ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr className={`hover:bg-background transition-colors duration-150 ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-text ${className}`} {...props}>
      {children}
    </td>
  );
};

export default Table;

