//
//  Kagi_Search__iOS_UITests.swift
//  Kagi Search (iOS)UITests
//
//  Created by Nano Anderson on 11/21/23.
//

import XCTest

final class Kagi_Search__iOS_UITests: XCTestCase {

    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.

        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testSetupGuideOpensSettings() throws {
        let app = XCUIApplication()
        app.launch()

        let guide = app.webViews.firstMatch
        let buttonTitle: String
        if #available(iOS 26.2, *) {
            buttonTitle = "Open extension settings"
        } else {
            buttonTitle = "Open Settings"
        }
        let settingsButton = guide.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", buttonTitle)).firstMatch
        XCTAssertTrue(settingsButton.waitForExistence(timeout: 15))
        XCTAssertTrue(guide.staticTexts["Allow your search engine"].exists)
        XCTAssertTrue(guide.links.matching(NSPredicate(format: "label BEGINSWITH 'Open Kagi'")).firstMatch.exists)

        XCTAssertTrue(guide.buttons["Settings"].exists)
        settingsButton.tap()
        assertSettingsOpened()
    }

    func testManualSettingsShortcut() {
        let app = XCUIApplication()
        app.launch()
        let shortcut = app.webViews.buttons["Settings"]
        XCTAssertTrue(shortcut.waitForExistence(timeout: 15))
        shortcut.tap()
        let settings = XCUIApplication(bundleIdentifier: "com.apple.Preferences")
        XCTAssertTrue(settings.wait(for: .runningForeground, timeout: 15))
    }

    func testPopupSettingsLinkOnColdLaunch() throws {
        let app = XCUIApplication()
        XCUIApplication(bundleIdentifier: "com.apple.Preferences").terminate()
        app.terminate()
        app.open(try XCTUnwrap(URL(string: "kagisearch://open-app?destination=safari-extension-settings-deep")))
        assertSettingsOpened()
    }

    func testPrivateBrowsingSetupOpensSettings() {
        let app = XCUIApplication()
        app.launch()
        let guide = app.webViews.firstMatch
        let disclosure = guide.descendants(matching: .any)
            .matching(NSPredicate(format: "label BEGINSWITH 'Set up Private Browsing'")).firstMatch
        XCTAssertTrue(disclosure.waitForExistence(timeout: 15))
        for _ in 0..<5 where !disclosure.isHittable {
            guide.swipeUp()
        }
        disclosure.tap()
        XCTAssertTrue(guide.links.matching(NSPredicate(format: "label BEGINSWITH 'Get your private session link'")).firstMatch.exists)
        let buttons = guide.buttons.matching(NSPredicate(format: "label BEGINSWITH[c] 'Open'"))
        XCTAssertEqual(buttons.count, 2)
        buttons.element(boundBy: 1).tap()
        assertSettingsOpened()
    }

    private func assertSettingsOpened() {
        let settings = XCUIApplication(bundleIdentifier: "com.apple.Preferences")
        XCTAssertTrue(settings.wait(for: .runningForeground, timeout: 45))
    }

    func testLaunchPerformance() throws {
        if #available(macOS 10.15, iOS 13.0, tvOS 13.0, watchOS 7.0, *) {
            // This measures how long it takes to launch your application.
            measure(metrics: [XCTApplicationLaunchMetric()]) {
                XCUIApplication().launch()
            }
        }
    }
}
