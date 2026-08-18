import { useState } from 'react'
import { canShare, copyText, shareText } from '../export.js'

export default function ShareExport({ text, title = 'Wavelength results' }) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    shareText(title, text)
  }

  const handleCopy = async () => {
    await copyText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="export-actions">
      {canShare && (
        <button className="secondary" onClick={handleShare}>
          📤 Share
        </button>
      )}
      <button className="secondary" onClick={handleCopy}>
        {copied ? '✓ Copied!' : '📋 Copy'}
      </button>
    </div>
  )
}
