//
//  ViewController.swift
//  KagiForSafari
//

import UIKit

final class ViewController: UIViewController {
	@IBOutlet weak var label: UILabel!
	@IBOutlet weak var settingsButton: UIButton!
	@IBOutlet weak var visitButton: UIButton!
	
	override func viewDidLoad() {
		super.viewDidLoad()
		
		let font = UIFont(name: "Lufga-Regular", size: 17)
		self.label.font = font
		self.label.text = NSLocalizedString("info_label", comment: "You can turn on Kagi Search Safari extension in iOS Settings -> Safari -> Extensions")
		
		self.settingsButton.setAttributedTitle(
			NSAttributedString(
				string: NSLocalizedString("settings_title", comment: "Open iOS Settings"),
				attributes: [NSAttributedString.Key.font: font as Any]
			),
			for: .normal
		)
		
		self.visitButton.setAttributedTitle(
			NSAttributedString(
				string: NSLocalizedString("visit_title", comment: "Visit kagi.com"),
				attributes: [NSAttributedString.Key.font: font as Any]
			), for: .normal
		)
	}
	
	@IBAction func openSettingsTapped() {
		guard let url = URL(string: UIApplication.openSettingsURLString) else {
			return
		}
		UIApplication.shared.open(url, options: [:], completionHandler: nil)
	}
	
	@IBAction func visitKagiTapped() {
		UIApplication.shared.open(URL(string: "https://kagi.com")!, options: [:], completionHandler: nil)
	}
}
