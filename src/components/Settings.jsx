import ThemeToggle from './ThemeToggle.jsx'

export default function Settings({
  bonusEnabled,
  onBonusEnabledChange,
  clueGiverScoringEnabled,
  onClueGiverScoringEnabledChange,
  theme,
  onToggleTheme,
}) {
  return (
    <div className="panel">
      <h2>Settings</h2>

      <div className="settings-row">
        <div>
          <div className="settings-label">Bonus guessing</div>
          <p className="subtitle settings-hint">Let everyone else call left or right of the guess for a bonus point.</p>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={bonusEnabled}
            onChange={(e) => onBonusEnabledChange(e.target.checked)}
          />
          <span className="switch-track" />
        </label>
      </div>

      <div className="settings-row">
        <div>
          <div className="settings-label">Clue giver scoring</div>
          <p className="subtitle settings-hint">Award the clue giver a point whenever the guesser scores.</p>
        </div>
        <label className="switch">
          <input
            type="checkbox"
            checked={clueGiverScoringEnabled}
            onChange={(e) => onClueGiverScoringEnabledChange(e.target.checked)}
          />
          <span className="switch-track" />
        </label>
      </div>

      <div className="settings-row">
        <div className="settings-label">Theme</div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </div>
  )
}
