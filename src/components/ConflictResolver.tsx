"use client";

import { ConflictResolution, SyncConflict } from "@/models/sync";

// Props del componente ConflictResolver
export interface ConflictResolverProps {
  conflict: SyncConflict;
  onResolve: (resolution: ConflictResolution) => void;
}

const ConflictResolver = ({ conflict, onResolve }: ConflictResolverProps) => {
  // Implementación específica según el tipo de conflicto
  // Aquí puedes mostrar diferentes UI según conflict.conflictType
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <p className="font-medium text-yellow-800 dark:text-yellow-200">
        {conflict.description}
      </p>
      {conflict.suggestion && (
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
          Suggestion: {conflict.suggestion}
        </p>
      )}
      {/* Aquí irían los controles específicos para resolver el conflicto */}
      <div className="mt-3">
        <button
          onClick={() => onResolve({ type: "skipTransaction" })}
          className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm"
        >
          Skip Transaction
        </button>
      </div>
    </div>
  );
};

export default ConflictResolver;
