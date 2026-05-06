import AppKit
import SwiftUI

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    private let alertCenter = SessionAlertCenter()
    private lazy var store = SessionStore(alertCenter: alertCenter)
    private var menubar: MenubarController?

    func applicationDidFinishLaunching(_ notification: Notification) {
        alertCenter.requestAuthorization()
        menubar = MenubarController(store: store)
    }
}
