// src/pages/About.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function About() {
  const { t } = useTranslation()

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h2>{t('about.title')}</h2>
      <p>{t('about.p1')}</p>
      <p>{t('about.p2')}</p>
    </div>
  )
}
