type Variant = 'focus' | 'break'

interface TimeSlot {
  timer: number
  type: Variant
}

export interface TimeSchedule {
  [key: number]: TimeSlot
}

export type StateSetter<T> = (value: T | ((prev: T) => T)) => void

export interface TimerState {
  hasFinished: boolean
  setHasFinished: StateSetter<boolean>
  setCurrentTimer: StateSetter<number>
  currentTimer: number
}

export interface PomodoroTimer {
  time: { timer: number; type: 'focus' | 'break' }
  timerState: TimerState
}
