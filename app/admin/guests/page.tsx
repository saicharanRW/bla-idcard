'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { mockGuests, type Guest } from '@/lib/mockGuests';

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>(mockGuests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked-in' | 'pending' | 'denied'>(
    'all'
  );

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'checked-in') return matchesSearch && guest.checkedIn;
    if (filterStatus === 'pending') return matchesSearch && !guest.checkedIn && guest.status === 'allowed';
    if (filterStatus === 'denied') return matchesSearch && guest.status === 'denied';
    return matchesSearch;
  });

  const checkedInCount = guests.filter((g) => g.checkedIn).length;
  const pendingCount = guests.filter((g) => !g.checkedIn && g.status === 'allowed').length;
  const deniedCount = guests.filter((g) => g.status === 'denied').length;

  return (
    <div className="min-h-screen space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Guest Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            View and manage all registered guests
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full sm:w-auto border-border text-foreground hover:bg-secondary bg-transparent text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export List
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-card border-border">
          <p className="text-muted-foreground text-xs sm:text-sm mb-1">Total Guests</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{guests.length}</p>
        </Card>
        <Card className="p-3 sm:p-4 bg-card border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs sm:text-sm mb-1">Checked In</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{checkedInCount}</p>
            </div>
            <CheckCircle className="w-6 sm:w-8 h-6 sm:h-8 text-green-600 flex-shrink-0" />
          </div>
        </Card>
        <Card className="p-3 sm:p-4 bg-card border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs sm:text-sm mb-1">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{pendingCount}</p>
            </div>
            <Clock className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600 flex-shrink-0" />
          </div>
        </Card>
        <Card className="p-3 sm:p-4 bg-card border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs sm:text-sm mb-1">Denied</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{deniedCount}</p>
            </div>
            <XCircle className="w-6 sm:w-8 h-6 sm:h-8 text-red-600 flex-shrink-0" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 sm:p-6 bg-card border-border">
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-input text-foreground text-sm min-h-10"
          />
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All', value: 'all' },
              { label: 'Checked In', value: 'checked-in' },
              { label: 'Pending', value: 'pending' },
              { label: 'Denied', value: 'denied' },
            ].map((btn) => (
              <Button
                key={btn.value}
                variant={filterStatus === btn.value ? 'default' : 'outline'}
                onClick={() => setFilterStatus(btn.value as any)}
                className={`text-xs sm:text-sm min-h-9 ${filterStatus === btn.value
                    ? 'bg-accent text-accent-foreground'
                    : 'border-border text-foreground hover:bg-secondary'
                  }`}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Guests Table */}
      <Card className="p-4 sm:p-6 bg-card border-border overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">
                  Guest Name
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground hidden md:table-cell text-xs sm:text-sm">
                  Email
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground hidden lg:table-cell text-xs sm:text-sm">
                  Phone
                </th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">
                  Check-in
                </th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground hidden md:table-cell text-xs sm:text-sm">
                  Time
                </th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">
                  Access
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-foreground text-xs sm:text-sm truncate">
                    {guest.name}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-muted-foreground hidden md:table-cell text-xs sm:text-sm truncate">
                    {guest.email}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-muted-foreground hidden lg:table-cell text-xs sm:text-sm truncate">
                    {guest.phone || '—'}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                    {guest.checkedIn ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs">
                        ✓ Entered
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 text-xs">
                        Pending
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-muted-foreground hidden md:table-cell text-xs sm:text-sm">
                    {guest.checkInTime || '—'}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                    {guest.status === 'allowed' ? (
                      <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredGuests.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No guests found matching your criteria.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
