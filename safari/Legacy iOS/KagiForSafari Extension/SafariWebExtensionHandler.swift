//
//  SafariWebExtensionHandler.swift
//  KagiForSafari Extension
//
//  Created by apples on 31.01.2022.
//

import SafariServices
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
	func beginRequest(with context: NSExtensionContext) {
		let response = NSExtensionItem()
		context.completeRequest(returningItems: [response], completionHandler: nil)
	}
}
