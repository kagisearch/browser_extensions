//
//  NSWindow+Helpers.swift
//  Kagi Search for Safari (macOS)
//
//  Created by Nano Anderson on 11/1/23.
//

import Foundation
import AppKit

extension NSWindow {
    var titlebarHeight: CGFloat {
        frame.height - contentRect(forFrameRect: frame).height
    }
}
