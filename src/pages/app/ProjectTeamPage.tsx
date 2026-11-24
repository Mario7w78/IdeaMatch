import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { TextField } from '../../components/ui/TextField'
import { useAuth } from '../../context/useAuth'
import { ApiError } from '../../services/http/apiClient'
import { teamService, type TeamMember } from '../../services/team'

/** HU28–HU30: equipo y acciones propias, sin alterar el módulo de chat. */
export function ProjectTeamPage() {
  const { id = '' } = useParams()
  const { session } = useAuth()
  const userId = session?.user.id
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [action, setAction] = useState<{ kind: 'leave' | 'remove'; member?: TeamMember } | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  const load = useCallback(async () => {
    const items = await teamService.list(id)
    setMembers(items)
  }, [id])

  useEffect(() => {
    let active = true
    teamService.list(id).then((items) => { if (active) setMembers(items) })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el equipo.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  const leader = members.find((member) => member.isLeader)
  const isCreator = leader?.userId === userId
  const isMember = members.some((member) => member.userId === userId && !member.isLeader)

  function close() {
    if (busy) return
    setAction(null)
    setReason('')
    setReasonError('')
  }

  async function confirmAction() {
    if (!action) return
    if (action.kind === 'remove' && !reason.trim()) {
      setReasonError('Indica el motivo de la remoción.')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (action.kind === 'leave') await teamService.leave(id)
      else if (action.member) await teamService.remove(id, action.member.userId, reason)
      await load()
      setNotice(action.kind === 'leave' ? 'Abandonaste el equipo.' : 'Integrante removido del equipo.')
      setAction(null)
      setReason('')
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'OWNER_CANNOT_LEAVE') setError('El creador no puede abandonar el proyecto; debe transferirlo o cancelarlo')
      else setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el equipo.')
      setAction(null)
    } finally { setBusy(false) }
  }

  return <section className="space-y-6">
    <Link to="/app/mis-proyectos" className="text-sm font-semibold text-brand-700 hover:underline">Volver a mis proyectos</Link>
    <div><h1 className="text-3xl font-bold">Equipo del proyecto</h1><p className="mt-2 text-muted">Integrantes confirmados y roles asignados.</p></div>
    {error && <Alert tone="error">{error}</Alert>}
    {notice && <Alert tone="success">{notice}</Alert>}
    {loading ? <p role="status" className="text-muted">Cargando equipo…</p> : <>
      {members.length === 0 && <p className="rounded-2xl border border-line bg-white p-8 text-muted">No se encontraron integrantes.</p>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{members.map((member) => <li key={member.userId} className="rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700" aria-hidden="true">{member.initials || member.name.slice(0, 2).toUpperCase()}</span><div className="min-w-0"><h2 className="truncate font-bold">{member.name}</h2><p className="text-sm text-muted">{member.isLeader ? 'Líder del Proyecto' : member.role}</p></div></div>
        {isCreator && !member.isLeader && <Button className="mt-5" size="sm" variant="secondary" onClick={() => setAction({ kind: 'remove', member })}>Remover integrante</Button>}
      </li>)}</ul>
      {isMember && <Button variant="secondary" onClick={() => setAction({ kind: 'leave' })}>Abandonar equipo</Button>}
    </>}
    <Modal open={action !== null} onClose={close} title={action?.kind === 'remove' ? 'Remover integrante' : 'Abandonar equipo'} description={action?.kind === 'remove' ? `¿Remover a ${action.member?.name}? Su vacante quedará disponible.` : 'Perderás el acceso al equipo y su conversación.'} maxWidth="md" footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={close} disabled={busy}>Cancelar</Button><Button onClick={() => void confirmAction()} loading={busy}>{action?.kind === 'remove' ? 'Confirmar remoción' : 'Confirmar salida'}</Button></div>}>
      {action?.kind === 'remove' && <TextField label="Motivo de la remoción" value={reason} onChange={(event) => { setReason(event.target.value); setReasonError('') }} error={reasonError} />}
    </Modal>
  </section>
}
