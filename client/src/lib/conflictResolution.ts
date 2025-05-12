import { Inspection, Evidence } from '@shared/schema';

/**
 * Types of conflicts that can occur during synchronization
 */
export enum ConflictType {
  VERSION_MISMATCH = 'version_mismatch',
  DELETED_LOCALLY = 'deleted_locally',
  DELETED_REMOTELY = 'deleted_remotely',
  CONCURRENT_EDITS = 'concurrent_edits',
  FIELD_CONFLICT = 'field_conflict'
}

/**
 * Resolution strategies for conflicts
 */
export enum ResolutionStrategy {
  USE_LOCAL = 'use_local',
  USE_REMOTE = 'use_remote',
  MERGE = 'merge',
  MANUAL = 'manual'
}

/**
 * Represents a conflict between local and remote versions of an entity
 */
export interface Conflict<T> {
  type: ConflictType;
  entityId: number;
  entityType: string;
  localVersion: T;
  remoteVersion: T;
  conflictingFields?: string[];
  lastSyncedAt?: Date;
}

/**
 * Represents a resolution for a conflict
 */
export interface ConflictResolution<T> {
  conflict: Conflict<T>;
  strategy: ResolutionStrategy;
  resolvedEntity: T;
  manualFieldResolutions?: Record<string, 'local' | 'remote'>;
}

/**
 * Detects conflicts between local and remote versions of an entity
 * @param localEntity Local version of the entity
 * @param remoteEntity Remote version of the entity
 * @param entityType Type of the entity (e.g., 'inspection', 'evidence')
 * @param lastSyncedAt Timestamp of the last successful sync
 * @returns Conflict object if a conflict is detected, null otherwise
 */
export function detectConflict<T extends { id: number; updatedAt?: Date }>(
  localEntity: T,
  remoteEntity: T,
  entityType: string,
  lastSyncedAt?: Date
): Conflict<T> | null {
  // If either entity doesn't exist, there's no conflict
  if (!localEntity || !remoteEntity) {
    return null;
  }
  
  // Check if the entities have the same ID
  if (localEntity.id !== remoteEntity.id) {
    throw new Error('Cannot compare entities with different IDs');
  }
  
  // Check for version mismatch based on updatedAt timestamps
  if (localEntity.updatedAt && remoteEntity.updatedAt) {
    const localUpdatedAt = new Date(localEntity.updatedAt);
    const remoteUpdatedAt = new Date(remoteEntity.updatedAt);
    
    // If local is newer than remote, no conflict (local changes will overwrite remote)
    if (localUpdatedAt > remoteUpdatedAt) {
      return null;
    }
    
    // If remote is newer than local and local hasn't been modified since last sync, no conflict
    if (remoteUpdatedAt > localUpdatedAt && lastSyncedAt && localUpdatedAt <= lastSyncedAt) {
      return null;
    }
    
    // If both have been modified since last sync, we have a conflict
    if (lastSyncedAt && localUpdatedAt > lastSyncedAt && remoteUpdatedAt > lastSyncedAt) {
      // Find conflicting fields
      const conflictingFields = findConflictingFields(localEntity, remoteEntity);
      
      if (conflictingFields.length > 0) {
        return {
          type: ConflictType.CONCURRENT_EDITS,
          entityId: localEntity.id,
          entityType,
          localVersion: localEntity,
          remoteVersion: remoteEntity,
          conflictingFields,
          lastSyncedAt
        };
      }
    }
  }
  
  return null;
}

/**
 * Finds fields that have different values between local and remote entities
 * @param localEntity Local version of the entity
 * @param remoteEntity Remote version of the entity
 * @returns Array of field names that have conflicts
 */
function findConflictingFields<T>(localEntity: T, remoteEntity: T): string[] {
  const conflictingFields: string[] = [];
  
  // Compare all fields except id, createdAt, and updatedAt
  for (const key in localEntity) {
    if (
      key !== 'id' &&
      key !== 'createdAt' &&
      key !== 'updatedAt' &&
      JSON.stringify(localEntity[key]) !== JSON.stringify(remoteEntity[key])
    ) {
      conflictingFields.push(key);
    }
  }
  
  return conflictingFields;
}

/**
 * Resolves a conflict using the specified strategy
 * @param conflict The conflict to resolve
 * @param strategy The resolution strategy to use
 * @param manualFieldResolutions For MANUAL strategy, specifies which version to use for each field
 * @returns Resolved entity
 */
export function resolveConflict<T>(
  conflict: Conflict<T>,
  strategy: ResolutionStrategy,
  manualFieldResolutions?: Record<string, 'local' | 'remote'>
): ConflictResolution<T> {
  let resolvedEntity: T;
  
  switch (strategy) {
    case ResolutionStrategy.USE_LOCAL:
      resolvedEntity = { ...conflict.localVersion };
      break;
      
    case ResolutionStrategy.USE_REMOTE:
      resolvedEntity = { ...conflict.remoteVersion };
      break;
      
    case ResolutionStrategy.MERGE:
      // For merge strategy, we take the remote version as base and apply non-conflicting local changes
      resolvedEntity = { ...conflict.remoteVersion };
      
      // For each field in local that's different from the last synced version but not in conflict,
      // use the local value
      if (conflict.conflictingFields) {
        for (const key in conflict.localVersion) {
          if (
            key !== 'id' &&
            key !== 'createdAt' &&
            key !== 'updatedAt' &&
            !conflict.conflictingFields.includes(key) &&
            JSON.stringify(conflict.localVersion[key]) !== JSON.stringify(conflict.remoteVersion[key])
          ) {
            resolvedEntity[key] = conflict.localVersion[key];
          }
        }
      }
      break;
      
    case ResolutionStrategy.MANUAL:
      // For manual resolution, we need field-by-field decisions
      if (!manualFieldResolutions) {
        throw new Error('Manual field resolutions required for MANUAL strategy');
      }
      
      resolvedEntity = { ...conflict.remoteVersion }; // Start with remote as base
      
      // Apply manual resolutions
      if (conflict.conflictingFields) {
        for (const field of conflict.conflictingFields) {
          const resolution = manualFieldResolutions[field];
          if (resolution === 'local') {
            resolvedEntity[field] = conflict.localVersion[field];
          }
          // For 'remote', we already have the remote value
        }
      }
      break;
      
    default:
      throw new Error(`Unknown resolution strategy: ${strategy}`);
  }
  
  return {
    conflict,
    strategy,
    resolvedEntity,
    manualFieldResolutions
  };
}

/**
 * Detects conflicts in a batch of entities
 * @param localEntities Array of local entities
 * @param remoteEntities Array of remote entities
 * @param entityType Type of the entities
 * @param lastSyncedAt Timestamp of the last successful sync
 * @returns Array of detected conflicts
 */
export function detectConflicts<T extends { id: number; updatedAt?: Date }>(
  localEntities: T[],
  remoteEntities: T[],
  entityType: string,
  lastSyncedAt?: Date
): Conflict<T>[] {
  const conflicts: Conflict<T>[] = [];
  
  // Create maps for faster lookup
  const localMap = new Map(localEntities.map(entity => [entity.id, entity]));
  const remoteMap = new Map(remoteEntities.map(entity => [entity.id, entity]));
  
  // Check each local entity against its remote counterpart
  for (const [id, localEntity] of localMap.entries()) {
    const remoteEntity = remoteMap.get(id);
    
    if (remoteEntity) {
      const conflict = detectConflict(localEntity, remoteEntity, entityType, lastSyncedAt);
      if (conflict) {
        conflicts.push(conflict);
      }
    }
  }
  
  return conflicts;
}

/**
 * Shows a conflict resolution UI to the user
 * @param conflict The conflict to resolve
 * @returns Promise that resolves to a conflict resolution
 */
export async function showConflictResolutionUI<T>(conflict: Conflict<T>): Promise<ConflictResolution<T>> {
  // This is a placeholder for a real UI implementation
  // In a real app, you would show a modal dialog with options for resolving the conflict
  
  // For now, we'll just log the conflict and use a default strategy
  console.log('Conflict detected:', conflict);
  
  // Default to merge strategy
  return resolveConflict(conflict, ResolutionStrategy.MERGE);
}

/**
 * Handles conflicts during synchronization
 * @param localEntities Array of local entities
 * @param remoteEntities Array of remote entities
 * @param entityType Type of the entities
 * @param lastSyncedAt Timestamp of the last successful sync
 * @returns Promise that resolves to an array of resolved entities
 */
export async function handleSyncConflicts<T extends { id: number; updatedAt?: Date }>(
  localEntities: T[],
  remoteEntities: T[],
  entityType: string,
  lastSyncedAt?: Date
): Promise<T[]> {
  // Detect conflicts
  const conflicts = detectConflicts(localEntities, remoteEntities, entityType, lastSyncedAt);
  
  if (conflicts.length === 0) {
    return localEntities; // No conflicts, return local entities unchanged
  }
  
  // Resolve each conflict
  const resolutions: ConflictResolution<T>[] = [];
  
  for (const conflict of conflicts) {
    // In a real app, you would show a UI for each conflict
    // For now, we'll use a default strategy
    const resolution = await showConflictResolutionUI(conflict);
    resolutions.push(resolution);
  }
  
  // Apply resolutions to the local entities
  const resolvedEntities = [...localEntities];
  
  for (const resolution of resolutions) {
    const index = resolvedEntities.findIndex(entity => entity.id === resolution.conflict.entityId);
    if (index !== -1) {
      resolvedEntities[index] = resolution.resolvedEntity;
    }
  }
  
  return resolvedEntities;
}