//
//  ViewController.swift
//  Kagi Search
//

import Cocoa
import SafariServices
import WebKit

let extensionBundleIdentifier = "com.kagimacOS.Kagi-Search.Extension"

extension Notification.Name {
    static let AppleInterfaceThemeChangedNotification = Notification.Name("AppleInterfaceThemeChangedNotification")
}

class ViewController: NSViewController, WKNavigationDelegate, WKScriptMessageHandler {
    
    enum InterfaceStyle: String {
        case Dark, Light
        
        init() {
            if #available(OSX 10.14, *) {
                self = NSApp.effectiveAppearance.name == .darkAqua ? .Dark : .Light
                
            } else {
                let type = UserDefaults.standard.string(forKey: "AppleInterfaceStyle") ?? "Light"
                self = InterfaceStyle(rawValue: type)!
            }
        }
    }
    
    @IBOutlet var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        self.webView.navigationDelegate = self
        self.webView.configuration.userContentController.add(self, name: "controller")
        self.webView.loadFileURL(Bundle.main.url(forResource: "Main", withExtension: "html")!, allowingReadAccessTo: Bundle.main.resourceURL!)
        
        DistributedNotificationCenter.default.addObserver(
            self,
            selector: #selector(interfaceModeChanged),
            name: .AppleInterfaceThemeChangedNotification,
            object: nil
        )
    }
    
    @objc
    private func interfaceModeChanged() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            self.webView.evaluateJavaScript("updateEnableImage(\(InterfaceStyle() == .Dark));")
        }
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                return
            }
            
            DispatchQueue.main.async {
                webView.evaluateJavaScript("""
                    show(\(state.isEnabled));
                    updateEnableImage(\(InterfaceStyle() == .Dark));
                """)
            }
        }
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if (message.body as! String != "open-preferences") {
            return;
        }
        
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { _ in }
    }
    
    
}
