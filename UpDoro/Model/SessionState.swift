import Foundation

enum SessionState: Equatable {
    case idle
    case running(intervalIndex: Int, elapsedSeconds: Int)
    case paused(intervalIndex: Int, elapsedSeconds: Int)
}

extension SessionState {
    var intervalIndex: Int? {
        switch self {
        case .idle: return nil
        case .running(let i, _), .paused(let i, _): return i
        }
    }

    var elapsedSeconds: Int? {
        switch self {
        case .idle: return nil
        case .running(_, let e), .paused(_, let e): return e
        }
    }

    var isIdle: Bool {
        if case .idle = self { return true }
        return false
    }

    var isRunning: Bool {
        if case .running = self { return true }
        return false
    }

    var isPaused: Bool {
        if case .paused = self { return true }
        return false
    }
}
