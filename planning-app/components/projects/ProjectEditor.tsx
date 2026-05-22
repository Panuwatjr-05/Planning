'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { updateProject, deleteProject, addProjectImage, removeProjectImage } from '@/actions/projects'
import { type Tables } from '@/types/database'
import { Trash2, Check, ImagePlus, X, ArrowLeft } from 'lucide-react'

interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
}

interface ProjectEditorProps {
  project: Tables<'projects'>
}

async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export function ProjectEditor({ project }: ProjectEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description ?? '')
  const [images, setImages] = useState<{ url: string; publicId: string }[]>(
    (project.images ?? []).map((url) => ({ url, publicId: extractPublicId(url) }))
  )
  const [saved, setSaved] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { autoResize() }, [description])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  function triggerSave(newTitle: string, newDesc: string) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      startTransition(async () => {
        await updateProject({ id: project.id, title: newTitle.trim() || project.title, description: newDesc || null })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      })
    }, 800)
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    triggerSave(e.target.value, description)
  }

  function handleDescChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDescription(e.target.value)
    triggerSave(title, e.target.value)
  }

  const uploadFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return
    setIsUploading(true)
    for (const file of imageFiles) {
      try {
        const { secure_url, public_id } = await uploadToCloudinary(file)
        await addProjectImage(project.id, secure_url)
        setImages((prev) => [...prev, { url: secure_url, publicId: public_id }])
      } catch {}
    }
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [project.id])

  async function handleRemoveImage(url: string, publicId: string) {
    setImages((prev) => prev.filter((img) => img.url !== url))
    await removeProjectImage(project.id, url, publicId)
  }

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragging(true) }
  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false)
  }
  async function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setIsDragging(false)
    await uploadFiles(Array.from(e.dataTransfer.files))
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2500)
      return
    }
    startDelete(async () => {
      await deleteProject(project.id)
      router.push('/projects')
    })
  }

  return (
    <div className="space-y-0">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          โปรเจค
        </button>
        <div className="flex items-center gap-3">
          {isPending && <span className="text-xs text-muted-foreground">กำลังบันทึก...</span>}
          {saved && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Check size={11} /> บันทึกแล้ว
            </span>
          )}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-all disabled:opacity-40
              ${confirmDelete ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive hover:bg-muted'}`}
          >
            <Trash2 size={13} />
            {confirmDelete ? 'ยืนยันลบ?' : ''}
          </button>
        </div>
      </div>

      {/* Page title */}
      <input
        value={title}
        onChange={handleTitleChange}
        placeholder="ชื่อโปรเจค"
        className="w-full text-3xl font-bold bg-transparent outline-none placeholder:text-muted-foreground/25 text-foreground mb-6 leading-tight"
      />

      {/* Content */}
      <textarea
        ref={textareaRef}
        value={description}
        onChange={handleDescChange}
        onInput={autoResize}
        placeholder="เขียนรายละเอียด แนวคิด เป้าหมาย หรืออะไรก็ได้..."
        rows={8}
        className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed placeholder:text-muted-foreground/30 text-foreground min-h-[160px]"
      />

      {/* Images */}
      <div className="pt-6 mt-6 border-t border-border" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">รูปภาพ</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <ImagePlus size={13} />
            {isUploading ? 'กำลังอัปโหลด...' : 'เพิ่ม'}
          </button>
        </div>

        {images.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors disabled:opacity-40 text-sm
              ${isDragging ? 'border-foreground/30 bg-muted text-foreground' : 'border-border text-muted-foreground hover:border-muted-foreground/30'}`}
          >
            <ImagePlus size={16} />
            {isUploading ? 'กำลังอัปโหลด...' : isDragging ? 'วางรูปที่นี่' : 'คลิกหรือลากรูปมาวาง'}
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map(({ url, publicId }) => (
              <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemoveImage(url, publicId)}
                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 bg-black/60 text-white rounded-full p-1 transition-all hover:bg-black/80"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-muted-foreground/30 transition-colors disabled:opacity-40"
            >
              <ImagePlus size={16} />
              <span className="text-[10px]">เพิ่ม</span>
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => uploadFiles(Array.from(e.target.files ?? []))}
        className="hidden"
      />
    </div>
  )
}

function extractPublicId(cloudinaryUrl: string): string {
  try {
    const url = new URL(cloudinaryUrl)
    const parts = url.pathname.split('/upload/')
    if (parts[1]) return parts[1].replace(/^v\d+\//, '').replace(/\.[^.]+$/, '')
  } catch {}
  return cloudinaryUrl
}
