//
//  AppDelegate.swift
//  macOS (App)
//
//  Created by Nano Anderson on 10/17/23.
//

import Cocoa

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    
    var contentViewController: ViewController? {
        get {
            if let window = NSApplication.shared.mainWindow,
               let viewController = window.contentViewController as? ViewController {
                return viewController
            }
            return nil
        }
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Override point for customization after application launch.
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
    
    @IBAction func openHelpWebpage(_ sender: NSMenuItem?) {
        NSWorkspace.shared.open(URL(string:"https://kagi.com")!)
    }
    
    @IBAction func syncWithSafari(_ sender: NSMenuItem?) {
        contentViewController?.syncDataToSafari(sender)
    }

}
