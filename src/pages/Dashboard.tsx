import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import StatCard from '@/components/StatCard';
import { transactionApi } from '@/lib/api';
import { TransactionStats } from '@/types';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  FileEdit,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await transactionApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Use mock data for demo
        setStats({
          total: 45,
          draft: 5,
          pending_approval: 12,
          approved: 18,
          rejected: 3,
          executed: 7,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-slide-up">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            {getGreeting()}, {user?.name || 'User'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {user?.role === 'OPERATOR' 
              ? 'Create and manage your transactions' 
              : 'Review and approve pending transactions'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                title="Total Transactions"
                value={stats?.total || 0}
                icon={FileText}
                variant="primary"
              />
              <StatCard
                title="Draft"
                value={stats?.draft || 0}
                icon={FileEdit}
                variant="default"
              />
              <StatCard
                title="Pending Approval"
                value={stats?.pending_approval || 0}
                icon={Clock}
                variant="warning"
              />
              <StatCard
                title="Approved"
                value={stats?.approved || 0}
                icon={CheckCircle}
                variant="success"
              />
              {user?.role === 'APPROVER' ? (
                <StatCard
                  title="Rejected"
                  value={stats?.rejected || 0}
                  icon={XCircle}
                  variant="danger"
                />
              ) : (
                <StatCard
                  title="Executed"
                  value={stats?.executed || 0}
                  icon={Zap}
                  variant="primary"
                />
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Role-specific content */}
          {user?.role === 'OPERATOR' && (
            <div className="card-elevated p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/transactions/create"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileEdit className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Create New Transaction</p>
                    <p className="text-sm text-muted-foreground">Start a new transaction request</p>
                  </div>
                </a>
                <a
                  href="/transactions"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-lg bg-accent/10">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">View My Transactions</p>
                    <p className="text-sm text-muted-foreground">Track your transaction status</p>
                  </div>
                </a>
              </div>
            </div>
          )}

          {user?.role === 'APPROVER' && (
            <div className="card-elevated p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h3 className="text-lg font-semibold text-foreground mb-4">Pending Reviews</h3>
              <div className="space-y-3">
                <a
                  href="/approvals"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-lg bg-status-pending-bg">
                    <Clock className="h-5 w-5 text-status-pending" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Pending Approvals</p>
                    <p className="text-sm text-muted-foreground">
                      {stats?.pending_approval || 0} transactions awaiting review
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-status-pending text-primary-foreground text-xs font-medium">
                    {stats?.pending_approval || 0}
                  </span>
                </a>
              </div>
            </div>
          )}

          {/* Recent Activity Placeholder */}
          <div className="card-elevated p-6 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Status Overview</h3>
            <div className="space-y-4">
              {[
                { label: 'Approved Rate', value: stats ? Math.round((stats.approved / (stats.total || 1)) * 100) : 0, color: 'bg-status-approved' },
                { label: 'Execution Rate', value: stats ? Math.round((stats.executed / (stats.approved || 1)) * 100) : 0, color: 'bg-status-executed' },
                { label: 'Rejection Rate', value: stats ? Math.round((stats.rejected / (stats.total || 1)) * 100) : 0, color: 'bg-status-rejected' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
