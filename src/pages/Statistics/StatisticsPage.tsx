import React from 'react';
import { useStats } from '../../hooks/useStats';
import { formatPlaytime } from '../../utils/format';
import { STATUS_CONFIGS, getPlatformConfig } from '../../utils/status';
import { GameCoverImage } from '../../components/common/GameCoverImage';
import { PlatformBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Trophy,
  Clock,
  Star,
  Gamepad2,
  CheckCircle2,
  Target,
  Tags,
  Crown,
  Medal,
  Award,
} from 'lucide-react';

interface StatisticsPageProps {
  onSelectGame: (gameId: string) => void;
  onOpenAddModal: () => void;
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({
  onSelectGame,
  onOpenAddModal,
}) => {
  const { stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-28 bg-neutral-900 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-neutral-900 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (stats.totalGames === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <EmptyState
          icon={<BarChart3 className="w-7 h-7 text-amber-500" />}
          title="No gaming analytics yet"
          description="Your statistics and charts will automatically populate as you add games and log play sessions."
          actionLabel="Add a Game"
          onAction={onOpenAddModal}
        />
      </div>
    );
  }

  // Format data for Status Pie Chart
  const statusPieData = (
    Object.keys(stats.statusDistribution) as Array<keyof typeof stats.statusDistribution>
  )
    .map((status) => ({
      name: STATUS_CONFIGS[status]?.shortLabel || status,
      value: stats.statusDistribution[status] || 0,
      color: STATUS_CONFIGS[status]?.color || '#9ca3af',
    }))
    .filter((item) => item.value > 0);

  // Format data for Platform Bar Chart
  const platformChartData = stats.platformDistribution.slice(0, 6).map((item) => ({
    name: item.platform,
    games: item.count,
    color: getPlatformConfig(item.platform).brandColor,
  }));

  // Format data for Genre Bar Chart
  const genreChartData = stats.genreDistribution.slice(0, 6).map((item) => ({
    name: item.genre,
    games: item.count,
  }));

  // Playtime by Month Chart data (convert minutes to hours for clean chart labels)
  const monthlyPlaytimeData = stats.playtimeByMonth.map((item) => ({
    month: item.month,
    hours: Number((item.minutes / 60).toFixed(1)),
    rawMinutes: item.minutes,
  }));

  const completionPercent =
    stats.totalGames > 0 ? Math.round((stats.completedGames / stats.totalGames) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-xs tracking-wider uppercase">
          <BarChart3 className="w-4 h-4" />
          <span>Gamer Analytics</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight mt-1">
          Gaming Statistics & Records
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
          Real metrics derived strictly from your local library and play logs.
        </p>
      </div>

      {/* Top Stat Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Games */}
        <div className="p-5 rounded-3xl frosted-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Games</span>
            <Gamepad2 className="w-4 h-4 text-slate-400 dark:text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-neutral-100 mt-2 font-mono">
            {stats.totalGames}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1 block">In your personal catalog</span>
        </div>

        {/* Total Recorded Playtime */}
        <div className="p-5 rounded-3xl frosted-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Recorded Time</span>
            <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--accent)] mt-2 font-mono">
            {formatPlaytime(stats.totalPlaytimeMinutes)}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-neutral-400 mt-1 block">Total gameplay recorded</span>
        </div>

        {/* Completed Games */}
        <div className="p-5 rounded-3xl frosted-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {stats.completedGames}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-500/80 mt-1 block font-semibold">
            {completionPercent}% completion rate
          </span>
        </div>

        {/* Average Rating */}
        <div className="p-5 rounded-3xl frosted-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Average Rating</span>
            <Star className="w-4 h-4 text-[var(--accent)] fill-[var(--accent)]/20" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-neutral-100 mt-2 font-mono">
            {stats.averageRating !== null ? `${stats.averageRating} / 5` : '—'}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1 block">From your rated titles</span>
        </div>
      </div>

      {/* SECTION: HALL OF FAME (Top 3 Most Played Games Podium) */}
      {stats.topPlayedGames && stats.topPlayedGames.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-100">Most Played Games</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.topPlayedGames.map(({ game, minutes }, index) => {
              const podiumConfigs = [
                {
                  rank: '1st',
                  label: 'Gold',
                  badgeBg: 'bg-[var(--accent)] text-neutral-950',
                  icon: <Crown className="w-3.5 h-3.5 stroke-[2.5]" />,
                },
                {
                  rank: '2nd',
                  label: 'Silver',
                  badgeBg: 'bg-slate-200 text-slate-800 dark:bg-slate-300 dark:text-neutral-950',
                  icon: <Medal className="w-3.5 h-3.5 stroke-[2.5]" />,
                },
                {
                  rank: '3rd',
                  label: 'Bronze',
                  badgeBg: 'bg-amber-700/80 text-white',
                  icon: <Award className="w-3.5 h-3.5 stroke-[2.5]" />,
                },
              ][index] || {
                rank: `${index + 1}th`,
                label: 'Runner-up',
                badgeBg: 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-200',
                icon: <Gamepad2 className="w-3.5 h-3.5" />,
              };

              return (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game.id)}
                  className="p-5 rounded-3xl frosted-card hover:scale-[1.02] transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-white/10 shadow-md">
                      <GameCoverImage src={game.coverUrl} alt={game.title} aspectRatio="vertical" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm ${podiumConfigs.badgeBg}`}>
                          {podiumConfigs.icon}
                          <span>{podiumConfigs.rank}</span>
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-neutral-100 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                        {game.title}
                      </h3>
                      <div className="mt-1">
                        <PlatformBadge platform={game.selectedPlatform} size="sm" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-neutral-400">Total Played</span>
                    <span className="text-base font-extrabold text-[var(--accent)] font-mono">
                      {formatPlaytime(minutes)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown (Donut Pie Chart) */}
        <div className="p-5 sm:p-6 rounded-3xl frosted-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">Library by Status</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Distribution of game statuses</p>
            </div>
            <Target className="w-4 h-4 text-[var(--accent)]" />
          </div>

          <div className="h-64 flex items-center justify-center">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400 dark:text-neutral-500">No status data</span>
            )}
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200/60 dark:border-white/10 text-xs">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-neutral-400 truncate">{item.name}</span>
                <span className="font-semibold text-slate-800 dark:text-neutral-200 ml-auto font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl frosted-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">Games by Platform</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Top platforms in your collection</p>
            </div>
            <Gamepad2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </div>

          <div className="h-64">
            {platformChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#64748b"
                    fontSize={11}
                    width={90}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="games" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-neutral-500">
                No platform data
              </div>
            )}
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-neutral-400 pt-2 border-t border-slate-200/60 dark:border-white/10">
            Total of {stats.platformDistribution.length} distinct platform
            {stats.platformDistribution.length === 1 ? '' : 's'} recorded
          </div>
        </div>

        {/* Genre Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl frosted-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">Games by Genre</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Top genres across your catalog</p>
            </div>
            <Tags className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="h-64">
            {genreChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genreChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#64748b"
                    fontSize={11}
                    width={90}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="games" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-neutral-500">
                No genre data
              </div>
            )}
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-neutral-400 pt-2 border-t border-slate-200/60 dark:border-white/10">
            Total of {stats.genreDistribution.length} distinct genre
            {stats.genreDistribution.length === 1 ? '' : 's'} recorded
          </div>
        </div>

        {/* Playtime Activity by Month */}
        <div className="p-5 sm:p-6 rounded-3xl frosted-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-neutral-100">Monthly Playtime Journey</h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">Logged hours per month</p>
            </div>
            <Clock className="w-4 h-4 text-[var(--accent)]" />
          </div>

          <div className="h-64">
            {monthlyPlaytimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPlaytimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="h" />
                  <Tooltip
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: unknown) => [`${val} hours`, 'Logged Time']}
                  />
                  <Bar dataKey="hours" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 dark:text-neutral-500 gap-1">
                <span>No recorded play sessions yet</span>
                <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                  Log a gameplay session from any game's detail page
                </span>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-neutral-400 pt-2 border-t border-slate-200/60 dark:border-white/10">
            Total of {stats.playtimeByMonth.length} active month{stats.playtimeByMonth.length === 1 ? '' : 's'} recorded
          </div>
        </div>
      </div>
    </div>
  );
};
