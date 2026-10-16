import { normalizeConfig, normalizePresentation, defaultConfig, defaultPresentation, type PresenterConfig, type PresentationState } from '../../lib/config';
import { emptySession, type SessionData } from '../../lib/session';
import { KEYS } from '../../lib/storage';
import { useSharedState } from '../../lib/sync';

function normalizeSession(raw: unknown): SessionData {
  const s = raw as SessionData;
  if (!s || s.format !== 'eureka26-session' || !Array.isArray(s.submissions)) return emptySession();
  return {
    ...emptySession(),
    ...s,
    manual: s.manual && typeof s.manual === 'object' ? s.manual : {},
    log: Array.isArray(s.log) ? s.log : [],
  };
}

export const useSession = () => useSharedState<SessionData>(KEYS.session, emptySession, normalizeSession);
export const useConfig = () => useSharedState<PresenterConfig>(KEYS.config, defaultConfig, (v) => normalizeConfig(v as Partial<PresenterConfig>));
export const usePresentation = () =>
  useSharedState<PresentationState>(KEYS.presentation, defaultPresentation, (v) => normalizePresentation(v as Partial<PresentationState>));
