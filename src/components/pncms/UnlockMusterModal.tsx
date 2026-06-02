import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Btn, Input, Field } from '@/components/pncms/ui-kit';
import { toast } from 'sonner';

interface UnlockMusterModalProps {
  open: boolean;
  date: string;
  onClose: () => void;
  onUnlocked?: () => void;
}

export const UnlockMusterModal = ({ open, date, onClose, onUnlocked }: UnlockMusterModalProps) => {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!date) {
      toast.error('No date provided');
      return;
    }
    setLoading(true);
    try {
      // Assuming ipc bridge is available globally
      await (window as any).ipc?.invoke('unlock-muster', { date, username, password });
      toast.success('Muster unlocked');
      onClose();
      onUnlocked?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to unlock muster');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unlock Muster for {date}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
<Field label="Admin Username" required>
  <Input
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    placeholder="Enter admin username"
  />
</Field>
<Field label="Admin Password" required>
  <Input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter admin password"
  />
</Field>
        </div>
        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <DialogClose asChild>
            <Btn variant="outline" onClick={onClose} disabled={loading}>Cancel</Btn>
          </DialogClose>
          <Btn variant="primary" onClick={handleUnlock} disabled={loading}>Unlock</Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
