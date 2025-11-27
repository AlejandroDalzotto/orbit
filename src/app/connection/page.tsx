"use client";

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useModal } from "@/context/modal-provider";
import { PendingSyncData } from "@/models/sync";
import SyncApprovalModal from "@/components/modals/ModalSyncApproval";
import { X } from "lucide-react";
import { SyncProgressBar } from "@/components/SyncProgressBar";

interface SyncStatus {
  running: boolean;
  activeSessions: number;
  pendingApprovals: number;
  port: number;
}

interface SyncServerInfo {
  pin: string;
  url: string;
  expiresIn: number;
}

export default function SyncServer() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [serverInfo, setServerInfo] = useState<SyncServerInfo | null>(null);
  const [pending, setPending] = useState<PendingSyncData[]>([]);
  const { open, close } = useModal();

  useEffect(() => {
    refreshStatus();
    // const interval = setInterval(refreshStatus, 2000);
    // return () => clearInterval(interval);
  }, []);

  const refreshStatus = async () => {
    try {
      const newStatus = await invoke<string>("get_sync_status");
      setStatus(JSON.parse(newStatus));

      if (status?.running) {
        const pendingData = await invoke<PendingSyncData[]>(
          "get_pending_sync_data",
        );
        setPending(pendingData);
      }
    } catch (error) {
      console.error("Failed to refresh status:", error);
    }
  };

  const startServer = async () => {
    try {
      const info = await invoke<string>("start_sync_server", { port: 8080 });
      setServerInfo(JSON.parse(info));
      await refreshStatus();
    } catch (error) {
      console.error("Failed to start server:", error);
    }
  };

  const stopServer = async () => {
    try {
      await invoke("stop_sync_server");
      setServerInfo(null);
      await refreshStatus();
    } catch (error) {
      console.error("Failed to stop server:", error);
    }
  };

  const handleServerExpired = () => {
    setServerInfo(null);
    setStatus(null);
  };

  const handlePendingData = (data: PendingSyncData) => {
    open(
      <SyncApprovalModal
        data={data}
        onApprove={async (resolutions) => {
          await invoke("approve_sync_data", {
            syncId: data.id,
            approved: true,
            resolutions,
          });
          await refreshStatus();
          close();
        }}
        onReject={async () => {
          await invoke("approve_sync_data", {
            syncId: data.id,
            approved: false,
            resolutions: {},
          });
          await refreshStatus();
          close();
        }}
      />,
    );
  };

  return (
    <div className="space-y-6">
      {status?.running && <SyncProgressBar onExpired={handleServerExpired} />}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Sync Server</h2>
          {status?.running && (
            <button
              onClick={stopServer}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Stop server"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {!status?.running ? (
          <button
            onClick={startServer}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Start Sync Server
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Server Active
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">
                  Auto-closes in 15 minutes
                </span>
              </div>

              {serverInfo && (
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border-2 border-green-200 dark:border-green-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Connection PIN
                    </p>
                    <p className="text-4xl font-mono font-bold tracking-widest text-green-600 dark:text-green-400">
                      {serverInfo.pin}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Token expires in {Math.floor(serverInfo.expiresIn / 60)}{" "}
                      minutes
                    </p>
                  </div>

                  <div className="text-sm space-y-1">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">URL:</span>{" "}
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {serverInfo.url}
                      </code>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Active Sessions
                </p>
                <p className="text-2xl font-bold">{status.activeSessions}</p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Pending Approvals
                </p>
                <p className="text-2xl font-bold">{status.pendingApprovals}</p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Port
                </p>
                <p className="text-2xl font-bold">{status.port}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Pending Sync Requests</h3>
          <div className="space-y-3">
            {pending.map((data) => (
              <div
                key={data.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => handlePendingData(data)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{data.deviceName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {data.payload.transactions.length} transaction(s)
                      {data.conflicts.length > 0 && (
                        <span className="ml-2 text-yellow-600">
                          • {data.conflicts.length} conflict(s)
                        </span>
                      )}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
