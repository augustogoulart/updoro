import SwiftUI

struct MenubarStatusView: View {
    @ObservedObject var store: SessionStore

    var body: some View {
        HStack(spacing: 4) {
            stateIcon
            if let timeText {
                Text(timeText)
                    .font(.system(size: 12, weight: .medium).monospacedDigit())
                    .foregroundStyle(foreground)
            }
        }
        .padding(.horizontal, hasLabel ? 6 : 4)
        .padding(.vertical, 2)
        .frame(height: 20)
        .background(
            RoundedRectangle(cornerRadius: 4, style: .continuous)
                .fill(background)
        )
        .padding(.horizontal, 4)
        .fixedSize()
    }

    private var hasLabel: Bool { timeText != nil }

    private var kind: Interval.Kind? { store.currentInterval?.kind }

    @ViewBuilder
    private var stateIcon: some View {
        if store.state.isPaused {
            Image(systemName: "pause.fill")
                .font(.system(size: 9, weight: .semibold))
                .foregroundStyle(foreground)
                .frame(width: 12, height: 12)
        } else if store.state.isRunning, let fraction = store.fractionElapsed {
            ZStack {
                Circle()
                    .stroke(foreground.opacity(0.25), lineWidth: 1.5)
                Circle()
                    .trim(from: 0, to: fraction)
                    .stroke(foreground, style: StrokeStyle(lineWidth: 1.5, lineCap: .round))
                    .rotationEffect(.degrees(-90))
            }
            .frame(width: 12, height: 12)
        } else {
            Circle()
                .stroke(foreground.opacity(0.6), lineWidth: 1.2)
                .frame(width: 12, height: 12)
        }
    }

    private var timeText: String? {
        guard let remaining = store.remainingSeconds else { return nil }
        return TimeFormatter.menubar(seconds: remaining)
    }

    private var foreground: Color {
        if store.state.isPaused { return Color(nsColor: .tertiaryLabelColor) }
        switch kind {
        case .work: return AppColors.workForeground
        case .rest: return AppColors.restForeground
        case .none: return Color(nsColor: .secondaryLabelColor)
        }
    }

    private var background: Color {
        if store.state.isPaused { return Color.secondary.opacity(0.12) }
        switch kind {
        case .work: return AppColors.workBackground
        case .rest: return AppColors.restBackground
        case .none: return .clear
        }
    }
}
