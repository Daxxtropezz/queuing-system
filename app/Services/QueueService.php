<?php

namespace App\Services;

use App\Models\QueueTicket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Spatie\Activitylog\Models\Activity;

class QueueService
{
    public function getCurrentTicket(User $user, int $step): ?QueueTicket
    {
        return QueueTicket::where('served_by', $user->id)
            ->where('status', 'serving')
            ->where('step', $step)
            ->whereDate('created_at', now())
            ->first();
    }

    public function getNextTicket(array $filters): ?QueueTicket
    {
        return QueueTicket::where('status', $filters['status'])
            ->when(isset($filters['transaction_type_id']), fn($q) => 
                $q->where('transaction_type_id', $filters['transaction_type_id']))
            ->when(isset($filters['ispriority']), fn($q) => 
                $q->where('ispriority', $filters['ispriority']))
            ->when(isset($filters['step']), fn($q) => 
                $q->where('step', $filters['step']))
            ->whereDate('created_at', now())
            ->orderBy('id')
            ->first();
    }

    public function updateTicketStatus(QueueTicket $ticket, string $status, User $user = null): void
    {
        $oldStatus = $ticket->status;
        
        $updateData = [
            'status' => $status,
            'finished_at' => in_array($status, ['done', 'no_show']) ? now() : null,
            'started_at' => $status === 'serving' ? now() : null,
        ];
        
        if ($user && $status === 'serving') {
            $updateData['served_by'] = $user->id;
            $updateData['teller_id'] = $user->teller_id;
        }
        
        $ticket->update($updateData);
        
        $this->logTicketActivity($ticket, $user, $oldStatus, $status);
    }

    private function logTicketActivity(QueueTicket $ticket, ?User $user, string $oldStatus, string $newStatus): void
    {
        $activity = activity()->inLog('Queue Action');
        
        if ($user) {
            $activity->causedBy($user);
        }
        
        $activity->performedOn($ticket)
            ->withProperties([
                'number' => $ticket->formatted_number,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'teller_id' => $ticket->teller_id ?? null
            ])
            ->log($this->determineLogAction($oldStatus, $newStatus));
    }

    private function determineLogAction(string $oldStatus, string $newStatus): string
    {
        if ($oldStatus === 'waiting' && $newStatus === 'serving') {
            return 'grabbed_ticket';
        }
        if ($newStatus === 'done') {
            return 'completed_service';
        }
        if ($newStatus === 'no_show') {
            return 'marked_no_show';
        }
        return 'status_changed';
    }
}
