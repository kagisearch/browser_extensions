//
//  SafariWebExtensionHandler.swift
//  Shared (Extension)
//
//  Created by Nano Anderson on 10/17/23.
//

import SafariServices
import os.log

#if os(macOS)
typealias ResponderObject = NSObject
#elseif os(iOS)
typealias ResponderObject = UIResponder
#endif

class SafariWebExtensionHandler: ResponderObject, NSExtensionRequestHandling {
    
    #if os(macOS)
    private static let appURL = NSWorkspace.shared.urlForApplication(withBundleIdentifier: "com.kagimacOS.Kagi-Search")
    #elseif os(iOS)
    private static let appURL = URL(string: "kagisearch://")
    #endif
    
    override init() {
        super.init()
        #if os(macOS)
        UpgradeChecker.shared.startObservers()
        #endif
    }

    func beginRequest(with context: NSExtensionContext) {
        let request = context.inputItems.first as? NSExtensionItem

        let profile: UUID?
        if #available(iOS 17.0, macOS 14.0, *) {
            profile = request?.userInfo?[SFExtensionProfileKey] as? UUID
        } else {
            profile = request?.userInfo?["profile"] as? UUID
        }

        let message: Any?
        if #available(iOS 17.0, macOS 14.0, *) {
            message = request?.userInfo?[SFExtensionMessageKey]
        } else {
            message = request?.userInfo?["message"]
        }

        os_log(.default, "Received message from browser.runtime.sendNativeMessage: %@ (profile: %@)", String(describing: message), profile?.uuidString ?? "none")
        
        guard let messageDict = message as? [String: Any],
              let messageType = messageDict["type"] as? String,
              let currentEngine = Preferences.shared.engine(for: profile) else {
            return
        }

        let response = NSExtensionItem()
        var responseData = ["type": "undefined"]
        
        switch messageType {
        case "privateSessionLink":
            if let privateSessionLink = Preferences.shared.privateSessionLink(for: profile) {
                responseData["type"] = "privateSessionUpdated"
                responseData["privateSessionLink"] = privateSessionLink
            }
            break
        case "currentEngine":
            responseData["type"] = "engineChanged"
            responseData["currentEngine"] = currentEngine.name
        case "openApp":
            if let appURL = Self.appURL {
                openAppURL(appURL, context: context)
                responseData["type"] = "openAppSuccess"
            } else {
                responseData["type"] = "openAppFailure"
                responseData["errorMessage"] = "Kagi app not found"
            }
            break
        case "migratePrivateSessionLink":
                if let previousPrivateSessionLink = messageDict["privateSessionLink"] as? String {
                    Preferences.shared.setPrivateSessionLink(previousPrivateSessionLink, profile: nil)
                }
            break
        default:
            break
        }
        response.userInfo = [ SFExtensionMessageKey: responseData ]

        context.completeRequest(returningItems: [ response ], completionHandler: nil)
    }

    @objc func openURL(_ url: URL) {
        return
    }

    func openAppURL(_ url: URL, context: NSExtensionContext? = nil) {
        #if os(macOS)
        if #available(macOSApplicationExtension 10.15, *) {
            NSWorkspace.shared.openApplication(at: url, configuration: .init(), completionHandler: { runningApp, error in
                
            })
        } else {
            NSWorkspace.shared.launchApplication("Kagi Search for Safari")
            // Fallback on earlier versions
        }
        #elseif os(iOS)
        let selector = #selector(NSExtensionContext.open(_:completionHandler:))
//        var responder: ResponderObject? = self
//        let selector = #selector(SafariWebExtensionHandler.openURL(_:))
        if context?.responds(to: selector) == true {
//            context?.perform(selector, with: url)
            context?.open(url)
        }

//        while responder != nil {
////            if responder!.responds(to: selector) && responder != self {
//            if responder!.responds(to: selector) {
//                responder!.perform(selector, with: url)
//                return
//            }
//            responder = responder?.next
//        }
        #endif
        
    }
}
