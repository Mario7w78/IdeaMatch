import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderAt, testAuth } from './helpers'
import { teamService, type TeamMember } from '../services/team'

const leader: TeamMember = { userId: 'user1', name: 'Ana López', initials: 'AL', role: 'Líder del proyecto', isLeader: true }
const collaborator: TeamMember = { userId: 'user2', name: 'Luis Pérez', initials: 'LP', role: 'Diseñador', isLeader: false }

describe('HU28–HU30: vista del equipo', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('HU28 muestra solo al líder si no hay aceptados y oculta salida al creador', async () => {
    vi.spyOn(teamService, 'list').mockResolvedValue([leader])
    const auth = testAuth()
    await auth.login('user1@ideamatch.com', 'Password123')
    renderAt('/app/proyecto/1/equipo', auth)
    expect(await screen.findByText('Ana López')).toBeInTheDocument()
    expect(screen.getByText('Líder del Proyecto')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Abandonar equipo' })).not.toBeInTheDocument()
  })

  it('HU29 permite salir al colaborador tras confirmar', async () => {
    vi.spyOn(teamService, 'list').mockResolvedValueOnce([leader, collaborator]).mockResolvedValueOnce([leader])
    const leave = vi.spyOn(teamService, 'leave').mockResolvedValue()
    const auth = testAuth()
    await auth.login('user2@ideamatch.com', 'Password123')
    renderAt('/app/proyecto/1/equipo', auth)
    fireEvent.click(await screen.findByRole('button', { name: 'Abandonar equipo' }))
    expect(leave).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar salida' }))
    await waitFor(() => expect(leave).toHaveBeenCalledWith('1'))
    expect(await screen.findByText('Abandonaste el equipo.')).toBeInTheDocument()
  })

  it('HU30 cancelar no remueve y exige motivo antes de confirmar', async () => {
    vi.spyOn(teamService, 'list').mockResolvedValue([leader, collaborator])
    const remove = vi.spyOn(teamService, 'remove').mockResolvedValue()
    const auth = testAuth()
    await auth.login('user1@ideamatch.com', 'Password123')
    renderAt('/app/proyecto/1/equipo', auth)
    fireEvent.click(await screen.findByRole('button', { name: 'Remover integrante' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(remove).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Remover integrante' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar remoción' }))
    expect(screen.getByText('Indica el motivo de la remoción.')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Motivo de la remoción' }), { target: { value: 'Inactividad' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar remoción' }))
    await waitFor(() => expect(remove).toHaveBeenCalledWith('1', 'user2', 'Inactividad'))
  })
})
