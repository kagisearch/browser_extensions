// Shared routing for the app home and links from the extension popup.
import Foundation
import SafariServices
#if os(iOS)
import UIKit
#endif

struct Deeplinks {
    static let extensionIdentifier: String = {
        if let directory = Bundle.main.builtInPlugInsURL,
           let urls = try? FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil),
           let extensionURL = urls.first(where: { $0.pathExtension == "appex" }),
           let identifier = Bundle(url: extensionURL)?.bundleIdentifier {
            return identifier
        }
        return "com.kagimacOS.Kagi-Search.Extension"
    }()

    static func openExtensionSettings(onFailure: @escaping () -> Void = {}) {
        #if os(iOS)
        if #available(iOS 26.2, *) {
            // SafariServices can leave the app onscreen without calling back.
            cancelSettingsFallback()
            let timer = Timer.scheduledTimer(withTimeInterval: 5, repeats: false) { _ in
                guard UIApplication.shared.applicationState == .active else { return }
                openSettings(onFailure: onFailure)
            }
            settingsFallback = timer
            SFSafariSettings.openExtensionsSettings(forIdentifiers: [extensionIdentifier]) { error in
                guard settingsFallback === timer else { return }
                cancelSettingsFallback()
                if error != nil { openSettings(onFailure: onFailure) }
            }
        } else {
            openSettings(onFailure: onFailure)
        }
        #elseif os(macOS)
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionIdentifier) { error in
            if error != nil { DispatchQueue.main.async(execute: onFailure) }
        }
        #endif
    }

    #if os(iOS)
    private static var settingsFallback: Timer?

    static func cancelSettingsFallback() {
        settingsFallback?.invalidate()
        settingsFallback = nil
    }

    static func openSettings(onFailure: @escaping () -> Void = {}) {
        cancelSettingsFallback()
        let path: String
        if #available(iOS 18, *) {
            path = "App-prefs:com.apple.mobilesafari&path=WEB_EXTENSIONS"
        } else {
            path = "App-prefs:SAFARI&path=WEB_EXTENSIONS"
        }
        guard let url = URL(string: path) else { onFailure(); return }
        UIApplication.shared.open(url, options: [:]) { opened in
            if !opened { onFailure() }
        }
    }
    #endif

    static func handleIncomingURL(_ url: URL) {
        guard url.scheme == "kagisearch", url.host == "open-app",
              let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let destination = components.queryItems?.first(where: { $0.name.lowercased() == "destination" })?.value,
              ["safari-extension-settings", "safari-extension-settings-deep"].contains(destination) else { return }
        openExtensionSettings()
    }
}
