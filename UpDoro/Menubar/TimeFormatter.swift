import Foundation

enum TimeFormatter {
    static func menubar(seconds: Int) -> String {
        let s = max(0, seconds)
        if s < 3600 {
            return String(format: "%d:%02d", s / 60, s % 60)
        }
        return String(format: "%d:%02dh", s / 3600, (s % 3600) / 60)
    }

    static func popoverCountdown(seconds: Int) -> String {
        let s = max(0, seconds)
        if s < 3600 {
            return String(format: "%d:%02d", s / 60, s % 60)
        }
        return String(format: "%d:%02d:%02d", s / 3600, (s % 3600) / 60, s % 60)
    }
}
