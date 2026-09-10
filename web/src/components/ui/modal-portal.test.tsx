import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MODAL_LAYERS, ModalPortal } from './modal-portal'

afterEach(cleanup)

describe('ModalPortal', () => {
  it('mounts global overlays directly under document.body', () => {
    const { container, unmount } = render(
      <div data-testid="stacking-context" className="relative z-10">
        <ModalPortal>
          <div data-testid="global-modal" />
        </ModalPortal>
      </div>
    )

    const modal = screen.getByTestId('global-modal')
    expect(modal.parentElement).toBe(document.body)
    expect(within(container).queryByTestId('global-modal')).toBeNull()

    unmount()
    expect(screen.queryByTestId('global-modal')).toBeNull()
  })

  it('keeps the global overlay layer contract stable', () => {
    expect(MODAL_LAYERS).toEqual({
      primary: 'z-[100]',
      nested: 'z-[110]',
      critical: 'z-[120]',
    })
  })
})
