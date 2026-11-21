import React from 'react';
import { 
  Send, 
  Activity, 
  Users, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  CheckCircle2 
} from 'lucide-react';

export default function StatsOverview({ stats }) {
  if (!stats) return null;

  const statItems = [
    {
      title: 'Total Applications',
      value: stats.total_applied,
      subtitle: `${stats.active_count} active pipelines`,
      icon: Send,
      color: 'from-blue-500 to-sky-600',
      iconColor: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20'
    },
    {
      title: 'Interviews Scheduled',
      value: stats.interviews_count,
      subtitle: `${stats.oa_test_count} in OA/Test stage`,
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      title: 'Offers Received',
      value: stats.offers_count,
      subtitle: 'Target: 1+ Strong Offer',
      icon: Award,
      color: 'from-amber-500 to-yellow-600',
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
    {
      title: 'Response Rate',
      value: `${stats.response_rate_pct}%`,
      subtitle: 'Replies, OAs, & Interviews',
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-600',
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Overdue Follow-ups',
      value: stats.overdue_followups_count,
      subtitle: stats.overdue_followups_count > 0 ? 'Action needed today' : 'All clear',
      icon: AlertTriangle,
      color: 'from-rose-500 to-pink-600',
      iconColor: 'text-rose-400',
      bgColor: stats.overdue_followups_count > 0 ? 'bg-rose-500/15' : 'bg-slate-800/40',
      borderColor: stats.overdue_followups_count > 0 ? 'border-rose-500/40' : 'border-slate-800'
    },
    {
      title: 'Upcoming Deadlines',
      value: stats.deadlines_soon_count,
      subtitle: 'Next 7 days',
      icon: Calendar,
      color: 'from-cyan-500 to-blue-600',
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-slate-900/80 border ${item.borderColor} shadow-lg backdrop-blur-sm transition-all hover:border-slate-700`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">{item.title}</span>
              <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {item.value}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {item.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
