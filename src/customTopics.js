const STORAGE_KEY = 'wavelength-custom-topics'

export function loadCustomTopics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(topics) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(topics))
}

// Returns the updated list; also persists it. No-ops on blank or duplicate input.
export function saveCustomTopic(topics, left, right) {
  const l = left.trim()
  const r = right.trim()
  if (!l || !r) return topics
  const exists = topics.some((t) => t[0].toLowerCase() === l.toLowerCase() && t[1].toLowerCase() === r.toLowerCase())
  if (exists) return topics
  const next = [...topics, [l, r]]
  persist(next)
  return next
}

export function removeCustomTopic(topics, index) {
  const next = topics.filter((_, i) => i !== index)
  persist(next)
  return next
}
