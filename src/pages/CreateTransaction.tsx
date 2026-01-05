import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { transactionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const currencies = [
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().min(1, 'Please select a currency'),
});

const CreateTransaction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('MXN');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; currency?: string }>({});
  const [createdTransaction, setCreatedTransaction] = useState<{ id: string; reference: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const numAmount = parseFloat(amount);
    const result = transactionSchema.safeParse({ amount: numAmount, currency });
    
    if (!result.success) {
      const fieldErrors: { amount?: string; currency?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'amount') fieldErrors.amount = err.message;
        if (err.path[0] === 'currency') fieldErrors.currency = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const transaction = await transactionApi.create({
        amount: numAmount,
        currency,
      });
      
      setCreatedTransaction({
        id: transaction.id,
        reference: transaction.reference,
      });
      
      toast({
        title: 'Transaction Created',
        description: `Transaction ${transaction.reference} has been created successfully.`,
      });
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to create transaction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(num);
  };

  if (createdTransaction) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg animate-scale-in">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-status-approved-bg">
                <CheckCircle className="h-8 w-8 text-status-approved" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Transaction Created!
              </h2>
              <p className="text-muted-foreground mb-6">
                Reference: <span className="font-mono font-medium text-foreground">{createdTransaction.reference}</span>
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreatedTransaction(null);
                    setAmount('');
                  }}
                >
                  Create Another
                </Button>
                <Button
                  onClick={() => navigate(`/transactions/${createdTransaction.id}`)}
                  className="gradient-primary text-primary-foreground"
                >
                  View Transaction
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground">Create Transaction</h1>
          <p className="text-muted-foreground mt-1">
            Create a new transaction for approval
          </p>
        </div>

        <Card className="shadow-lg animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              Enter the amount and currency for the new transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`text-lg ${errors.amount ? 'border-destructive' : ''}`}
                    disabled={isLoading}
                  />
                  {amount && (
                    <p className="absolute -bottom-5 left-0 text-xs text-muted-foreground">
                      {formatAmount(amount)}
                    </p>
                  )}
                </div>
                {errors.amount && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={currency}
                  onValueChange={setCurrency}
                  disabled={isLoading}
                >
                  <SelectTrigger className={errors.currency ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.currency}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground font-medium h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Transaction'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreateTransaction;
