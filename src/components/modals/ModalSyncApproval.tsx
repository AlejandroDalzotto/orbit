import { useState } from "react";
import { Modal } from "@/components/Modal";
import {
  ConflictResolution,
  PendingSyncData,
  SyncConflict,
} from "@/models/sync";
import ConflictResolver from "@/components/ConflictResolver";

interface SyncApprovalModalProps {
  data: PendingSyncData;
  onApprove: (resolutions: Record<string, ConflictResolution>) => void;
  onReject: () => void;
}

const SyncApprovalModal = ({
  data,
  onApprove,
  onReject,
}: SyncApprovalModalProps) => {
  const [resolutions, setResolutions] = useState<
    Record<string, ConflictResolution>
  >({});
  return (
    <Modal title="Review Sync Data" maxWidth="2xl">
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="font-medium">From: {data.deviceName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.payload.transactions.length} transaction(s) to sync
          </p>
        </div>
        {data.conflicts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Conflicts to Resolve:</h4>
            {data.conflicts.map((conflict: SyncConflict, idx: number) => (
              <ConflictResolver
                key={idx}
                conflict={conflict}
                onResolve={(resolution) => {
                  setResolutions({
                    ...resolutions,
                    [conflict.transactionId]: resolution,
                  });
                }}
              />
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onReject}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Reject
          </button>
          <button
            onClick={() => onApprove(resolutions)}
            disabled={
              data.conflicts.length > 0 &&
              Object.keys(resolutions).length < data.conflicts.length
            }
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
          >
            Approve & Sync
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SyncApprovalModal;
