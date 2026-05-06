import AppKit
import SwiftUI

extension Color {
    static func dynamic(light: Color, dark: Color) -> Color {
        Color(nsColor: NSColor(name: nil) { appearance in
            let isDark = appearance.bestMatch(from: [.darkAqua, .vibrantDark, .accessibilityHighContrastDarkAqua, .accessibilityHighContrastVibrantDark]) != nil
            return NSColor(isDark ? dark : light)
        })
    }
}

enum AppColors {
    static let workForeground = Color.dynamic(
        light: Color(red: 0x99 / 255.0, green: 0x3C / 255.0, blue: 0x1D / 255.0),
        dark: Color(red: 0xF0 / 255.0, green: 0x99 / 255.0, blue: 0x7B / 255.0)
    )
    static let workBackground = Color(red: 216 / 255.0, green: 90 / 255.0, blue: 48 / 255.0, opacity: 0.08)

    static let restForeground = Color.dynamic(
        light: Color(red: 0x0F / 255.0, green: 0x6E / 255.0, blue: 0x56 / 255.0),
        dark: Color(red: 0x5D / 255.0, green: 0xCA / 255.0, blue: 0xA5 / 255.0)
    )
    static let restBackground = Color(red: 29 / 255.0, green: 158 / 255.0, blue: 117 / 255.0, opacity: 0.08)
}
