//
//  SafariExtensionViewController.swift
//  Kagi Search Extension
//

import SafariServices

class SafariExtensionViewController: SFSafariExtensionViewController, NSTextFieldDelegate {
    
    @IBOutlet weak var enableExtensionCheckmark: NSButton!
    @IBOutlet weak var linkField: NSTextField!
    
    static let sessionLinkKey = "kagiSessionLink"
    static let enableExtensionKey = "enableKagiSearch"
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        linkField.delegate = self
    }
    
    override func viewWillAppear() {
        super.viewWillAppear()
        
        linkField.stringValue = UserDefaults.standard.string(forKey: Self.sessionLinkKey) ?? ""
        enableExtensionCheckmark.state = UserDefaults.standard.bool(forKey: Self.enableExtensionKey) ? .on : .off
    }
    
    @IBAction func enableExtensionValueChanged(_ sender: NSButton) {
        UserDefaults.standard.set(sender.state == .on, forKey: Self.enableExtensionKey)
    }
    
    func controlTextDidChange(_ obj: Notification) {
        UserDefaults.standard.set(linkField.stringValue, forKey: Self.sessionLinkKey)
    }
    
    @IBAction func getLinkTapped(_ sender: Any) {
        SFSafariApplication.getActiveWindow { window in
            window?.openTab(
                with: URL(string: "https://kagi.com/settings?p=user_details#sessionlink")!,
                makeActiveIfPossible: true
            )
        }
    }
    
    static let shared: SafariExtensionViewController = {
        SafariExtensionViewController()
    }()
}
