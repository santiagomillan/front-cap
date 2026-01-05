import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import { transactionApi } from '@/lib/api';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Search, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PendingApprovals = () => {
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    transactionId: string | null;
    reference: string;
  }>({ open: false, type: null, transactionId: null, reference: '' });

  const fetchTransactions = async () => {
    try {
      const data = await transactionApi.getAll('PENDING_APPROVAL');
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Mock data for demo
      setTransactions([
        {
          id: '1',
          reference: 'TRX-001',
          amount: 5000,
          currency: 'MXN',
          status: 'PENDING_APPROVAL',
          created_by: 'user1',
          created_by_email: 'operator@test.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          reference: 'TRX-002',
          amount: 12500,
          currency: 'USD',
          status: 'PENDING_APPROVAL',
          created_by: 'user1',
          created_by_email: 'operator2@test.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          reference: 'TRX-003',
          amount: 8750,
          currency: 'EUR',
          status: 'PENDING_APPROVAL',
          created_by: 'user1',
          created_by_email: 'operator@test.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) =>
    t.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleAction = async (action: 'approve' | 'reject', id: string) => {
    setActionLoading(id);
    try {
      if (action === 'approve') {
        await transactionApi.approve(id);
        toast({ title: 'Success', description: 'Transaction approved.' });
      } else if (action === 'reject') {
        await transactionApi.reject(id);
        toast({ title: 'Success', description: 'Transaction rejected.' });
      }
      fetchTransactions();
    } catch (error) {
      console.error(`Failed to ${action} transaction:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} transaction.`,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, type: null, transactionId: null, reference: '' });
    }
  };

  const openConfirmDialog = (type: 'approve' | 'reject', id: string, reference: string) => {
    setConfirmDialog({ open: true, type, transactionId: id, reference });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-status-pending-bg">
              <Clock className="h-5 w-5 text-status-pending" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pending Approvals</h1>
              <p className="text-muted-foreground mt-1">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} awaiting your review
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Table>
            <TableHeader>
              <TableRow className="bg-status-pending-bg/50">
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Quick Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-12 w-12 text-status-approved/50" />
                      <p className="text-lg font-medium text-foreground">All caught up!</p>
                      <p className="text-muted-foreground">No transactions pending approval.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <TableRow 
                    key={transaction.id}
                    className="bg-status-pending-bg/20 hover:bg-status-pending-bg/40 transition-colors"
                    style={{ animationDelay: `${(index + 1) * 50}ms` }}
                  >
                    <TableCell className="font-mono font-medium">
                      {transaction.reference}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.created_by_email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/transactions/${transaction.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="bg-status-approved text-primary-foreground hover:bg-status-approved/90"
                          onClick={() => openConfirmDialog('approve', transaction.id, transaction.reference)}
                          disabled={actionLoading === transaction.id}
                        >
                          {actionLoading === transaction.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openConfirmDialog('reject', transaction.id, transaction.reference)}
                          disabled={actionLoading === transaction.id}
                        >
                          {actionLoading === transaction.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'approve' ? 'Approve Transaction' : 'Reject Transaction'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmDialog.type} transaction {confirmDialog.reference}?
              {confirmDialog.type === 'reject' && ' This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog.transactionId && confirmDialog.type && 
                handleAction(confirmDialog.type, confirmDialog.transactionId)}
              className={
                confirmDialog.type === 'reject' 
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                  : 'bg-status-approved text-primary-foreground hover:bg-status-approved/90'
              }
            >
              {confirmDialog.type === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default PendingApprovals;
