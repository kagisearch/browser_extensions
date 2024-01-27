//
//  SceneDelegate.swift
//  iOS (App)
//
//  Created by Nano Anderson on 10/17/23.
//

import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let _ = (scene as? UIWindowScene) else { return }
        
        if let url = connectionOptions.urlContexts.first?.url {
            Deeplinks.handleIncomingURL(url)
        }
    }
    
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        if let url = URLContexts.first?.url {
            Deeplinks.handleIncomingURL(url)
        }
    }
}
