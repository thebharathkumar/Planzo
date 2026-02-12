export default function StatsOverview({ stats }) {
  const defaultStats = stats || {
    totalEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    totalBookings: 0,
  };

  const cards = [
    { label: 'Total Events', value: defaultStats.totalEvents, icon: '📅' },
    { label: 'Active Events', value: defaultStats.activeEvents, icon: '🟢' },
    { label: 'Total Revenue', value: `$${defaultStats.totalRevenue.toFixed(2)}`, icon: '💰' },
    { label: 'Total Bookings', value: defaultStats.totalBookings, icon: '🎫' },
  ];

  return (
    <div className="stats-overview">
      {cards.map((card) => (
        <div key={card.label} className="stat-card">
          <span className="stat-icon">{card.icon}</span>
          <div>
            <p className="stat-value">{card.value}</p>
            <p className="stat-label">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
