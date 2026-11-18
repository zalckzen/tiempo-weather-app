\ = Get-Content 'C:\Users\User\Desktop\Tiempo\css\styles.css' -Raw

\ = @'
/* Rain Analysis Section */
.rain-section {
  margin-bottom: 2rem;
}

.rain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.rain-analysis-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.rain-analysis-card::before {
  content: \"\";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent), #8b5cf6);
}

.rain-analysis-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.rain-analysis-card.comaruga::before { background: linear-gradient(90deg, #0ea5e9, #06b6d4); }
.rain-analysis-card.calafell::before { background: linear-gradient(90deg, #8b5cf6, #a855f7); }

.rain-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.rain-header .location-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rain-header .location-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rain-header .location-icon svg { width: 24px; height: 24px; }

.rain-header .location-details h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.rain-header .location-details .location-type {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rain-recommendation {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--accent);
  min-width: 200px;
  flex-shrink: 0;
}

.rain-rec-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--accent-light);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rain-rec-icon svg { width: 20px; height: 20px; }

.rain-rec-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.rain-rec-label {
  font-size: 0.875rem;
  font-weight: 600;
}

.rain-rec-reason {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.rain-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rain-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.rain-stat {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  text-align: center;
}

.rain-stat-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.rain-stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.rain-schedule {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  font-size: 0.8rem;
}

.rain-schedule-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.rain-schedule-value {
  color: var(--text-primary);
}

.rain-hours {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.rain-hours h4 {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.rainy-hours-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rainy-hour {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 1fr;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
}

.rainy-hour.none {
  grid-template-columns: 1fr;
  text-align: center;
  color: var(--text-muted);
  font-style: italic;
}

.rainy-hour-time {
  font-weight: 600;
  color: var(--text-primary);
}

.rainy-hour-prob {
  color: var(--accent);
  font-weight: 500;
}

.rainy-hour-precip {
  color: var(--text-secondary);
}

.rainy-hour-intensity {
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: capitalize;
}

.rain-timing {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
}

.rain-next, .rain-end {
  color: var(--text-secondary);
}

.rain-next strong, .rain-end strong {
  color: var(--text-primary);
}

/* Responsive for rain section */
@media (max-width: 768px) {
  .rain-grid { grid-template-columns: 1fr; }
  
  .rain-header { flex-direction: column; align-items: stretch; }
  
  .rain-recommendation { min-width: auto; }
  
  .rain-summary { grid-template-columns: repeat(2, 1fr); }
  
  .rainy-hour { grid-template-columns: 50px 1fr 1fr 1fr; font-size: 0.75rem; }
}

@media (max-width: 480px) {
  .rain-summary { grid-template-columns: 1fr 1fr; }
  .rainy-hour { grid-template-columns: 1fr 1fr; }
  .rainy-hour-time { grid-column: span 2; }
  .rainy-hour-intensity { grid-column: span 2; }
}

'@

\ = \ -replace '(\/\* Responsive \*\/)', \ + \"
\" + '\'
Set-Content 'C:\Users\User\Desktop\Tiempo\css\styles.css' -Value \
Write-Host 'Rain CSS added'
