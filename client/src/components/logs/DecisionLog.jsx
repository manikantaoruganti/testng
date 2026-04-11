import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '../shared/Table';
import Badge from '../shared/Badge';
import { ScrollText, AlertTriangle } from 'lucide-react';

const DecisionLog = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-textSecondary text-center py-8">
        <ScrollText className="w-12 h-12 mx-auto mb-4" />
        <p>No decision logs available.</p>
      </div>
    );
  }

  const getBadgeType = (status) => {
    switch (status) {
      case 'executed': return 'success';
      case 'pending': return 'info';
      case 'failed': return 'error';
      default: return 'info';
    }
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <Table>
        <TableHeader>
          <TableColumn>Timestamp</TableColumn>
          <TableColumn>Decision Type</TableColumn>
          <TableColumn>Target</TableColumn>
          <TableColumn>Action</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Reason</TableColumn>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              <TableCell>{log.decisionType}</TableCell>
              <TableCell>{log.targetId || 'N/A'}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell><Badge type={getBadgeType(log.status)}>{log.status}</Badge></TableCell>
              <TableCell>{log.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DecisionLog;

