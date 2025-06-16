// src/pages/AdminFrames.jsx

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../api/supabase'
import { uploadAndGetUrl } from '../utils/storage'

// TanStack Table + UI personalizada
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { DataGridProvider, DataGrid } from '../components/ui/data-grid'
import { DataGridColumnHeader } from '../components/ui/data-grid-column-header'
import { DataGridPagination } from '../components/ui/data-grid-pagination'
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '../components/ui/data-grid-table'
import {
  Card,
  CardHeader,
  CardHeading,
  CardToolbar,
  CardTable,
  CardFooter,
} from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Switch } from '../components/ui/switch'
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { ScrollArea, ScrollBar } from '../components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../components/ui/dialog'

const ADMIN_EMAIL = 'scaroaldas@gmail.com'
const ADMIN_PASSWORD = 'Teamocaro123'
const BUCKET = 'frames-models'

export default function AdminFrames() {
  // --- AUTH ---
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // --- DATA ---
  const [frames, setFrames] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterActive, setFilterActive] = useState('all')

  // --- FORM STATE ---
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    active: true,
    modelFile: null,
    thumbFile: null,
    model_url: '',
    thumbnail_url: '',
  })
  const [open, setOpen] = useState(false)

  // --- AUTH INIT ---
  useEffect(() => {
    async function initAuth() {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (s) setSession(s)
      else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        })
        if (error) console.error(error.message)
        else setSession(data.session)
      }
      setAuthLoading(false)
    }
    initAuth()
  }, [])

  // --- LOAD FRAMES ---
  useEffect(() => {
    if (!authLoading && session) fetchFrames()
  }, [authLoading, session, filterActive])

  async function fetchFrames() {
    setLoading(true)
    let query = supabase.from('frames').select('*')
    if (filterActive !== 'all') query = query.eq('active', filterActive === 'true')
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) console.error(error.message)
    else setFrames(data)
    setLoading(false)
  }

  // --- FORM EVENTS ---
  function handleChange(e) {
    const { name, type, checked, files, value } = e.target
    setForm(f => ({
      ...f,
      [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!session) return alert('No autenticado')

    const creating = !form.id
    let model_url = form.model_url
    let thumbnail_url = form.thumbnail_url

    try {
      if (creating) {
        model_url = await uploadAndGetUrl(BUCKET, form.modelFile)
        thumbnail_url = await uploadAndGetUrl(BUCKET, form.thumbFile)
      } else {
        if (form.modelFile) model_url = await uploadAndGetUrl(BUCKET, form.modelFile)
        if (form.thumbFile) thumbnail_url = await uploadAndGetUrl(BUCKET, form.thumbFile)
      }
    } catch (err) {
      console.error(err)
      return alert('Error subiendo archivos')
    }

    if (!model_url || !thumbnail_url) return alert('Faltan URLs')

    const payload = {
      name: form.name,
      description: form.description,
      active: form.active,
      model_url,
      thumbnail_url
    }

    try {
      if (creating) {
        const { error } = await supabase.from('frames').insert([payload])
        if (error) throw error
      } else {
        const { error } = await supabase.from('frames').update(payload).eq('id', form.id)
        if (error) throw error
      }
    } catch (err) {
      console.error(err)
      return alert('Error guardando en la tabla')
    }

    setForm({
      id: null,
      name: '',
      description: '',
      active: true,
      modelFile: null,
      thumbFile: null,
      model_url: '',
      thumbnail_url: '',
    })
    setOpen(false)
    fetchFrames()
  }

  function handleEdit(frame) {
    setForm({
      id: frame.id,
      name: frame.name,
      description: frame.description,
      active: frame.active,
      modelFile: null,
      thumbFile: null,
      model_url: frame.model_url,
      thumbnail_url: frame.thumbnail_url,
    })
    setOpen(true)
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este armazón?')) return
    const { error } = await supabase.from('frames').delete().eq('id', id)
    if (error) console.error(error.message)
    else fetchFrames()
  }

  // --- TABLE CONFIG ---
  const data = useMemo(() => frames, [frames])
  const columns = useMemo(() => [
    {
      accessorKey: 'select',
      header: () => <DataGridTableRowSelectAll />,
      cell: ({ row }) => <DataGridTableRowSelect row={row} />,
      size: 50,
    },
    {
      accessorKey: 'thumbnail',
      header: ({ column }) => <DataGridColumnHeader column={column} title="Miniatura" />,
      cell: ({ row }) => (
        <img
          src={row.original.thumbnail_url}
          alt={row.original.name}
          className="h-12 w-12 rounded-lg"
        />
      ),
      size: 100,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataGridColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.name}</span>,
      size: 200,
    },
    {
      accessorKey: 'active',
      header: ({ column }) => <DataGridColumnHeader column={column} title="Activo" />,
      cell: ({ row }) => (
        <Badge appearance="outline" variant={row.original.active ? 'success' : 'destructive'}>
          {row.original.active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button mode="icon" variant="ghost">•••</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>Editar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => handleDelete(row.original.id)}>Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 60,
    },
  ], [frames])

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // --- RENDER ---
  if (authLoading) return <p>Cargando autenticación…</p>
  if (!session) return <p>Error de autenticación.</p>
  if (loading) return <p>Cargando armazones…</p>

  return (
    <div className="p-6">
      <DataGridProvider table={table} recordCount={data.length} isLoading={loading}>
        <DataGrid table={table} recordCount={data.length}>
          <Card className="space-y-6">
            <CardHeader className="p-4">
              <CardHeading>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <h1 className="text-2xl font-bold">Administrar Armazones 3D</h1>
                  <div className="flex items-center gap-3">
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="primary">+ Nuevo</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg w-full">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-semibold">
                            {form.id ? 'Editar Armazón' : 'Crear Armazón'}
                          </DialogTitle>
                          <DialogClose />
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-5 p-4">
                          <div className="grid grid-cols-1 gap-4">
                            <Label htmlFor="name">Nombre</Label>
                            <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <Label htmlFor="description">Descripción</Label>
                            <textarea id="description" name="description" value={form.description} onChange={handleChange} className="border rounded px-3 py-2 text-sm" />
                          </div>
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex flex-col gap-2 w-full">
                              <Label htmlFor="modelFile">Modelo 3D</Label>
                              <input id="modelFile" type="file" name="modelFile" accept=".glb,.gltf" onChange={handleChange} className="text-sm" />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                              <Label htmlFor="thumbFile">Miniatura</Label>
                              <input id="thumbFile" type="file" name="thumbFile" accept="image/*" onChange={handleChange} className="text-sm" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch id="active" checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
                            <Label htmlFor="active">Activo</Label>
                          </div>
                          <div className="mt-4 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" variant="primary">{form.id ? 'Actualizar' : 'Crear'}</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeading>

              <CardToolbar className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                  <span className="text-sm text-muted-foreground">{data.length} armazones</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">Filtrar</Button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="end" className="space-y-3 p-4 w-48">
                      <Label htmlFor="filterActive">Estado</Label>
                      <select
                        id="filterActive"
                        value={filterActive}
                        onChange={e => setFilterActive(e.target.value)}
                        className="w-full rounded border border-input px-2 py-1"
                      >
                        <option value="all">Todos</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                      </select>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardToolbar>
            </CardHeader>

            <CardTable>
              <ScrollArea>
                <DataGridTable className="min-w-full divide-y" />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>

            <CardFooter className="px-4 py-3">
              <DataGridPagination />
            </CardFooter>
          </Card>
        </DataGrid>
      </DataGridProvider>
    </div>
  )
}
