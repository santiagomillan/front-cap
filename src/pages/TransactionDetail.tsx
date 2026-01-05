import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import StatusStepper from '@/components/StatusStepper';
import { transactionApi } from '@/lib/api';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  Zap,
  Loader2,
  Calendar,
  User,
  DollarSign,
  Hash,
} from 'lucide-react';
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

const TransactionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | 'submit' | 'execute' | null;
  }>({ open: false, type: null });

  const fetchTransaction = async () => {
    if (!id) return;
    
    try {
      const data = await transactionApi.getById(id);
      setTransaction(data);
    } catch (error) {
      console.error('Failed to fetch transaction:', error);
      // Mock data for demo
      setTransaction({
        id: id,
        reference: 'TRX-001',
        amount: 5000,
        currency: 'MXN',
        status: 'PENDING_APPROVAL',
        created_by: 'user1',
        created_by_email: 'operator@test.com',
        approved_by: undefined,
        approved_by_email: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const handleAction = async (action: 'submit' | 'approve' | 'reject' | 'execute') => {
    if (!id) return;
    
    setActionLoading(true);
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
      } else if (action === 'execute') {
        await transactionApi.execute(id);
        toast({ title: 'Success', description: 'Transaction executed successfully.' });
      }
      fetchTransaction();
    } catch (error) {
      console.error(`Failed to ${action} transaction:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} transaction.`,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, type: null });
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!transaction) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">Transaction Not Found</h2>
          <p className="text-muted-foreground mb-4">The transaction you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/transactions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transactions
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground font-mono">
                  {transaction.reference}
                </h1>
                <StatusBadge status={transaction.status} size="md" />
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Transaction ID: {transaction.id}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {user?.role === 'OPERATOR' && transaction.status === 'DRAFT' && (
              <Button
                onClick={() => setConfirmDialog({ open: true, type: 'submit' })}
                className="gradient-primary text-primary-foreground"
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Submit for Approval
              </Button>
            )}

            {user?.role === 'APPROVER' && transaction.status === 'PENDING_APPROVAL' && (
              <>
                <Button
                  variant="outline"
                  className="border-status-approved text-status-approved hover:bg-status-approved-bg"
                  onClick={() => setConfirmDialog({ open: true, type: 'approve' })}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-status-rejected-bg"
                  onClick={() => setConfirmDialog({ open: true, type: 'reject' })}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Reject
                </Button>
              </>
            )}

            {transaction.status === 'APPROVED' && (
              <Button
                onClick={() => setConfirmDialog({ open: true, type: 'execute' })}
                className="bg-status-executed text-primary-foreground hover:bg-status-executed/90"
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                Execute Transaction
              </Button>
            )}
          </div>
        </div>

        {/* Status Stepper */}
        <Card className="shadow-lg animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardHeader>
            <CardTitle className="text-lg">Transaction Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusStepper currentStatus={transaction.status} />
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p className="font-mono font-medium text-foreground">{transaction.reference}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Currency</p>
                    <p className="font-medium text-foreground">{transaction.currency}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg animate-slide-up" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium text-foreground">{transaction.created_by_email || 'Unknown'}</p>
                </div>
              </div>

              {transaction.approved_by_email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-status-approved-bg">
                    <CheckCircle className="h-4 w-4 text-status-approved" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {transaction.status === 'REJECTED' ? 'Rejected By' : 'Approved By'}
                    </p>
                    <p className="font-medium text-foreground">{transaction.approved_by_email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(transaction.created_at), 'MMMM d, yyyy HH:mm:ss')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(transaction.updated_at), 'MMMM d, yyyy HH:mm:ss')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={confirmDialog.open} 
        onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === 'approve' && 'Approve Transaction'}
              {confirmDialog.type === 'reject' && 'Reject Transaction'}
              {confirmDialog.type === 'submit' && 'Submit for Approval'}
              {confirmDialog.type === 'execute' && 'Execute Transaction'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === 'approve' && `Are you sure you want to approve ${transaction.reference}?`}
              {confirmDialog.type === 'reject' && `Are you sure you want to reject ${transaction.reference}? This action cannot be undone.`}
              {confirmDialog.type === 'submit' && `Submit ${transaction.reference} for approval?`}
              {confirmDialog.type === 'execute' && `Execute ${transaction.reference}? This will process the payment of ${formatAmount(transaction.amount, transaction.currency)}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog.type && handleAction(confirmDialog.type)}
              className={
                confirmDialog.type === 'reject' 
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                  : confirmDialog.type === 'execute'
                  ? 'bg-status-executed text-primary-foreground hover:bg-status-executed/90'
                  : 'gradient-primary text-primary-foreground'
              }
            >
              {confirmDialog.type === 'approve' && 'Approve'}
              {confirmDialog.type === 'reject' && 'Reject'}
              {confirmDialog.type === 'submit' && 'Submit'}
              {confirmDialog.type === 'execute' && 'Execute'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default TransactionDetail;
