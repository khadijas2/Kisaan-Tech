// src/pages/Home.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // pull the feature list from translation.json
  const features = t('home.features.list', { returnObjects: true })

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'linear-gradient(to right, #e0f7fa, #f1f8e9)'
        }}
      >
        {/* 
          Use <Trans> if you need to preserve the <span> styling around "Tech". 
          In your JSON you'll write:
            "home.hero.title": "Welcome to <1>Tech</1>"
        */}
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#2f80ed' }}>
          <Trans i18nKey="home.hero.title">
            Welcome to <span style={{ color: '#27ae60' }}>Tech</span>
          </Trans>
        </h1>

        <p style={{ fontSize: '1.2rem', maxWidth: 700, margin: 'auto' }}>
          {t('home.hero.subtitle')}
        </p>

        <button
          onClick={() => navigate('/login')}
          style={{
            marginTop: '2rem',
            padding: '0.8rem 1.5rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#2f80ed',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            transition: 'background 0.3s'
          }}
          onMouseOver={e =>
            (e.currentTarget.style.background = '#1c60b3')
          }
          onMouseOut={e =>
            (e.currentTarget.style.background = '#2f80ed')
          }
        >
          {t('home.hero.cta')}
        </button>
      </section>

      {/* Features Section */}
      <section style={{ padding: '3rem 2rem', background: '#f9f9f9' }}>
        <h2
          style={{
            textAlign: 'center',
            fontSize: '2rem',
            marginBottom: '2rem'
          }}
        >
          {t('home.features.title')}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            maxWidth: 1200,
            margin: 'auto'
          }}
        >
          {features.map((feat, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                {feat.title}
              </h3>
              <p style={{ lineHeight: 1.4 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
