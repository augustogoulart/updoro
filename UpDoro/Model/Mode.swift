import Foundation

struct Interval: Codable, Equatable, Hashable {
    enum Kind: String, Codable, Equatable {
        case work, rest
    }

    let kind: Kind
    let durationSeconds: Int

    init(kind: Kind, minutes: Int) {
        self.kind = kind
        self.durationSeconds = minutes * 60
    }

    init(kind: Kind, seconds: Int) {
        self.kind = kind
        self.durationSeconds = seconds
    }

    var seconds: Int { durationSeconds }

    var durationText: String {
        if durationSeconds < 60 {
            return "\(durationSeconds)s"
        }

        let hours = durationSeconds / 3600
        let minutes = (durationSeconds % 3600) / 60
        let seconds = durationSeconds % 60

        if seconds == 0 {
            if hours == 0 {
                return "\(minutes)m"
            }
            return minutes == 0 ? "\(hours)h" : "\(hours)h \(minutes)m"
        }

        if hours > 0 {
            return "\(hours)h \(minutes)m \(seconds)s"
        }

        return "\(minutes)m \(seconds)s"
    }
}

struct Mode: Codable, Identifiable, Equatable, Hashable {
    let id: String
    let name: String
    let intervals: [Interval]

    var totalSeconds: Int { intervals.reduce(0) { $0 + $1.seconds } }

    var workIntervals: [Interval] { intervals.filter { $0.kind == .work } }

    var rampDescription: String {
        workIntervals.map(\.durationText).joined(separator: " → ")
    }
}
