//
//  AppDelegate.swift
//  KagiForSafari
//

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
		self.window = UIWindow(frame: UIScreen.main.bounds)
		self.window?.rootViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: "ViewController")
		self.window?.makeKeyAndVisible()
		
        return true
    }
}
