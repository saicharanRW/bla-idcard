'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CsvUpload } from '@/components/csv-upload';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';





export default function AdminDashboard() {
  // const [guests] = useState<Guest[]>(mockGuests); // Mock data removed
  // const [eventStats, setEventStats] = useState(() => computeEventStatsFromGuests(mockGuests)); // Mock stats removed
  const [eventStats, setEventStats] = useState({ total_invited: 0, checked_in: 0, not_checked_in: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'analytics' | 'entry_lists'>('analytics');
  const [guestTab, setGuestTab] = useState<'entered' | 'not_entered' | 'all_data'>('entered');
  const [guestSearch, setGuestSearch] = useState('');
  const [peopleData, setPeopleData] = useState<any[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Fetch people data (which now includes status)
  const fetchPeopleData = async () => {
    setLoadingPeople(true);
    try {
      const res = await fetch('/api/people');
      const json = await res.json();
      if (json.data) {
        setPeopleData(json.data);

        // Compute stats from real data
        const total = json.data.length;
        const entered = json.data.filter((p: any) => p.entered_at).length;
        const notEntered = total - entered;
        setEventStats({ total_invited: total, checked_in: entered, not_checked_in: notEntered });
      }
    } catch (err) {
      console.error("Failed to fetch people data", err);
    } finally {
      setLoadingPeople(false);
    }
  };

  // Initial fetch
  useMemo(() => {
    fetchPeopleData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPeopleData();
    setIsRefreshing(false);
  };

  const checkinPercentage =
    eventStats.total_invited > 0
      ? Math.round((eventStats.checked_in / eventStats.total_invited) * 100)
      : 0;

  const enteredGuests = useMemo(
    () =>
      peopleData
        .filter((p) => p.entered_at)
        .filter((p) => (p.bla2_name || '').toLowerCase().includes(guestSearch.toLowerCase())),
    [peopleData, guestSearch]
  );

  const notEnteredGuests = useMemo(
    () =>
      peopleData
        .filter((p) => !p.entered_at)
        .filter((p) => (p.bla2_name || '').toLowerCase().includes(guestSearch.toLowerCase())),
    [peopleData, guestSearch]
  );

  const filteredPeopleData = useMemo(() => {
    return peopleData.filter((p) => {
      const search = guestSearch.toLowerCase();
      return (
        (p.bla2_name || '').toLowerCase().includes(search) ||
        (p.assembly_constituency || '').toLowerCase().includes(search) ||
        (p.party_responsibility || '').toLowerCase().includes(search)
      );
    });
  }, [peopleData, guestSearch]);

  const tabGuests = guestTab === 'entered' ? enteredGuests : (guestTab === 'not_entered' ? notEnteredGuests : filteredPeopleData);

  // Filter data by selected date for graphs
  const filteredByDate = useMemo(() => {
    if (!selectedDate) return peopleData;
    return peopleData.filter(p => {
      if (!p.entered_at) return false;
      const entryDate = format(new Date(p.entered_at), 'yyyy-MM-dd');
      return entryDate === selectedDate;
    });
  }, [peopleData, selectedDate]);

  // Stats for selected date
  const dateFilteredStats = useMemo(() => {
    const entered = filteredByDate.length;
    const total = peopleData.length;
    return { checked_in: entered, total_invited: total, not_checked_in: total - entered };
  }, [filteredByDate, peopleData]);

  const dynamicEntranceStats = useMemo(
    () => [
      { name: 'Checked In', value: dateFilteredStats.checked_in, fill: '#a78bfa' },
      { name: 'Not Checked', value: dateFilteredStats.not_checked_in, fill: '#6b7280' },
    ],
    [dateFilteredStats.checked_in, dateFilteredStats.not_checked_in]
  );

  // Compute graph data dynamically based on selected date
  const { hourlyArrivals, cumulativeArrivals } = useMemo(() => {
    const timeSlots = new Map<string, number>();
    const guestsWithTime = filteredByDate
      .map(p => ({ ...p, time: new Date(p.entered_at) }))
      .sort((a, b) => a.time.getTime() - b.time.getTime());

    if (guestsWithTime.length === 0) {
      return { hourlyArrivals: [], cumulativeArrivals: [] };
    }

    guestsWithTime.forEach(g => {
      // Round to nearest 30 min
      const date = g.time;
      const minutes = date.getMinutes();
      const roundedMinutes = minutes < 30 ? '00' : '30';
      const slot = `${date.getHours().toString().padStart(2, '0')}:${roundedMinutes}`;
      timeSlots.set(slot, (timeSlots.get(slot) || 0) + 1);
    });

    // Create sorted array of slots
    const sortedSlots = Array.from(timeSlots.keys()).sort();

    const hourly = sortedSlots.map(time => ({
      time,
      guests: timeSlots.get(time) || 0
    }));

    let runningTotal = 0;
    const cumulative = hourly.map(slot => {
      runningTotal += slot.guests;
      return { time: slot.time, total: runningTotal };
    });

    return { hourlyArrivals: hourly, cumulativeArrivals: cumulative };
  }, [filteredByDate]);


  return (
    <div className="min-h-screen space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Event Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Real-time analytics and guest management
          </p>
        </div>
        {/* <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
          className="w-full sm:w-auto border-border text-foreground hover:bg-secondary bg-transparent text-sm sm:text-base"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button> */}
        <CsvUpload />
      </div>

      {/* Top Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={dashboardTab === 'analytics' ? 'default' : 'outline'}
          onClick={() => setDashboardTab('analytics')}
          className={`text-xs sm:text-sm min-h-9 ${dashboardTab === 'analytics'
            ? 'bg-accent text-accent-foreground'
            : 'border-border text-foreground hover:bg-secondary'
            }`}
        >
          Analytics
        </Button>
        <Button
          variant={dashboardTab === 'entry_lists' ? 'default' : 'outline'}
          onClick={() => setDashboardTab('entry_lists')}
          className={`text-xs sm:text-sm min-h-9 ${dashboardTab === 'entry_lists'
            ? 'bg-accent text-accent-foreground'
            : 'border-border text-foreground hover:bg-secondary'
            }`}
        >
          Entry Lists
        </Button>
      </div>

      {/* Guest Lists: Entered vs Not Entered */}
      {dashboardTab === 'analytics' ? (
        <>
          {/* Date Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label htmlFor="date-filter" className="text-sm font-medium text-foreground">
                Filter by Date:
              </label>
              <Input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-input text-foreground text-sm min-h-10 w-auto"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Showing entries for: <span className="font-semibold text-foreground">{selectedDate ? format(new Date(selectedDate + 'T00:00:00'), 'MMMM d, yyyy') : 'All dates'}</span>
              {' '}({filteredByDate.length} check-ins)
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 bg-card border-border">
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">Total Invited</p>
                <p className="text-3xl sm:text-4xl font-bold text-foreground">
                  {eventStats.total_invited}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Confirmed guests</p>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-card border-border">
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">Checked In</p>
                <p className="text-3xl sm:text-4xl font-bold text-accent">
                  {eventStats.checked_in}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {checkinPercentage}% of total guests
                </p>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-card border-border sm:col-span-2 lg:col-span-1">
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">Pending Entry</p>
                <p className="text-3xl sm:text-4xl font-bold text-foreground">
                  {eventStats.not_checked_in}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {100 - checkinPercentage}% not yet arrived
                </p>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Arrival Timeline */}
            <Card className="p-4 sm:p-6 bg-card border-border">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
                Guest Arrivals Timeline
              </h3>
              <div className="h-[250px] w-full flex items-center justify-center">
                {hourlyArrivals.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={hourlyArrivals}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: `1px solid var(--border)`,
                          borderRadius: '0.625rem',
                        }}
                        labelStyle={{ color: 'var(--foreground)' }}
                      />
                      <Bar dataKey="guests" fill="var(--accent)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm italic">No data available for this date</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Check-in Status */}
            <Card className="p-4 sm:p-6 bg-card border-border">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
                Check-in Status
              </h3>
              <div className="h-[250px] w-full flex items-center justify-center">
                {dateFilteredStats.total_invited > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={dynamicEntranceStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dynamicEntranceStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: `1px solid var(--border)`,
                          borderRadius: '0.625rem',
                        }}
                        labelStyle={{ color: 'var(--foreground)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm italic">No data available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Cumulative Arrivals */}
          <Card className="p-4 sm:p-6 bg-card border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">
              Cumulative Guest Arrivals
            </h3>
            <div className="h-[250px] w-full flex items-center justify-center">
              {cumulativeArrivals.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart
                    data={cumulativeArrivals}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="time" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: `1px solid var(--border)`,
                        borderRadius: '0.625rem',
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--accent)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--accent)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground text-sm italic">No data available for this date</p>
                </div>
              )}
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-4 sm:p-6 bg-card border-border">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">
                  Guest Entry Lists
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                  Names of guests who have entered vs not entered
                </p>
              </div>

              <Input
                type="text"
                placeholder="Search guest name..."
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                className="bg-input text-foreground text-sm min-h-10 w-full sm:max-w-xs"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={guestTab === 'entered' ? 'default' : 'outline'}
                onClick={() => setGuestTab('entered')}
                className={`text-xs sm:text-sm min-h-9 ${guestTab === 'entered'
                  ? 'bg-accent text-accent-foreground'
                  : 'border-border text-foreground hover:bg-secondary'
                  }`}
              >
                Entered ({enteredGuests.length})
              </Button>
              <Button
                variant={guestTab === 'not_entered' ? 'default' : 'outline'}
                onClick={() => setGuestTab('not_entered')}
                className={`text-xs sm:text-sm min-h-9 ${guestTab === 'not_entered'
                  ? 'bg-accent text-accent-foreground'
                  : 'border-border text-foreground hover:bg-secondary'
                  }`}
              >
                Not Entered ({notEnteredGuests.length})
              </Button>
              <Button
                variant={guestTab === 'all_data' ? 'default' : 'outline'}
                onClick={() => setGuestTab('all_data')}
                className={`text-xs sm:text-sm min-h-9 ${guestTab === 'all_data'
                  ? 'bg-accent text-accent-foreground'
                  : 'border-border text-foreground hover:bg-secondary'
                  }`}
              >
                All Data ({peopleData.length})
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-border">
                    {guestTab === 'all_data' ? (
                      <>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">party_responsibility</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">party_district</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">assembly_constituency</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">assembly_constituency_number</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">polling_station_number</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">bla2_name</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">file_name</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm max-w-[150px]">qr_data</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">
                          Name
                        </th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground hidden md:table-cell text-xs sm:text-sm">
                          Responsibility
                        </th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground text-xs sm:text-sm">
                          Status
                        </th>
                        <th className="text-center py-2 sm:py-3 px-2 sm:px-4 font-semibold text-foreground hidden md:table-cell text-xs sm:text-sm">
                          Time
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tabGuests.map((g: any, i: number) => (
                    <tr key={g.id || i} className="border-b border-border hover:bg-secondary/50">
                      {guestTab === 'all_data' ? (
                        <>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-foreground text-xs sm:text-sm truncate">{g.party_responsibility}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-foreground text-xs sm:text-sm truncate">{g.party_district}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-foreground text-xs sm:text-sm truncate">{g.assembly_constituency}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-foreground text-xs sm:text-sm truncate">{g.assembly_constituency_number}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-foreground text-xs sm:text-sm truncate">{g.polling_station_number}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-foreground text-xs sm:text-sm truncate">{g.bla2_name}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-foreground text-xs sm:text-sm truncate">{g.file_name}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-foreground text-xs sm:text-sm truncate max-w-[150px]" title={g.qr_data}>{g.qr_data}</td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-foreground text-xs sm:text-sm truncate">
                            {g.bla2_name}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-muted-foreground hidden md:table-cell text-xs sm:text-sm truncate">
                            {g.party_responsibility || '—'}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                            {guestTab === 'entered' ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs">
                                ✓ Entered
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs">
                                Not Entered
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4 text-center text-muted-foreground hidden md:table-cell text-xs sm:text-sm">
                            {g.entered_at ? new Date(g.entered_at).toLocaleTimeString() : '—'}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {tabGuests.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    {guestSearch.trim()
                      ? 'No guests found matching your search.'
                      : guestTab === 'entered'
                        ? 'No guests have entered yet.'
                        : 'All guests have entered.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
