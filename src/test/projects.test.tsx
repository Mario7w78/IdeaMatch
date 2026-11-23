import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { projectsService } from '../services/projects'
import { loginAs, renderAt } from './helpers'

describe('HU16 — Catálogo general de proyectos abiertos', () => {
  beforeEach(() => {
    localStorage.clear()
    projectsService.reset()
  })

  it('escenario feliz: muestra una cuadrícula de 10 tarjetas y pagina el resto', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/app/explorar', auth)

    expect(await screen.findByRole('heading', { name: 'Explora proyectos' })).toBeInTheDocument()
    const grid = await screen.findByRole('list', { name: 'Proyectos abiertos' })
    expect(within(grid).getAllByRole('article')).toHaveLength(10)
    expect(screen.getByText(/13 proyectos abiertos/)).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()
    // El proyecto cerrado no se lista.
    expect(screen.queryByText('Aurora Studio')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(await screen.findByText('Página 2 de 2')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Proyectos abiertos' })).getAllByRole('article')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
  })

  it('cada tarjeta lleva al detalle del proyecto', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    renderAt('/app/explorar', auth)
    const card = (await screen.findAllByText('NeuroBloom'))[0].closest('article')!
    expect(within(card).getByRole('link')).toHaveAttribute('href', '/app/proyecto/proj-neurobloom')
  })

  it('escenario alterno: sin proyectos publicados se muestra el estado vacío', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    projectsService.replaceAll([])
    renderAt('/app/explorar', auth)

    expect(
      await screen.findByRole('heading', { name: 'No se encontraron proyectos activos en este momento' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument()
  })
})

describe('HU17 — Vista detallada del proyecto', () => {
  beforeEach(() => {
    localStorage.clear()
    projectsService.reset()
  })

  it('escenario feliz: muestra la propuesta completa, el creador, el equipo y los roles con «Postular»', async () => {
    const auth = await loginAs('user2@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/app/proyecto/proj-neurobloom', auth)

    expect(await screen.findByRole('heading', { name: 'NeuroBloom', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Bienestar emocional/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'La idea' })).toBeInTheDocument()
    expect(screen.getByText('Una comunidad segura y cercana')).toBeInTheDocument()
    expect(screen.getByText('Laura Ríos')).toBeInTheDocument()
    expect(screen.getByText('4 integrantes')).toBeInTheDocument()
    expect(screen.getByText('6 vacantes')).toBeInTheDocument()

    // Un rol sin vacantes no se puede postular.
    expect(screen.getByRole('button', { name: 'Postular a Product Designer' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Sin vacantes' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Postular a Frontend Developer' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('quien ya postuló lo ve y no puede volver a postular', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    renderAt('/app/proyecto/proj-neurobloom', auth)
    expect(await screen.findByText('Ya enviaste tu postulación')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Postular/ })).not.toBeInTheDocument()
  })

  it('el perfil del creador se enlaza cuando existe', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    renderAt('/app/proyecto/proj-orbitfinance', auth)
    expect(await screen.findByRole('link', { name: 'Ver perfil' })).toHaveAttribute('href', '/app/perfil/user2')
  })

  it('escenario alterno: una URL de un proyecto que no existe muestra el error 404', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    renderAt('/app/proyecto/9999', auth)

    expect(await screen.findByRole('heading', { name: 'El proyecto no existe o fue eliminado' })).toBeInTheDocument()
    expect(screen.getByText('Error 404')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a Explorar' })).toHaveAttribute('href', '/app/explorar')
  })

  it('el creador no ve botones de postulación en su propio proyecto', async () => {
    const auth = await loginAs('user1@ideamatch.com')
    renderAt('/app/proyecto/proj-verdecerca', auth)
    await screen.findByRole('heading', { name: 'Verde Cerca', level: 1 })
    expect(screen.queryByRole('button', { name: /^Postular/ })).not.toBeInTheDocument()
  })
})

describe('HU14 — Cambio de estado del proyecto', () => {
  beforeEach(() => {
    localStorage.clear()
    projectsService.reset()
  })

  async function openStatusChange(label: string) {
    const auth = await loginAs('user1@ideamatch.com')
    const user = userEvent.setup()
    renderAt('/app/proyecto/proj-verdecerca', auth)
    const select = await screen.findByLabelText('Estado del proyecto')
    await user.selectOptions(select, label)
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }))
    return { user, dialog: await screen.findByRole('dialog') }
  }

  it('escenario feliz: el creador pausa el proyecto tras confirmar y se suspenden las postulaciones', async () => {
    const { user, dialog } = await openStatusChange('Pausado')
    expect(within(dialog).getByText(/Dejarás de recibir nuevas postulaciones/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar cambio' }))

    expect(await screen.findByText('Estado actualizado a «Pausado».')).toBeInTheDocument()
    expect((await projectsService.getProject('proj-verdecerca'))?.status).toBe('PAUSED')
    expect(screen.getByLabelText('Estado del proyecto')).toHaveValue('PAUSED')
  })

  it('si el creador cancela la confirmación, el estado no cambia', async () => {
    const { user, dialog } = await openStatusChange('Cerrado')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect((await projectsService.getProject('proj-verdecerca'))?.status).toBe('OPEN')
  })

  it('escenario alterno: de Cerrado a «En curso» muestra «Transición de estado no válida»', async () => {
    await projectsService.changeStatus('proj-verdecerca', 'user1', 'CLOSED')
    const { user, dialog } = await openStatusChange('En curso')
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar cambio' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Transición de estado no válida')
    expect((await projectsService.getProject('proj-verdecerca'))?.status).toBe('CLOSED')
  })

  it('quien no es el creador no ve el selector de estado', async () => {
    const auth = await loginAs('user2@ideamatch.com')
    renderAt('/app/proyecto/proj-verdecerca', auth)
    await screen.findByRole('heading', { name: 'Verde Cerca', level: 1 })
    expect(screen.queryByLabelText('Estado del proyecto')).not.toBeInTheDocument()
  })
})
