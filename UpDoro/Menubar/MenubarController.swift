import AppKit
import Combine
import SwiftUI

@MainActor
final class MenubarController {
    private let store: SessionStore
    private let statusItem: NSStatusItem
    private let popover: NSPopover
    private let hostingView: NSHostingView<MenubarStatusView>
    private var cancellables: Set<AnyCancellable> = []

    init(store: SessionStore) {
        self.store = store
        self.statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)

        let view = MenubarStatusView(store: store)
        let hosting = PassthroughHostingView(rootView: view)
        hosting.translatesAutoresizingMaskIntoConstraints = false
        self.hostingView = hosting

        let popover = NSPopover()
        popover.behavior = .transient
        popover.animates = true
        popover.contentSize = NSSize(width: 300, height: 280)
        popover.contentViewController = NSHostingController(
            rootView: PopoverView(store: store)
        )
        self.popover = popover

        configureStatusItem()
        observeStateForLengthSync()
    }

    private func configureStatusItem() {
        guard let button = statusItem.button else { return }
        button.addSubview(hostingView)
        NSLayoutConstraint.activate([
            hostingView.leadingAnchor.constraint(equalTo: button.leadingAnchor),
            hostingView.trailingAnchor.constraint(equalTo: button.trailingAnchor),
            hostingView.centerYAnchor.constraint(equalTo: button.centerYAnchor),
        ])
        button.target = self
        button.action = #selector(togglePopover(_:))
    }

    private func observeStateForLengthSync() {
        // The status-item width must follow the SwiftUI content's intrinsic size,
        // since variableLength only auto-sizes from `image`/`title` — not subviews.
        Publishers.CombineLatest(store.$state, store.$mode)
            .receive(on: RunLoop.main)
            .sink { [weak self] _, _ in self?.updateStatusItemLength() }
            .store(in: &cancellables)
        updateStatusItemLength()
    }

    private func updateStatusItemLength() {
        hostingView.layoutSubtreeIfNeeded()
        let width = hostingView.fittingSize.width
        statusItem.length = max(28, width)
    }

    @objc private func togglePopover(_ sender: Any?) {
        guard let button = statusItem.button else { return }
        if popover.isShown {
            popover.performClose(sender)
        } else {
            popover.show(relativeTo: button.bounds, of: button, preferredEdge: .maxY)
            popover.contentViewController?.view.window?.makeKey()
        }
    }
}

private final class PassthroughHostingView<Content: View>: NSHostingView<Content> {
    override func hitTest(_ point: NSPoint) -> NSView? { nil }
}
