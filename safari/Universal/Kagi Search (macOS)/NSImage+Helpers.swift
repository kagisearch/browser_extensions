//
//  NSImage+Helpers.swift
//  Kagi Search for Safari (macOS)
//
//  Created by Nano Anderson on 11/7/23.
//

import Foundation
import AppKit

extension NSImage {
    func pngData() -> Data? {
        guard let localCGImage = cgImage(forProposedRect: nil, context: nil, hints: nil) else {
            return nil
        }
        let imageRep = NSBitmapImageRep(cgImage: localCGImage)
        imageRep.size = size
        return imageRep.representation(using: .png, properties: [:])
    }
}
