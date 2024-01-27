//
//  Deeplinks.swift
//  Kagi Search
//
//  Created by Nano Anderson on 1/24/24.
//

import Foundation
#if os(macOS)
import SafariServices
#elseif os(iOS)
import UIKit
#endif

struct Deeplinks {
    
    static func handleIncomingURL(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            return
        }

        if url.scheme == "kagisearch",
           components.host == "open-app",
           let appDestinationItem = components.queryItems?.first(where: { $0.name.lowercased() == "destination" }),
           let appDestinationValue = appDestinationItem.value {
            let appOpenURL: URL?
            switch appDestinationValue {
                case "safari-extension-settings":
                    appOpenURL = URL(string: "App-Prefs:SAFARI&path=WEB_EXTENSIONS")
                    break
                case "safari-extension-settings-deep":
                    appOpenURL = URL(string: "App-Prefs:SAFARI&path=WEB_EXTENSIONS/Kagi%20for%20Safari")
                    break
                default:
                    appOpenURL = nil
                    break
            }
            if let appOpenURL = appOpenURL {
                #if os(iOS)
                UIApplication.shared.open(appOpenURL)
                #elseif os(macOS)
                SFSafariApplication.showPreferencesForExtension(withIdentifier: macExtensionBundleIdentifier) { error in
                    guard error == nil else { return }
                }
                #endif
            }
        }
    }
}
