export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  checkedIn: boolean;
  checkInTime?: string;
  status: 'allowed' | 'denied';
}

// Mock guest data (shared across admin pages)
export const mockGuests: Guest[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    checkedIn: true,
    checkInTime: '19:45',
    status: 'allowed',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 234-5678',
    checkedIn: true,
    checkInTime: '20:12',
    status: 'allowed',
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    phone: '+1 (555) 345-6789',
    checkedIn: false,
    status: 'allowed',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    phone: '+1 (555) 456-7890',
    checkedIn: true,
    checkInTime: '20:35',
    status: 'allowed',
  },
  {
    id: '5',
    name: 'Robert Brown',
    email: 'robert@example.com',
    phone: '+1 (555) 567-8901',
    checkedIn: false,
    status: 'allowed',
  },
  {
    id: '6',
    name: 'James Davis',
    email: 'james@example.com',
    phone: '+1 (555) 678-9012',
    checkedIn: false,
    status: 'denied',
  },
];

