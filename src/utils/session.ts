import { v4 as uuidv4 } from 'uuid';

export const generateSessionId = (): string => {
  return uuidv4();
};

export const validateSessionId = (sessionId: string): boolean => {
  // UUID v4 regex pattern
  const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Pattern.test(sessionId);
}; 