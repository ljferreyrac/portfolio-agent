import { useRef, useState } from 'react'
import { Upload, FileText, X, BarChart2, Loader2, AlertCircle } from 'lucide-react'

interface Props {
  fileName: string | null
  analyzing: boolean
  hasScore: boolean
  error: string | null
  onFileSelect: (file: File) => void
  onClearFile: () => void
  onGenerateScore: () => void
}

const ACCEPTED = '.pdf,.png,.jpg,.jpeg,.webp'
const ACCEPTED_MIME = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])

export default function JobAnalyzer({
  fileName,
  analyzing,
  hasScore,
  error,
  onFileSelect,
  onClearFile,
  onGenerateScore,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!ACCEPTED_MIME.has(file.type)) return
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Job Description
        </h2>

        {fileName ? (
          <div className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl animate-fade-in">
            <div className="w-9 h-9 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-brand-400" />
            </div>
            <span className="text-sm text-slate-200 flex-1 truncate">{fileName}</span>
            <button
              onClick={onClearFile}
              className="flex-shrink-0 w-6 h-6 rounded-md hover:bg-slate-700 flex items-center justify-center transition-colors"
              title="Remove file"
            >
              <X size={14} className="text-slate-400" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? 'border-brand-500 bg-brand-500/10'
                : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              onChange={handleChange}
              className="hidden"
            />
            <Upload size={22} className={`mx-auto mb-2 ${isDragging ? 'text-brand-400' : 'text-slate-500'}`} />
            <p className="text-sm text-slate-400">
              Drop a file or <span className="text-brand-400 font-medium">browse</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">PDF, PNG, JPEG, WEBP — max 5 MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <button
        onClick={onGenerateScore}
        disabled={!fileName || analyzing}
        title={!fileName ? 'Upload a job description first' : undefined}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all
          bg-brand-500 hover:bg-brand-600 text-white
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-500"
      >
        {analyzing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <BarChart2 size={16} />
            {hasScore ? 'Regenerate Score' : 'Generate Score'}
          </>
        )}
      </button>
    </div>
  )
}
