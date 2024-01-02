//
//  UpgradeChecker.swift
//  Kagi Search Extension macOS
//
//  Created by Nano Anderson on 11/29/23.
//

import Foundation

class UpgradeChecker {
    
    static let shared = UpgradeChecker()
    
    static let RequestNotificationName = "com.kagimacOS.Kagi-Search.Extension.UpgradeCheckRequestNotification" as CFString
    static let ResponseNotificationName = "com.kagimacOS.Kagi-Search.Extension.UpgradeCheckResponseNotification" as CFString
    static let FirstResponseNotificationName = "com.kagimacOS.Kagi-Search.Extension.UpgradeCheckFirstResponseNotification" as CFString
    
    private var backoffInterval: TimeInterval { Double(currentChecks) }
    private var currentChecks = 0
    
    /// Should only ever be called from the Extension target, not the App target
    func startObservers() {
        CFNotificationCenterAddObserver(CFNotificationCenterGetDarwinNotifyCenter(), UnsafeRawPointer(Unmanaged.passUnretained(self).toOpaque()), { _, observer, _, object, _ in
            guard let observer = observer else { return }
            let unmanagedSelf = Unmanaged<UpgradeChecker>.fromOpaque(observer).takeUnretainedValue()
            unmanagedSelf.checkForLegacyDefaults()
        }, Self.RequestNotificationName as CFString, nil, .hold)
    }
    
    deinit {
        CFNotificationCenterRemoveEveryObserver(CFNotificationCenterGetDarwinNotifyCenter(), UnsafeRawPointer(Unmanaged.passUnretained(self).toOpaque()))
    }
    
    private func checkForLegacyDefaults() {
        Timer.scheduledTimer(withTimeInterval: backoffInterval, repeats: false) { _ in
            guard Preferences.shared.checkedIfUpgradedFromLegacyExtension == false else {
                if self.currentChecks <= 1 {
                    CFNotificationCenterPostNotification(CFNotificationCenterGetDarwinNotifyCenter(), CFNotificationName(UpgradeChecker.ResponseNotificationName), nil, nil, true)
                }
                self.currentChecks -= 1
                return
            }
            let previousVersionExisted = UserDefaults.standard.object(forKey: "enableKagiSearch") != nil
            Preferences.shared.checkedIfUpgradedFromLegacyExtension = true
            Preferences.shared.didUpgradeFromLegacyExtension = previousVersionExisted
            CFNotificationCenterPostNotification(CFNotificationCenterGetDarwinNotifyCenter(), CFNotificationName(UpgradeChecker.FirstResponseNotificationName), nil, nil, true)
            self.currentChecks -= 1
        }
        currentChecks += 1
    }
}
