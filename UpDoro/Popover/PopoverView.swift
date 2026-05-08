import SwiftUI

struct PopoverView: View {
    @ObservedObject var store: SessionStore

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            timerPanel
            modeList
        }
        .padding(18)
        .frame(width: 360, alignment: .leading)
        .background(
            LinearGradient(
                colors: [
                    Color(nsColor: .windowBackgroundColor),
                    accentBackground.opacity(0.18)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }

    private var timerPanel: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(timerText)
                .font(.system(size: 56, weight: .medium, design: .rounded).monospacedDigit())

            HStack {
                Spacer()
            }

            VStack(spacing: 8) {
                if store.state.isIdle {
                    Button("Start Focus") {
                        if let firstMode = BuiltInModes.all.first {
                            store.start(mode: firstMode)
                        }
                    }
                    .buttonStyle(.borderedProminent)
                } else {
                    if let n = store.currentIntervalNumber, let total = store.totalIntervals {
                        Label("Step \(n) of \(total)", systemImage: "point.topleft.down.curvedto.point.bottomright.up.fill")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Button(primaryButtonTitle) {
                            store.state.isPaused ? store.resume() : store.pause()
                        }
                        .buttonStyle(.borderedProminent)
                        Button("Skip") { store.skip() }
                        Button("Stop") { store.stop() }
                    }
                }
            }
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            accentBackground.opacity(0.95),
                            accentBackground.opacity(0.35)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .strokeBorder(accentForeground.opacity(0.12), lineWidth: 1)
        )
    }

    private var modeList: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Modes")
                .font(.system(size: 13, weight: .bold, design: .rounded))
                .foregroundStyle(.secondary)

            ForEach(BuiltInModes.all) { mode in
                modeRow(for: mode)
            }
        }
    }

    private func modeRow(for mode: Mode) -> some View {
        let isActive = store.mode?.id == mode.id && !store.state.isIdle

        return HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(mode.name)
                        .font(.system(size: 15, weight: .semibold, design: .rounded))
                    if isActive {
                        Text("ACTIVE")
                            .font(.caption2.weight(.bold))
                            .tracking(1)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 6)
                            .background(
                                Capsule(style: .continuous)
                                    .fill(accentBackground)
                            )
                            .foregroundStyle(accentForeground)
                    }
                }

                Text("\(mode.rampDescription) focus ramp")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Text(totalLabel(for: mode))
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            if isActive {
                Button("Restart") { store.start(mode: mode) }
                    .controlSize(.small)
            } else {
                Button(store.state.isIdle ? "Start" : "Switch") { store.start(mode: mode) }
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(isActive ? accentBackground.opacity(0.7) : Color(nsColor: .controlBackgroundColor).opacity(0.65))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(isActive ? accentForeground.opacity(0.22) : Color.black.opacity(0.05), lineWidth: 1)
        )
    }

    private var accentForeground: Color {
        if store.state.isPaused { return Color(nsColor: .secondaryLabelColor) }
        switch store.currentInterval?.kind {
        case .work: return AppColors.workForeground
        case .rest: return AppColors.restForeground
        case .none: return AppColors.workForeground
        }
    }

    private var accentBackground: Color {
        if store.state.isPaused { return Color.secondary.opacity(0.14) }
        switch store.currentInterval?.kind {
        case .work: return AppColors.workBackground
        case .rest: return AppColors.restBackground
        case .none: return AppColors.workBackground
        }
    }

    private var timerText: String {
        guard let remaining = store.remainingSeconds else { return "00:00" }
        return TimeFormatter.popoverCountdown(seconds: remaining)
    }

    private var detailText: String {
        guard let interval = store.currentInterval else {
            return "Choose a ramp and start immediately."
        }
        return "\(interval.durationText) \(interval.kind == .work ? "focus block" : "recovery block")"
    }

    private var iconName: String {
        if isWaitingToStartInterval { return "play.fill" }
        if store.state.isPaused { return "pause.fill" }
        switch store.currentInterval?.kind {
        case .work: return "bolt.fill"
        case .rest: return "leaf.fill"
        case .none: return "timer"
        }
    }

    private var primaryButtonTitle: String {
        isWaitingToStartInterval ? "Play" : (store.state.isPaused ? "Resume" : "Pause")
    }

    private var pausedStatusText: String {
        isWaitingToStartInterval ? waitingStatusText : "Paused"
    }

    private var isWaitingToStartInterval: Bool {
        store.state.isPaused && store.state.elapsedSeconds == 0
    }

    private var waitingStatusText: String {
        switch store.currentInterval?.kind {
        case .work:
            return "Ready for focus"
        case .rest:
            return "Ready for break"
        case .none:
            return "Ready"
        }
    }

    private func totalLabel(for mode: Mode) -> String {
        let total = mode.totalSeconds
        if total < 60 { return "\(total)s total" }
        if total < 3600 { return "\(total / 60)m total" }
        let h = total / 3600
        let m = (total % 3600) / 60
        return m == 0 ? "\(h)h total" : "\(h)h \(m)m total"
    }
}
