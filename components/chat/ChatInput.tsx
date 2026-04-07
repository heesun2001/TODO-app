'use client'

import { useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SendHorizonal, Paperclip, X } from 'lucide-react'

export interface AttachedImage {
  dataUrl: string
  mediaType: string
  name: string
}

interface Props {
  input: string
  onInputChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  status: 'submitted' | 'streaming' | 'ready' | 'error'
  attachedImages: AttachedImage[]
  onImagesChange: (images: AttachedImage[]) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  status,
  attachedImages,
  onImagesChange,
}: Props) {
  const isLoading = status === 'streaming' || status === 'submitted'
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if ((input.trim() || attachedImages.length > 0) && !isLoading) {
        onSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''

    const newImages: AttachedImage[] = []
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert(`지원하지 않는 형식입니다: ${file.name}`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`파일 크기가 5MB를 초과합니다: ${file.name}`)
        continue
      }
      const dataUrl = await readFileAsDataUrl(file)
      newImages.push({ dataUrl, mediaType: file.type, name: file.name })
    }
    if (newImages.length > 0) {
      onImagesChange([...attachedImages, ...newImages])
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      ACCEPTED_TYPES.includes(f.type)
    )
    if (files.length === 0) return
    const newImages: AttachedImage[] = []
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`파일 크기가 5MB를 초과합니다: ${file.name}`)
        continue
      }
      const dataUrl = await readFileAsDataUrl(file)
      newImages.push({ dataUrl, mediaType: file.type, name: file.name })
    }
    if (newImages.length > 0) {
      onImagesChange([...attachedImages, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    onImagesChange(attachedImages.filter((_, i) => i !== index))
  }

  const canSubmit = (input.trim().length > 0 || attachedImages.length > 0) && !isLoading

  return (
    <div
      className="border-t"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* 이미지 미리보기 */}
      {attachedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-3">
          {attachedImages.map((img, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.dataUrl}
                alt={img.name}
                className="h-16 w-16 rounded-lg object-cover border"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex items-end gap-2 p-4">
        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {/* 첨부 버튼 */}
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={isLoading}
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
          rows={1}
          className="resize-none min-h-[44px] max-h-[200px]"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!canSubmit}
          className="shrink-0"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
