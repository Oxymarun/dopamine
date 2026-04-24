export type TaskEffort = 'tiny' | 'small' | 'med' | 'big'

export interface Task {
  id: string
  text: string
  done: boolean
  steps: { id: string; text: string; done: boolean }[]
  createdAt: number
  completedAt?: number
  effort?: TaskEffort
  pinned?: boolean
}

export interface CustomReward {
  id: string
  name: string
  cost: number
  createdAt: number
}

export interface BrainDumpItem {
  id: string
  text: string
  createdAt: number
}

export interface Session {
  id: string
  date: string
  type: 'work' | 'break'
  durationMin: number
  mood: string
}

export interface AppSettings {
  theme: 'dark'
  accentColor: string
  soundEnabled: boolean
  alwaysOnTop: boolean
  workMin: number
  breakMin: number
}

export interface RewardState {
  streak: number
  lastActiveDate: string
  totalSessions: number
  level: string
  xpSpent: number
}

const KEYS = {
  tasks: 'ff_tasks',
  sessions: 'ff_sessions',
  settings: 'ff_settings',
  rewards: 'ff_rewards',
  braindump: 'ff_braindump',
  shop: 'ff_shop',
}

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: '#7B61FF',
  soundEnabled: true,
  alwaysOnTop: false,
  workMin: 25,
  breakMin: 5,
}

const DEFAULT_REWARDS: RewardState = {
  streak: 0,
  lastActiveDate: '',
  totalSessions: 0,
  level: 'Spark',
  xpSpent: 0,
}

export const storage = {
  getTasks: (): Task[] => get(KEYS.tasks, []),
  setTasks: (tasks: Task[]) => set(KEYS.tasks, tasks),

  getSessions: (): Session[] => get(KEYS.sessions, []),
  addSession: (s: Session) => {
    const sessions = get<Session[]>(KEYS.sessions, [])
    set(KEYS.sessions, [s, ...sessions].slice(0, 200))
  },

  getSettings: (): AppSettings => ({ ...DEFAULT_SETTINGS, ...get(KEYS.settings, {}) }),
  setSettings: (s: AppSettings) => set(KEYS.settings, s),

  getRewards: (): RewardState => ({ ...DEFAULT_REWARDS, ...get(KEYS.rewards, {}) }),
  setRewards: (r: RewardState) => set(KEYS.rewards, r),

  getBrainDump: (): BrainDumpItem[] => get(KEYS.braindump, []),
  setBrainDump: (items: BrainDumpItem[]) => set(KEYS.braindump, items),

  getShop: (): CustomReward[] => get(KEYS.shop, []),
  setShop: (rewards: CustomReward[]) => set(KEYS.shop, rewards),

  exportAll: () => {
    const data: Record<string, unknown> = {}
    Object.values(KEYS).forEach(k => {
      try { data[k] = JSON.parse(localStorage.getItem(k) ?? 'null') } catch { data[k] = null }
    })
    return JSON.stringify(data, null, 2)
  },

  importAll: (json: string) => {
    const data = JSON.parse(json) as Record<string, unknown>
    Object.values(KEYS).forEach(k => {
      if (data[k] !== undefined && data[k] !== null) {
        localStorage.setItem(k, JSON.stringify(data[k]))
      }
    })
  },
}

const LEVEL_THRESHOLDS = [
  { min: 0,   label: 'Spark' },
  { min: 5,   label: 'Ember' },
  { min: 15,  label: 'Flame' },
  { min: 30,  label: 'Blaze' },
  { min: 60,  label: 'Inferno' },
  { min: 100, label: 'Nova' },
]

export function computeLevel(totalSessions: number): string {
  let label = 'Spark'
  for (const t of LEVEL_THRESHOLDS) {
    if (totalSessions >= t.min) label = t.label
  }
  return label
}

export function updateStreak(): RewardState {
  const r = storage.getRewards()
  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  let streak = r.streak
  if (r.lastActiveDate === today) {
    // already counted today
  } else if (r.lastActiveDate === yesterday) {
    streak += 1
  } else {
    streak = 1
  }

  const totalSessions = r.totalSessions + 1
  const next: RewardState = {
    streak,
    lastActiveDate: today,
    totalSessions,
    level: computeLevel(totalSessions),
    xpSpent: r.xpSpent ?? 0,
  }
  storage.setRewards(next)
  return next
}
