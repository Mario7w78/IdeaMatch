import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { emailPreferencesService } from '../services/emailPreferences'
import { loginAs, renderAt } from './helpers'

const PATH = '/app/notificaciones/correo'

describe('HU33 — Notificaciones por correo electrónico (preferencias)', () => {
  beforeEach(() => {
    localStorage.clear()
    emailPreferencesService.reset()
    vi.restoreAllMocks()
  })

  it('escenario feliz: el usuario apaga un tipo de aviso y la preferencia se guarda', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    const user = userEvent.setup()
    renderAt(PATH, auth)

    expect(await screen.findByRole('heading', { name: 'Preferencias de correo' })).toBeInTheDocument()
    const chat = await screen.findByRole('switch', { name: 'Mensajes del chat' })
    expect(chat).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled()

    await user.click(chat)
    expect(chat).toHaveAttribute('aria-checked', 'false')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Preferencias guardadas.')).toBeInTheDocument()
    expect(await emailPreferencesService.shouldSendEmail('user1', 'chat_messages')).toBe(false)
    expect(await emailPreferencesService.shouldSendEmail('user1', 'new_application')).toBe(true)
  })

  it('el interruptor general bloquea los avisos individuales', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    const user = userEvent.setup()
    renderAt(PATH, auth)

    await user.click(await screen.findByRole('switch', { name: 'Recibir notificaciones por correo' }))
    expect(screen.getByRole('switch', { name: 'Nuevas postulaciones' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await screen.findByText('Preferencias guardadas.')
    expect(await emailPreferencesService.shouldSendEmail('user1', 'application_status')).toBe(false)
  })

  it('escenario alterno: si falla el guardado se avisa y no se pierde la preferencia anterior', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    const user = userEvent.setup()
    vi.spyOn(emailPreferencesService, 'updatePreferences').mockRejectedValueOnce(new Error('sin conexión'))
    renderAt(PATH, auth)

    await user.click(await screen.findByRole('switch', { name: 'Mensajes del chat' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar tus preferencias')
    expect(screen.queryByText('Preferencias guardadas.')).not.toBeInTheDocument()
    expect(await emailPreferencesService.shouldSendEmail('user1', 'chat_messages')).toBe(true)

    // Se puede reintentar sin volver a configurar nada.
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(screen.getByText('Preferencias guardadas.')).toBeInTheDocument())
  })
})
