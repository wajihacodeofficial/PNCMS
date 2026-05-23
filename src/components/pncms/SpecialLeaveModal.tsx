import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Btn, Input, Field } from '@/components/pncms/ui-kit';
import { useCreateLeave, usePersonnel } from '@/hooks/use-api';
import { toast } from 'sonner';

interface SpecialLeaveModalProps {
  open: boolean;
  onClose: () => void;
}

export const SpecialLeaveModal = ({ open, onClose }: SpecialLeaveModalProps) => {
  const { mutate: createLeave } = useCreateLeave();
  const { data: personnel = [] } = usePersonnel();
  const [svc, setSvc] = useState('');
  const [applyAll, setApplyAll] = useState(false);

  const [title, setTitle] = useState('');
  const [givenBy, setGivenBy] = useState('');
  const [refNo, setRefNo] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      toast.error('Start and End dates are required');
      return;
    }
    const days =
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
    const payload = {
      startDate,
      endDate,
      days,
      status: 'Approved',
      title,
      givenBy,
      refNo: refNo || undefined,
    };
    if (applyAll) {
      // Bulk create for all personnel
      personnel.forEach((person: any) => {
        createLeave({ ...payload, svc: person.serviceNo }, {
          onError: (err: any) => {
            toast.error(`Failed for ${person.serviceNo}: ${err.message}`);
          },
        });
      });
      toast.success('Special/Gazetted leave applied to all personnel');
      onClose();
    } else {
      if (!svc) {
        toast.error('Service Number is required unless applying to all');
        return;
      }
      createLeave({ ...payload, svc }, {
        onSuccess: () => {
          toast.success('Special/Gazetted leave recorded');
          onClose();
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to record special leave');
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manual Special / Gazetted Leave</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Field label="Apply to All Personnel">
            <Btn variant={applyAll ? "primary" : "outline"} onClick={() => setApplyAll(!applyAll)}>{applyAll ? "All" : "Select"}</Btn>
          </Field>
          {!applyAll && (
            <Field label="Service Number" required>
              <Input value={svc} onChange={(e) => setSvc(e.target.value)} placeholder="e.g. 1042" />
            </Field>
          )}
          <Field label="Leave Title" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" />
          </Field>
          <Field label="Given By" required>
            <Input value={givenBy} onChange={(e) => setGivenBy(e.target.value)} placeholder="Issuer name" />
          </Field>
          <Field label="Reference No (optional)">
            <Input value={refNo} onChange={(e) => setRefNo(e.target.value)} placeholder="Ref #" />
          </Field>

          <Field label="Start Date" required>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field label="End Date" required>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Field>
          <Field label="Reason / Remarks">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional" />
          </Field>
        </div>
        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <DialogClose asChild>
            <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          </DialogClose>
          <Btn variant="primary" onClick={handleSubmit}>Add Leave</Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
