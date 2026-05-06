import Foundation

enum BuiltInModes {
    static let all: [Mode] = [thirtyMinute, sixtyMinute, twoHour, fourHourTimesTwo, test]

    static let thirtyMinute = Mode(
        id: "builtin.30m",
        name: "30m",
        intervals: ramp(work: [5, 15, 30])
    )

    static let sixtyMinute = Mode(
        id: "builtin.60m",
        name: "60m",
        intervals: ramp(work: [5, 15, 30, 60])
    )

    static let twoHour = Mode(
        id: "builtin.2h",
        name: "2h",
        intervals: ramp(work: [5, 15, 30, 60, 120])
    )

    static let fourHourTimesTwo = Mode(
        id: "builtin.4hx2",
        name: "4h ×2",
        intervals: ramp(work: [5, 15, 30, 60, 120, 240, 240])
    )

    static let test = Mode(
        id: "builtin.test",
        name: "Test",
        intervals: [
            Interval(kind: .work, seconds: 5),
            Interval(kind: .rest, seconds: 5),
            Interval(kind: .work, seconds: 5),
            Interval(kind: .rest, seconds: 5),
        ]
    )

    static func mode(withId id: String) -> Mode? {
        all.first { $0.id == id }
    }

    private static func ramp(work: [Int]) -> [Interval] {
        var intervals: [Interval] = []
        for (i, minutes) in work.enumerated() {
            if i > 0 {
                intervals.append(Interval(kind: .rest, minutes: restAfter(work[i - 1])))
            }
            intervals.append(Interval(kind: .work, minutes: minutes))
        }
        return intervals
    }

    private static func restAfter(_ workMinutes: Int) -> Int {
        switch workMinutes {
        case ..<60: return 5
        case 60: return 10
        case 120: return 20
        default: return 30
        }
    }
}
