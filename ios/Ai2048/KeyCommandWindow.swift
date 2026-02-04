import UIKit

/// Window that handles hardware keyboard (arrow + WASD) and forwards to RNKeyEvent.
/// Key commands are implemented on the window so they are used when the key bubbles up
/// the responder chain (e.g. when first responder is the game view and doesn't handle keys).
class KeyCommandWindow: UIWindow {
  override var keyCommands: [UIKeyCommand]? {
    var commands: [UIKeyCommand] = []
    let keys: [String] = [
      UIKeyCommand.inputUpArrow,
      UIKeyCommand.inputDownArrow,
      UIKeyCommand.inputLeftArrow,
      UIKeyCommand.inputRightArrow,
      "w", "a", "s", "d",
    ]
    for key in keys {
      commands.append(UIKeyCommand(input: key, modifierFlags: [], action: #selector(handleKeyCommand(_:))))
    }
    return commands
  }

  @objc private func handleKeyCommand(_ sender: UIKeyCommand) {
    guard let input = sender.input else { return }
    (RNKeyEvent.getSingletonInstance() as? RNKeyEvent)?.send(input)
  }
}
