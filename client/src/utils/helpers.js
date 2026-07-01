import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'MMM dd, yyyy');
export const formatDateTime = (date) => format(new Date(date), 'MMM dd, yyyy hh:mm a');
export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

export const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  open: 'bg-yellow-100 text-yellow-800',
  investigating: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  captured: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

export const amenitiesList = [
  'Covered', 'Lighting', 'Security Guard', 'CCTV', '24/7 Access',
  'Guarded Entry', 'Well Lit', 'Paved Surface', 'Drainage', 'Accessible',
];
