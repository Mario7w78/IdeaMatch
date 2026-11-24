import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { ApiError } from '../../services/http/apiClient'
import { receivedApplicationsService, type ReceivedApplications } from '../../services/applications/receivedApplications'

/** HU25-FE: candidaturas recibidas, agrupables por rol y protegidas por el backend. */
export function ReceivedApplicationsPage() {
  const { id = '' } = useParams()
  const [data, setData] = useState<ReceivedApplications | null>(null)
  const [roleId, setRoleId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [notice, setNotice] = useState('')
  const [revision, setRevision] = useState(0)

  async function decide(applicationId: string, action: 'accept' | 'reject') {
    if (!window.confirm(action === 'accept' ? '¿Aceptar a este candidato?' : '¿Rechazar a este candidato?')) return
    setBusyId(applicationId)
    setNotice('')
    try {
      await receivedApplicationsService[action](applicationId)
      setNotice(action === 'accept' ? 'Candidato aceptado e incorporado al equipo.' : 'Postulación rechazada.')
      setRevision((value) => value + 1)
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === 'NO_VACANCIES') setError('No quedan vacantes disponibles para este rol. Aumente el cupo si desea aceptarlo')
      else if (reason instanceof ApiError && reason.code === 'NOT_PENDING') setError('La postulación ya no está en estado pendiente')
      else setError(reason instanceof Error ? reason.message : 'No se pudo procesar la postulación.')
    } finally { setBusyId('') }
  }

  useEffect(() => {
    let active = true
    receivedApplicationsService.list(id, roleId || undefined)
      .then((result) => { if (active) setData(result) })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof ApiError && reason.status === 403
          ? 'No tiene permisos para ver estas postulaciones'
          : reason instanceof Error ? reason.message : 'No se pudieron cargar las postulaciones.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, roleId, revision])

  return <section className="space-y-6">
    <Link to="/app/mis-proyectos" className="text-sm font-semibold text-brand-700 hover:underline">Volver a mis proyectos</Link>
    <div>
      <h1 className="text-3xl font-bold">Postulaciones recibidas</h1>
      <p className="mt-2 text-muted">Revisa los perfiles y notas de quienes quieren unirse al equipo.</p>
    </div>
    {error && <Alert tone="error">{error}</Alert>}
    {notice && <Alert tone="success">{notice}</Alert>}
    {loading ? <p role="status" className="text-muted">Cargando postulaciones…</p> : data && <>
      <div className="flex flex-wrap gap-2" aria-label="Filtrar por rol">
        <Button size="sm" variant={roleId ? 'secondary' : 'primary'} onClick={() => { setError(''); setLoading(true); setRoleId('') }}>Todos ({data.total})</Button>
        {data.roleCounts.map((role) => <Button key={role.roleId} size="sm" variant={roleId === role.roleId ? 'primary' : 'secondary'} onClick={() => { setError(''); setLoading(true); setRoleId(role.roleId) }}>{role.name} ({role.count})</Button>)}
      </div>
      {data.items.length === 0 ? <p className="rounded-2xl border border-line bg-white p-8 text-center text-muted">Aún no hay postulaciones pendientes.</p> :
        <ul className="grid gap-4 md:grid-cols-2">{data.items.map((item) => <li key={item.id} className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{item.applicant.name}</h2><p className="text-sm text-muted">{item.applicant.headline || item.role}</p></div><span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{item.matchPercent}% afinidad</span></div>
          <p className="mt-3 text-sm text-ink-soft">Rol: {item.role}</p>
          {item.applicant.location && <p className="text-sm text-muted">{item.applicant.location}</p>}
          <p className="mt-4 text-sm">{item.note}</p>
          <div className="mt-4 flex flex-wrap gap-2">{item.applicant.skills.map((skill) => <span key={skill} className="rounded-full bg-surface px-3 py-1 text-xs text-ink-soft">{skill}</span>)}</div>
          <Link to={`/app/perfil/${item.applicant.id}`} className="mt-5 inline-block text-sm font-semibold text-brand-700 hover:underline">Ver perfil público</Link>
          <div className="mt-5 flex flex-wrap gap-2"><Button size="sm" loading={busyId === item.id} disabled={Boolean(busyId)} onClick={() => void decide(item.id, 'accept')}>Aceptar candidato</Button><Button size="sm" variant="secondary" disabled={Boolean(busyId)} onClick={() => void decide(item.id, 'reject')}>Rechazar candidato</Button></div>
        </li>)}</ul>}
    </>}
  </section>
}
