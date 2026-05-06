import AppKit
import Foundation
import UserNotifications

@MainActor
final class SessionAlertCenter {
    private let startAlertNames = ["Pop"]
    private let relaxAlertNames = ["Glass"]
    private let focusReadyFirstAlertNames = ["Tink"]
    private let focusReadySecondAlertNames = ["Pop"]

    func requestAuthorization() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { _, _ in }
    }

    func playStartSound() {
        playAudibleAlert(soundNames: startAlertNames)
    }

    func notifyIntervalCompleted(mode: Mode, completedInterval: Interval, nextInterval: Interval) {
        let content = UNMutableNotificationContent()
        content.title = completedInterval.kind == .work ? "Focus block complete" : "Break complete"
        content.body = "\(mode.name): \(completedInterval.durationText) \(label(for: completedInterval)) finished. Up next: \(nextInterval.durationText) \(label(for: nextInterval))."

        send(content, soundNames: relaxAlertNames)
    }

    func notifyBreakCompletedAwaitingFocus(mode: Mode, completedInterval: Interval, nextInterval: Interval) {
        let content = UNMutableNotificationContent()
        content.title = "Break complete"
        content.body = "\(mode.name): \(completedInterval.durationText) break finished. Click Play to start your next \(nextInterval.durationText) focus session."

        playFocusReadyAlert()
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        UNUserNotificationCenter.current().add(request)
    }

    func notifySessionCompleted(mode: Mode, completedInterval: Interval) {
        let content = UNMutableNotificationContent()
        content.title = "Mode complete"
        content.body = "\(mode.name): your final \(completedInterval.durationText) \(label(for: completedInterval)) finished."

        send(content, soundNames: relaxAlertNames)
    }

    private func send(_ content: UNMutableNotificationContent, soundNames: [String]) {
        playAudibleAlert(soundNames: soundNames)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: nil)
        UNUserNotificationCenter.current().add(request)
    }

    private func playAudibleAlert(soundNames: [String]) {
        guard !soundNames.isEmpty else { return }

        for soundName in soundNames {
            if let sound = NSSound(named: NSSound.Name(soundName)) {
                sound.play()
                return
            }
        }

        NSSound.beep()
    }

    private func playFocusReadyAlert() {
        playAudibleAlert(soundNames: focusReadyFirstAlertNames)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.22) { [weak self] in
            self?.playAudibleAlert(soundNames: self?.focusReadySecondAlertNames ?? [])
        }
    }

    private func label(for interval: Interval) -> String {
        interval.kind == .work ? "focus session" : "break"
    }
}
