//
//  ViewController.swift
//  Shared (App)
//
//  Created by Nano Anderson on 10/17/23.
//

import WebKit

#if os(iOS)
import UIKit
typealias PlatformViewController = UIViewController
typealias KImage = UIImage
#elseif os(macOS)
import Cocoa
import SafariServices
typealias PlatformViewController = NSViewController
typealias KImage = NSImage
#endif

let appWindowFrameAutosaveName = "KagiForSafariWindowFrame"

class ViewController: PlatformViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!
    
    #if os(iOS)
    var effectView: UIVisualEffectView? = nil
    #endif

    override func viewDidLoad() {
        super.viewDidLoad()
        
        #if os(macOS)
        view.window?.setFrameAutosaveName(appWindowFrameAutosaveName)
        NotificationCenter.default.addObserver(self, selector: #selector(detectMacOSExtensionStateChange), name: NSApplication.didBecomeActiveNotification, object: nil)
        #endif

        self.webView.navigationDelegate = self
        if #available(macOS 13.3, iOS 16.4, *) {
            self.webView.isInspectable = true
        }

#if os(iOS)
        self.webView.scrollView.isScrollEnabled = true
#endif

        self.webView.configuration.userContentController.add(self, name: "controller")

        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
        
        #if os(macOS)
        addUpgradeCheckObservers()
        checkIfUpgraded()
        #endif
    }
    
    deinit {
        CFNotificationCenterRemoveEveryObserver(CFNotificationCenterGetDarwinNotifyCenter(), UnsafeRawPointer(Unmanaged.passUnretained(self).toOpaque()))
    }
#if os(iOS)
    override func viewDidAppear(_ animated: Bool) {
        addEffectViewIfNeeded()
    }
    
    override func willTransition(to newCollection: UITraitCollection, with coordinator: UIViewControllerTransitionCoordinator) {
        addEffectViewIfNeeded()
        coordinator.animate { _ in
            if let effectView = self.effectView {
                if newCollection.horizontalSizeClass == .compact {
                    effectView.frame.origin = CGPoint(x: 0, y: 0)
                    effectView.alpha = 1
                } else {
                    effectView.frame.origin = CGPoint(x: 0, y: (-1 * effectView.bounds.height))
                    effectView.alpha = 0
                }
            }
        } completion: { _ in
            self.addEffectViewIfNeeded(animated: true)
        }
        super.willTransition(to: newCollection, with: coordinator)
    }
    
    private func addEffectViewIfNeeded(animated: Bool = false) {
        guard effectView == nil else { return }
        if let statusBarFrame = view.window?.windowScene?.statusBarManager?.statusBarFrame,
           statusBarFrame.width > 0,
           statusBarFrame.height > 0 {
            effectView = UIVisualEffectView(effect: UIBlurEffect(style: .regular))
            if let effectView = effectView {
                effectView.autoresizingMask = [.flexibleWidth]
                if (animated) {
                    effectView.alpha = 0;
                    effectView.frame = statusBarFrame.offsetBy(dx: 0, dy: -(statusBarFrame.height))
                } else {
                    effectView.frame = statusBarFrame
                }
                view.addSubview(effectView)
                if (animated) {
                    UIView.animate(withDuration: 0.5) {
                        effectView.alpha = 1
                        effectView.frame = statusBarFrame
                    }
                }
            }
        }
    }
#endif

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        
        let iconDataString = KImage(named: "LargeIcon")?.pngData()?.base64EncodedString() ?? ""
        webView.evaluateJavaScript("document.getElementById('icon').setAttribute('src', 'data:image/png;base64,\(iconDataString)')")
        
#if os(iOS)
        if #available(iOS 26.2, *) {
            webView.evaluateJavaScript("show('ios')")
        } else {
            webView.evaluateJavaScript("show('ios', null, false)")
        }
#elseif os(macOS)
        webView.evaluateJavaScript("show('mac')")

        detectMacOSExtensionStateChange()
#endif
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let messageBody = message.body as? [String: Any],
            let messageAction = messageBody["action"] as? String else {
            return
        }
        
        switch messageAction {
        case "open-preferences":
            Deeplinks.openExtensionSettings { [weak self] in
                #if os(iOS)
                let alert = UIAlertController(title: "Open Safari extension settings",
                    message: "In Settings, open Apps → Safari → Extensions → Kagi for Safari. On older iOS versions, Safari is directly in Settings.",
                    preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: "OK", style: .default))
                self?.present(alert, animated: true)
                #elseif os(macOS)
                let alert = NSAlert()
                alert.messageText = "Open Safari extension settings"
                alert.informativeText = "In Safari, choose Settings → Extensions → Kagi for Safari."
                alert.runModal()
                #endif
            }
            break
        #if os(iOS)
        case "open-settings":
            Deeplinks.openSettings()
        #endif
        case "open-external-link":
            guard let urlString = messageBody["url"] as? String,
                  let url = URL(string: urlString), url.scheme == "https" else {
                return
            }
            #if os(macOS)
            NSWorkspace.shared.open(url)
            #elseif os(iOS)
            UIApplication.shared.open(url)
            #endif
            break
        default:
            break
        }
    }
    
    #if os(macOS)
    @IBAction func syncDataToSafari(_ sender: AnyObject?) {
        guard let currentEngine = Preferences.shared.engine(for: nil) else {
            return
        }
        SFSafariApplication.dispatchMessage(withName: "syncData", toExtensionWithIdentifier: Deeplinks.extensionIdentifier, userInfo: [
                "currentEngine": currentEngine.name,
                "privateSessionLink": Preferences.shared.privateSessionLink(for: nil) ?? ""
            ]) { error in

        }
    }
    @objc private func detectMacOSExtensionStateChange() {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: Deeplinks.extensionIdentifier) { [weak self] state, error in
            guard let state = state, error == nil else {
                return
            }

            DispatchQueue.main.async {
                if state.isEnabled {
                    self?.checkIfUpgraded()
                }
                self?.webView.evaluateJavaScript("show('mac', \(state.isEnabled))")
            }
        }
    }
    
    private func addUpgradeCheckObservers() {
        // Listen for updates to checks of whether the app is an upgrade or fresh install
        CFNotificationCenterAddObserver(CFNotificationCenterGetDarwinNotifyCenter(), UnsafeRawPointer(Unmanaged.passUnretained(self).toOpaque()), { _, observer, _, _, _ in
            // No-op
        }, UpgradeChecker.ResponseNotificationName as CFString, nil, .hold)
        CFNotificationCenterAddObserver(CFNotificationCenterGetDarwinNotifyCenter(), UnsafeRawPointer(Unmanaged.passUnretained(self).toOpaque()), { _, observer, _, _, _ in
            guard let observer = observer else {
                return
            }
            // Extract pointer to `self` from void pointer:
            let unmanagedSelf = Unmanaged<ViewController>.fromOpaque(observer).takeUnretainedValue()
            
            if Preferences.shared.didUpgradeFromLegacyExtension == true {
                unmanagedSelf.showUpgradeAlert()
            }
            
        }, UpgradeChecker.FirstResponseNotificationName as CFString, nil, .hold)
    }
    
    private func checkIfUpgraded(timeout: TimeInterval = 5) {
        // Check if this was an upgrade or a fresh install
        guard !Preferences.shared.checkedIfUpgradedFromLegacyExtension else {
             // Already checked, moving on
            return
        }
        Timer.scheduledTimer(withTimeInterval: timeout, repeats: false) { [weak self] timer in
            if Preferences.shared.checkedIfUpgradedFromLegacyExtension == false {
                self?.checkIfUpgraded(timeout: min(30.0, timeout + 5)) // Keep checking if this was an upgrade until the extension is available and returns an answer
            }
        }
        CFNotificationCenterPostNotification(CFNotificationCenterGetDarwinNotifyCenter(), CFNotificationName(UpgradeChecker.RequestNotificationName), nil, nil, true)
    }
    
    private func showUpgradeAlert() {
        guard let screenshotImage = NSImage(named: "PermissionsPopup") else { return }
        let alert = NSAlert()
        alert.messageText = "Upgraded Kagi Extension"
        alert.informativeText = """
            When you run your first search from the Safari location bar, you will need to re-grant permissions to the extension by clicking on the Kagi Extension icon in the Safari toolbar.
        """
        
        let screenshotImageView = NSImageView(image: screenshotImage)
        screenshotImageView.frame = NSRect(origin: screenshotImageView.frame.origin, size: CGSize(width: 400, height: 291))
        alert.accessoryView = screenshotImageView
        alert.alertStyle = .informational
        alert.addButton(withTitle: "OK")
        alert.runModal()
    }
    #endif

}

