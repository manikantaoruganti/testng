import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '../shared/Table'; // Assuming a Table component
import Badge from '../shared/Badge';
import { List, AlertTriangle } from 'lucide-react';

const EventLogTable = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="text-textSecondary text-center py-8">
        <List className="w-12 h-12 mx-auto mb-4" />
        <p>No event logs available.</p>
      </div>
    );
  }

  const getBadgeType = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'info';
    }
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <Table>
        <TableHeader>
          <TableColumn>Timestamp</TableColumn>
          <TableColumn>Event Type</TableColumn>
          <TableColumn>Severity</TableColumn>
          <TableColumn>Location</TableColumn>
          <TableColumn>Message</TableColumn>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              <TableCell>{log.eventType}</TableCell>
              <TableCell><Badge type={getBadgeType(log.severity)}>{log.severity}</Badge></TableCell>
              <TableCell>{log.locationId || 'N/A'}</TableCell>
              <TableCell>{log.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EventLogTable;

