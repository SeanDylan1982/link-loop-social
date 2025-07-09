import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string, details: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ open, onOpenChange, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const reportReasons = [
    'Spam or unwanted content',
    'Harassment or bullying',
    'Hate speech or discrimination',
    'Violence or threats',
    'Nudity or sexual content',
    'Misinformation',
    'Copyright infringement',
    'Other'
  ];

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit(reason, details);
    setReason('');
    setDetails('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Why are you reporting this post?</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="mt-2">
              {reportReasons.map((reportReason) => (
                <div key={reportReason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reportReason} id={reportReason} />
                  <Label htmlFor={reportReason} className="text-sm">{reportReason}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Additional details (optional)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more context about why you're reporting this post..."
              rows={3}
              className="mt-2"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!reason} variant="destructive">
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};