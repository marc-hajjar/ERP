import React from 'react';
import { statusBadgeClass, capitalize } from '../../utils/formatters';

export default function StatusBadge({ status }) {
  return <span className={`badge ${statusBadgeClass(status)}`}>{capitalize(status)}</span>;
}