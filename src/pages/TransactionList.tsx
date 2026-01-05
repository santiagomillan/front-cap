import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import { transactionApi } from '@/lib/api';
import { Transaction, TransactionStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Search, Send, CheckCircle, XCircle, Plus, Loader2 } from 'lucide-react';
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

const statusOptions: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'EXECUTED', label: 'Executed' },
];

const TransactionList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'submit' | null;
    transactionId: string | null;
    reference: string;
  }>({ open: false, type: null, transactionId: null, reference: '' });

  const fetchTransactions = async () => {
    try {
      const status = statusFilter !== 'ALL' ? statusFilter as TransactionStatus : undefined;
      const data = await transactionApi.getAll(status);
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
          status: 'DRAFT',
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
          created_by_email: 'operator@test.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          reference: 'TRX-003',
          amount: 8750,
          currency: 'EUR',
          status: 'APPROVED',
          created_by: 'user1',
          created_by_email: 'operator@test.com',
          approved_by: 'user2',
          approved_by_email: 'approver@test.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4',
          reference: 'TRX-004',
          amount: 3200,
          currency: 'MXN',
          status: 'EXECUTED',
          created_by: 'user1',
          created_by_email: 'operator@test.com',
          approved_by: 'user2',
          approved_by_email: 'approver@test.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '5',
          reference: 'TRX-005',
          amount: 15000,
          currency: 'USD',
          status: 'REJECTED',
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
  }, [statusFilter]);

  const filteredTransactions = transactions.filter((t) =>
    t.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const handleAction = async (action: 'submit' | 'approve' | 'reject', id: string) => {
    setActionLoading(id);
    try {
      if (action === 'submit') {
        await transactionApi.submit(id);
        toast({ title: 'Success', description: 'Transaction submitted for approval.' });
      } else if (action === 'approve') {
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

  const openConfirmDialog = (type: 'approve' | 'reject' | 'submit', id: string, reference: string) => {
    setConfirmDialog({ open: true, type, transactionId: id, reference });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {user?.role === 'OPERATOR' ? 'My Transactions' : 'All Transactions'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'OPERATOR'
                ? 'View and manage your transaction requests'
                : 'Review all transactions in the system'}
            </p>
          </div>
          {user?.role === 'OPERATOR' && (
            <Link to="/transactions/create">
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="card-elevated overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                {user?.role === 'APPROVER' && <TableHead>Created By</TableHead>}
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    {user?.role === 'APPROVER' && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={user?.role === 'APPROVER' ? 6 : 5} 
                    className="text-center py-12 text-muted-foreground"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id}
                    className={transaction.status === 'PENDING_APPROVAL' ? 'bg-status-pending-bg/30' : ''}
                  >
                    <TableCell className="font-mono font-medium">
                      {transaction.reference}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={transaction.status} />
                    </TableCell>
                    {user?.role === 'APPROVER' && (
                      <TableCell className="text-muted-foreground">
                        {transaction.created_by_email}
                      </TableCell>
                    )}
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
                        
                        {user?.role === 'OPERATOR' && transaction.status === 'DRAFT' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConfirmDialog('submit', transaction.id, transaction.reference)}
                            disabled={actionLoading === transaction.id}
                          >
                            {actionLoading === transaction.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Submit
                              </>
                            )}
                          </Button>
                        )}
                        
                        {user?.role === 'APPROVER' && transaction.status === 'PENDING_APPROVAL' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-status-approved border-status-approved hover:bg-status-approved-bg"
                              onClick={() => openConfirmDialog('approve', transaction.id, transaction.reference)}
                              disabled={actionLoading === transaction.id}
                            >
                              {actionLoading === transaction.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive hover:bg-status-rejected-bg"
                              onClick={() => openConfirmDialog('reject', transaction.id, transaction.reference)}
                              disabled={actionLoading === transaction.id}
                            >
                              {actionLoading === transaction.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
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
              {confirmDialog.type === 'approve' && 'Approve Transaction'}
              {confirmDialog.type === 'reject' && 'Reject Transaction'}
              {confirmDialog.type === 'submit' && 'Submit for Approval'}
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
                  : 'gradient-primary text-primary-foreground'
              }
            >
              {confirmDialog.type === 'approve' && 'Approve'}
              {confirmDialog.type === 'reject' && 'Reject'}
              {confirmDialog.type === 'submit' && 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default TransactionList;
