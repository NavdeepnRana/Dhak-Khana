import { CheckCircle, Clock, PauseCircle, Truck, XCircle, Hourglass, RefreshCcw, RotateCcw } from 'lucide-react';

export const STATUS_OPTIONS = [
  'Pending Approval',
  'Booked',
  'Picked Up',
  'Arrived at Hub',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Returned',
  'Failed Attempt',
  'On Hold',
  'Cancelled',
  'Cancelled by User',
];

export const statusMeta = {
  'Pending Approval': {
    badge: 'warning',
    Icon: Hourglass,
  },
  Booked: {
    badge: 'primary',
    Icon: Clock,
  },
  'Picked Up': {
    badge: 'primary',
    Icon: CheckCircle,
  },
  'Arrived at Hub': {
    badge: 'info',
    Icon: Truck,
  },
  'In Transit': {
    badge: 'info',
    Icon: Truck,
  },
  'Out for Delivery': {
    badge: 'primary',
    Icon: Truck,
  },
  Returned: {
    badge: 'secondary',
    Icon: RotateCcw,
  },
  'Failed Attempt': {
    badge: 'warning',
    Icon: RefreshCcw,
  },
  'On Hold': {
    badge: 'warning',
    Icon: PauseCircle,
  },
  Delivered: {
    badge: 'success',
    Icon: CheckCircle,
  },
  Cancelled: {
    badge: 'danger',
    Icon: XCircle,
  },
  'Cancelled by User': {
    badge: 'secondary',
    Icon: XCircle,
  },
};

export function getStatusBadge(status) {
  return statusMeta[status]?.badge || 'secondary';
}

export function getStatusIcon(status) {
  return statusMeta[status]?.Icon || XCircle;
}

