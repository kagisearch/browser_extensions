//
//  Preferences.swift
//  Kagi Search for Safari
//
//  Created by Nano Anderson on 10/18/23.
//

import Foundation

struct SearchSource {
    let name: String
    let host: [String]
    let queryParameter: String
    var systemIdentifier: String? = nil
    
    static let sources = [
        SearchSource(name: "All", host: [], queryParameter: ""),
        SearchSource(name: "Google", host: ["google."], queryParameter: "q", systemIdentifier: "com.google.www"),
        SearchSource(name: "Yahoo", host: ["search.yahoo.com"], queryParameter: "p", systemIdentifier: "com.yahoo.www"),
        SearchSource(name: "Bing", host: ["bing.", "bi.ng"], queryParameter: "q", systemIdentifier: "com.bing.www"),
        SearchSource(name: "DuckDuckGo", host: ["duckduckgo.com"], queryParameter: "q", systemIdentifier: "com.duckduckgo"),
        SearchSource(name: "Baidu", host: ["baidu."], queryParameter: "wd"),
        SearchSource(name: "Yandex", host: ["yandex.", "ya."], queryParameter: "text"),
        SearchSource(name: "Ecosia", host: ["ecosia.org"], queryParameter: "q", systemIdentifier: "org.ecosia.www"),
        SearchSource(name: "Brave", host: ["search.brave.com"], queryParameter: "q"),
        SearchSource(name: "Startpage", host: ["startpage.com"], queryParameter: "query"),
        SearchSource(name: "Neeva", host: ["neeva.com"], queryParameter: "q"),
        SearchSource(name: "Qwant", host: ["qwant.com"], queryParameter: "q"),
        SearchSource(name: "Sogou", host: ["sogou.com"], queryParameter: "q")
    ]
    
    static func named(_ engineName: String) -> SearchSource? {
        return Self.sources.first(where: { $0.name == engineName })
    }
    
    static func withIdentifier(_ identifier: String) -> SearchSource? {
        return Self.sources.first(where: { $0.systemIdentifier == identifier })
    }
}

/// Helper for UserDefaults preference storage.
///
/// All preferences are stored as a `[ProfileUUIDString: Object]` Dictionary.
class Preferences: NSObject {
    
    static let shared = Preferences()
    
    let defaults: UserDefaults?
    static private let NoProfileUUID = "NoProfileUUID"
    
    enum Keys: String, CaseIterable {
        case engine
        case privateSessionLink
        case checkedIfUpgradedFromLegacyExtension
        case didUpgradeFromLegacyExtension
        
        static var allRawValues = allCases.map({ $0.rawValue })
        var cfNotificationNameString: String {
            "com.kagimacOS.Kagi-Search.PreferenceUpdateNotification.\(rawValue)"
        }
        var cfNotificationName: CFNotificationName {
            CFNotificationName(cfNotificationNameString as NSString)
        }
    }
    static let PreferenceUpdatedNotificationKey = "PreferenceUpdatedNotificationKey"
    
    override init() {
        defaults = UserDefaults(suiteName: "group.kagi-search-for-safari")
        super.init()
    }
    
    func setEngine(_ engine: SearchSource, profile: UUID?) {
        var engines = defaults?.dictionary(forKey: Keys.engine.rawValue) as? [String: String] ?? [:]
        engines[uuidKey(for: profile)] = engine.name
        defaults?.set(engines, forKey: Keys.engine.rawValue)
    }
    
    /// Default engine is Safari's default (if it can be detected), or Google
    func engine(for profile: UUID?) -> SearchSource? {
        if let engines = defaults?.dictionary(forKey: Keys.engine.rawValue) as? [String: String],
           let engineName = engines[uuidKey(for: profile)],
           let engine = SearchSource.named(engineName) {
            return engine
        }
        
        // Check system for Safari's default
        if let systemProviderIdentifier = (defaults?.dictionary(forKey: "NSPreferredWebServices")?["NSWebServicesProviderWebSearch"] as? [String: Any])?["NSProviderIdentifier"] as? String {
            return SearchSource.withIdentifier(systemProviderIdentifier)
        }
        
        return SearchSource.named("Google")
    }
    
    func setPrivateSessionLink(_ link: String, profile: UUID?) {
        var links = defaults?.dictionary(forKey: Keys.privateSessionLink.rawValue) as? [String: String] ?? [:]
        links[uuidKey(for: profile)] = link
        defaults?.set(links, forKey: Keys.privateSessionLink.rawValue)
    }
    
    func privateSessionLink(for profile: UUID?) -> String? {
        if let links = defaults?.privateSessionLinkWrapper,
           let link = links[uuidKey(for: profile)] {
            return link
        }
        
        if profile == nil,
           let legacySessionlinkKey = UserDefaults.standard.string(forKey: "kagiSessionLink")?.replacingOccurrences(of: "&q=%s", with: "") {
            setPrivateSessionLink(legacySessionlinkKey, profile: nil) // Don't assign this to a specific profile, to avoid accidentally using it in a profile where the user didn't expect it to be
            CFNotificationCenterPostNotification(CFNotificationCenterGetDarwinNotifyCenter(), Keys.privateSessionLink.cfNotificationName, nil, nil, true)
            return legacySessionlinkKey
        }
        
        return nil
    }
    
    var checkedIfUpgradedFromLegacyExtension: Bool {
        get {
            defaults?.bool(forKey: Keys.checkedIfUpgradedFromLegacyExtension.rawValue) == true
        }
        set {
            defaults?.set(newValue, forKey: Keys.checkedIfUpgradedFromLegacyExtension.rawValue)
        }
    }
    
    var didUpgradeFromLegacyExtension: Bool? {
        get {
            let possibleBool = defaults?.object(forKey: Keys.didUpgradeFromLegacyExtension.rawValue)
            if let possibleBool = possibleBool as? Bool {
                return possibleBool
            } else {
                return nil
            }
        }
        set {
            defaults?.set(newValue, forKey: Keys.didUpgradeFromLegacyExtension.rawValue)
        }
    }
    
    private func uuidKey(for profile: UUID?) -> String {
        return Self.NoProfileUUID // Can't access profile info from the app, so ignoring profiles for now
//        return profile?.uuidString ?? Self.NoProfileUUID
    }
}

extension UserDefaults {
    @objc dynamic var privateSessionLinkWrapper: [String: String]? {
        dictionary(forKey: Preferences.Keys.privateSessionLink.rawValue) as? [String: String]
    }
}
