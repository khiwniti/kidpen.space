/**
 * Agents Module
 * 
 * Agent management functionality
 */

export * from './api';
export * from './hooks';

export { agentKeys, useAgents, useAgent, useCreateAgent, useUpdateAgent, useDeleteAgent } from './hooks';

/**
 * Check if an agent is the default Kidpen/SUNA agent
 * Uses metadata and name checks - no hardcoded IDs
 */
export const isKidpenDefaultAgent = (agent?: { 
  agent_id?: string; 
  name?: string; 
  metadata?: { is_kidpen_default?: boolean } 
} | null): boolean => {
  if (!agent) return false;
  
  // Check metadata first (most reliable)
  if (agent.metadata?.is_kidpen_default) return true;
  
  // Fallback to name checks
  const name = agent.name?.toLowerCase();
  return name === 'kidpen' ||
         name === 'suna' ||
         name === 'superworker' ||
         name === 'kidpen super worker';
};

/**
 * Check if an agent ID represents the default Kidpen agent
 * For cases where we only have an ID and need to check against a list of agents
 */
export const isKidpenDefaultAgentId = (
  agentId: string | null | undefined, 
  agents: Array<{ agent_id?: string; name?: string; metadata?: { is_kidpen_default?: boolean } }>
): boolean => {
  if (!agentId) return true; // No agent ID = default Kidpen
  const agent = agents.find(a => a.agent_id === agentId);
  return isKidpenDefaultAgent(agent);
};

