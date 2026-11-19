//
//  SceneDelegate.swift
//  iOS (App)
//
//  Created by Nano Anderson on 10/17/23.
//

import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?
    private var pendingURL: URL?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        pendingURL = connectionOptions.urlContexts.first?.url
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // SafariServices requires the containing app to be in the foreground.
        if let url = pendingURL {
            pendingURL = nil
            Deeplinks.handleIncomingURL(url)
        }
    }

    func sceneWillResignActive(_ scene: UIScene) {
        Deeplinks.cancelSettingsFallback()
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }
        if scene.activationState == .foregroundActive {
            Deeplinks.handleIncomingURL(url)
        } else {
            pendingURL = url
        }
    }
}
