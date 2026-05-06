import Combine
import Foundation

@MainActor
final class SessionStore: ObservableObject {
    @Published private(set) var mode: Mode?
    @Published private(set) var state: SessionState = .idle
    private let alertCenter: SessionAlertCenter

    // Wall-clock anchor: Date().timeIntervalSince(intervalAnchor) is the elapsed
    // seconds in the current interval. Reset on each interval boundary; on resume,
    // shifted backwards by the frozen elapsed so the math keeps working.
    private var intervalAnchor: Date?
    private var pausedElapsed: Int = 0
    private var ticker: Timer?

    init(alertCenter: SessionAlertCenter) {
        self.alertCenter = alertCenter
    }

    func start(mode: Mode) {
        guard !mode.intervals.isEmpty else { return }
        self.mode = mode
        alertCenter.playStartSound()
        beginInterval(at: 0)
    }

    func pause() {
        guard case .running(let idx, _) = state else { return }
        let elapsed = currentElapsed()
        pausedElapsed = elapsed
        state = .paused(intervalIndex: idx, elapsedSeconds: elapsed)
        intervalAnchor = nil
        stopTicker()
    }

    func resume() {
        guard case .paused(let idx, let elapsed) = state else { return }
        if elapsed == 0 {
            alertCenter.playStartSound()
        }
        intervalAnchor = Date().addingTimeInterval(-Double(elapsed))
        state = .running(intervalIndex: idx, elapsedSeconds: elapsed)
        startTicker()
    }

    func skip() {
        guard let mode, let idx = state.intervalIndex else { return }
        let next = idx + 1
        if next >= mode.intervals.count {
            complete()
        } else {
            beginInterval(at: next)
        }
    }

    func stop() {
        complete()
    }

    var currentInterval: Interval? {
        guard let mode, let idx = state.intervalIndex,
              mode.intervals.indices.contains(idx) else { return nil }
        return mode.intervals[idx]
    }

    var remainingSeconds: Int? {
        guard let interval = currentInterval, let elapsed = state.elapsedSeconds else { return nil }
        return max(0, interval.seconds - elapsed)
    }

    var fractionElapsed: Double? {
        guard let interval = currentInterval, let elapsed = state.elapsedSeconds else { return nil }
        return min(1, max(0, Double(elapsed) / Double(max(1, interval.seconds))))
    }

    var currentIntervalNumber: Int? {
        guard let idx = state.intervalIndex else { return nil }
        return idx + 1
    }

    var totalIntervals: Int? { mode?.intervals.count }

    private func beginInterval(at index: Int) {
        guard let mode, mode.intervals.indices.contains(index) else { return }
        intervalAnchor = Date()
        pausedElapsed = 0
        state = .running(intervalIndex: index, elapsedSeconds: 0)
        startTicker()
    }

    private func prepareInterval(at index: Int) {
        guard let mode, mode.intervals.indices.contains(index) else { return }
        intervalAnchor = nil
        pausedElapsed = 0
        state = .paused(intervalIndex: index, elapsedSeconds: 0)
        stopTicker()
    }

    private func currentElapsed() -> Int {
        guard let anchor = intervalAnchor else { return pausedElapsed }
        return max(0, Int(Date().timeIntervalSince(anchor)))
    }

    private func tick() {
        guard case .running(let idx, _) = state, let interval = currentInterval else {
            stopTicker()
            return
        }
        let elapsed = currentElapsed()
        if elapsed >= interval.seconds {
            let next = idx + 1
            if let mode {
                if next >= mode.intervals.count {
                    alertCenter.notifySessionCompleted(mode: mode, completedInterval: interval)
                    complete()
                } else if mode.intervals[next].kind == .rest {
                    alertCenter.notifyIntervalCompleted(
                        mode: mode,
                        completedInterval: interval,
                        nextInterval: mode.intervals[next]
                    )
                    prepareInterval(at: next)
                } else {
                    alertCenter.notifyBreakCompletedAwaitingFocus(
                        mode: mode,
                        completedInterval: interval,
                        nextInterval: mode.intervals[next]
                    )
                    prepareInterval(at: next)
                }
            } else {
                complete()
            }
        } else if elapsed != state.elapsedSeconds {
            state = .running(intervalIndex: idx, elapsedSeconds: elapsed)
        }
    }

    private func complete() {
        mode = nil
        state = .idle
        intervalAnchor = nil
        pausedElapsed = 0
        stopTicker()
    }

    private func startTicker() {
        stopTicker()
        let timer = Timer(timeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.tick() }
        }
        timer.tolerance = 0.2
        RunLoop.main.add(timer, forMode: .common)
        ticker = timer
    }

    private func stopTicker() {
        ticker?.invalidate()
        ticker = nil
    }
}
