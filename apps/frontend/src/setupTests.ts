import '@testing-library/jest-dom/vitest'

// jsdom implements neither the Pointer Capture API nor scrollIntoView, and
// Radix uses both to open a Select or a Dropdown. Without these, any test that
// touches one dies on "target.hasPointerCapture is not a function".
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.scrollIntoView ??= () => {}
