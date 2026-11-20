import { config } from './config.js'

document.documentElement.classList.add('js')

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* --------------------------------------------------------------------------
   Header + navigation
   -------------------------------------------------------------------------- */

const header = document.querySelector('[data-header]')
const nav = document.querySelector('[data-nav]')
const menuBtn = document.querySelector('[data-menu-btn]')

const syncHeader = () => {
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 6)
}
syncHeader()
window.addEventListener('scroll', syncHeader, { passive: true })

const closeMenu = () => {
  if (!nav || !menuBtn) return
  nav.classList.remove('is-open')
  menuBtn.setAttribute('aria-expanded', 'false')
  document.body.classList.remove('is-locked')
}

if (nav && menuBtn) {
  menuBtn.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open')
    nav.classList.toggle('is-open', open)
    menuBtn.setAttribute('aria-expanded', String(open))
    document.body.classList.toggle('is-locked', open)
  })

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a') && window.innerWidth <= 1024) closeMenu()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu()
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeMenu()
  })
}

document.querySelectorAll('[data-dropdown]').forEach((dropdown) => {
  const toggle = dropdown.querySelector('button')
  const submenu = dropdown.querySelector('.nav__sub')
  if (!toggle || !submenu) return

  toggle.addEventListener('click', (event) => {
    event.preventDefault()
    const open = !submenu.classList.contains('is-open')
    submenu.classList.toggle('is-open', open)
    toggle.setAttribute('aria-expanded', String(open))
  })

  document.addEventListener('click', (event) => {
    if (dropdown.contains(event.target)) return
    submenu.classList.remove('is-open')
    toggle.setAttribute('aria-expanded', 'false')
  })
})

/* --------------------------------------------------------------------------
   Scroll reveal
   -------------------------------------------------------------------------- */

const revealItems = document.querySelectorAll('[data-reveal]')

const revealElement = (element) => element.classList.add('is-in')

if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        revealElement(entry.target)
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  )
  revealItems.forEach((item) => observer.observe(item))
} else {
  revealItems.forEach(revealElement)
}

// Safety net: IntersectionObserver is throttled in background tabs, and content
// must never stay invisible. A cheap scroll check keeps the reveal reliable.
let revealFrame = 0

const syncReveals = () => {
  revealFrame = 0
  document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((element) => {
    const rect = element.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) revealElement(element)
  })

  document.querySelectorAll('[data-wheel]:not([data-wheel-started])').forEach((wheel) => {
    const rect = wheel.getBoundingClientRect()
    const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
    if (rect.height > 0 && visible > rect.height * 0.35) {
      wheel.dataset.wheelStarted = 'true'
      if (!reduceMotion) wheel.classList.add('is-animating')
    }
  })
}

const queueRevealSync = () => {
  if (revealFrame) return
  revealFrame = requestAnimationFrame(syncReveals)
}

window.addEventListener('scroll', queueRevealSync, { passive: true })
window.addEventListener('resize', queueRevealSync)
window.addEventListener('load', syncReveals)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') syncReveals()
})

/* --------------------------------------------------------------------------
   Mobile sticky CTA
   -------------------------------------------------------------------------- */

const mobileCta = document.querySelector('[data-mobile-cta]')
const heroSection = document.querySelector('.hero, .about-hero')

if (mobileCta && heroSection) {
  const syncCta = () => {
    const past = heroSection.getBoundingClientRect().bottom < 80
    mobileCta.classList.toggle('is-visible', past && window.innerWidth <= 1024)
    mobileCta.setAttribute('aria-hidden', String(!(past && window.innerWidth <= 1024)))
  }
  syncCta()
  window.addEventListener('scroll', syncCta, { passive: true })
  window.addEventListener('resize', syncCta)
}

/* --------------------------------------------------------------------------
   The 360° wheel
   -------------------------------------------------------------------------- */

const PILLARS = [
  { key: 'TRAIN', desc: 'in je horloge' },
  { key: 'BUILD', desc: 'kracht & mobiliteit' },
  { key: 'FUEL', desc: 'voeding mee' },
  { key: 'RECOVER', desc: 'slaap & stress' },
  { key: 'ANALYZE', desc: 'data, geen religie' },
  { key: 'ADAPT', desc: 'elke 2 weken' },
]

const wheelLabel = document.querySelector('[data-wheel-label]')
const wheelText = document.querySelector('[data-wheel-text]')

function buildWheelSvg() {
  const size = 640
  const mid = size / 2
  const radius = 222
  const pillW = 108
  const pillH = 40
  const centreR = 74

  let pieces = ''
  let connectors = ''

  PILLARS.forEach((pillar, index) => {
    const angle = -90 + index * 60
    const rad = (angle * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const x = mid + radius * cos
    const y = mid + radius * sin
    const dx = Math.round(cos * 215)
    const dy = Math.round(sin * 215)
    const rot = index % 2 === 0 ? -18 : 18

    pieces += `
      <g class="wheel__piece" data-pillar="${pillar.key}" tabindex="0" role="button" aria-label="${pillar.key}" style="--i:${index};--dx:${dx}px;--dy:${dy}px;--rot:${rot}deg">
        <rect class="wheel__pill" x="${(x - pillW / 2).toFixed(1)}" y="${(y - pillH / 2).toFixed(1)}" width="${pillW}" height="${pillH}" rx="20" />
        <text class="wheel__label" x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle">${pillar.key}</text>
        <text class="wheel__desc" x="${x.toFixed(1)}" y="${(y + pillH / 2 + 17).toFixed(1)}" text-anchor="middle">${pillar.desc}</text>
      </g>`

    const inner = centreR + 10
    const outer = radius - pillH / 2 - 10
    const sx = mid + inner * cos
    const sy = mid + inner * sin
    const ex = mid + outer * cos
    const ey = mid + outer * sin
    const mx = mid + ((inner + outer) / 2) * cos - sin * 16
    const my = mid + ((inner + outer) / 2) * sin + cos * 16

    connectors += `
      <path class="wheel__connector" d="M${sx.toFixed(1)} ${sy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" pathLength="1" stroke-dasharray="1" style="--i:${index}" marker-end="url(#wheel-arrow)" />`
  })

  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="De RWW 360° aanpak: training, kracht, voeding, herstel, analyse en bijsturing rond jou">
    <defs>
      <marker id="wheel-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#7A5238" />
      </marker>
    </defs>
    <circle class="wheel__ring" cx="${mid}" cy="${mid}" r="${radius}" stroke-dasharray="3 7" />
    <circle class="wheel__pulse" cx="${mid}" cy="${mid}" r="${centreR}" style="transform-box:fill-box;transform-origin:center" />
    ${connectors}
    <g class="wheel__centre-group" style="transform-box:fill-box;transform-origin:center">
      <circle class="wheel__centre" cx="${mid}" cy="${mid}" r="${centreR}" />
      <text class="wheel__centre-label" x="${mid}" y="${mid + 4}" text-anchor="middle">JIJ</text>
      <text class="wheel__centre-sub" x="${mid}" y="${mid + 22}" text-anchor="middle">werk · gezin · doel</text>
    </g>
    ${pieces}
  </svg>`
}

function initWheel(wheel) {
  const canvas = wheel.querySelector('[data-wheel-canvas]')
  if (!canvas) return
  canvas.innerHTML = buildWheelSvg()

  const copy = {}
  wheel.querySelectorAll('[data-wheel-copy] [data-pillar]').forEach((node) => {
    copy[node.dataset.pillar] = node.innerHTML.trim()
  })

  const pieces = Array.from(canvas.querySelectorAll('.wheel__piece'))
  let current = 'TRAIN'

  const activate = (key) => {
    if (!copy[key]) return
    current = key
    pieces.forEach((piece) => {
      const active = piece.dataset.pillar === key
      piece.classList.toggle('is-active', active)
      piece.setAttribute('aria-pressed', String(active))
    })
    if (wheelLabel) wheelLabel.textContent = key
    if (wheelText) wheelText.innerHTML = copy[key]
    if (accordion) {
      accordion.querySelectorAll('[data-accordion]').forEach((item) => {
        const open = item.dataset.accordion === key
        item.classList.toggle('is-open', open)
        const button = item.querySelector('button')
        if (button) button.setAttribute('aria-expanded', String(open))
      })
    }
  }

  const accordion = document.querySelector('[data-wheel-accordion]')
  if (accordion) {
    accordion.innerHTML = PILLARS.map(
      (pillar) => `
      <div class="wheel-accordion__item" data-accordion="${pillar.key}">
        <button class="wheel-accordion__btn" type="button" aria-expanded="false">
          <span class="wheel-accordion__name">${pillar.key}</span>
          <span class="wheel-accordion__plus" aria-hidden="true">+</span>
        </button>
        <div class="wheel-accordion__panel"><p>${copy[pillar.key] || ''}</p></div>
      </div>`,
    ).join('')

    accordion.addEventListener('click', (event) => {
      const button = event.target.closest('button')
      if (!button) return
      const item = button.closest('[data-accordion]')
      const key = item.dataset.accordion

      if (key === current) {
        current = ''
        pieces.forEach((piece) => {
          piece.classList.remove('is-active')
          piece.setAttribute('aria-pressed', 'false')
        })
        if (wheelLabel) wheelLabel.textContent = ''
        if (wheelText) wheelText.textContent = ''
        accordion.querySelectorAll('[data-accordion]').forEach((entry) => {
          entry.classList.remove('is-open')
          const entryButton = entry.querySelector('button')
          if (entryButton) entryButton.setAttribute('aria-expanded', 'false')
        })
        return
      }

      activate(key)
    })
  }

  pieces.forEach((piece) => {
    const key = piece.dataset.pillar
    piece.addEventListener('pointerenter', () => activate(key))
    piece.addEventListener('focus', () => activate(key))
    piece.addEventListener('click', () => activate(key))
    piece.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        activate(key)
      }
    })
  })

  activate('TRAIN')

  const startAnimation = () => {
    if (reduceMotion) return
    wheel.classList.add('is-animating')
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.4 },
    )
    observer.observe(wheel)
  } else {
    startAnimation()
  }
}

document.querySelectorAll('[data-wheel]').forEach(initWheel)

/* --------------------------------------------------------------------------
   Case filters
   -------------------------------------------------------------------------- */

const filterChips = document.querySelectorAll('[data-filter]')

if (filterChips.length) {
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter
      filterChips.forEach((other) => {
        const active = other === chip
        other.classList.toggle('is-active', active)
        other.setAttribute('aria-pressed', String(active))
      })
      document.querySelectorAll('[data-case]').forEach((card) => {
        const categories = (card.dataset.case || '').split(' ')
        card.hidden = filter !== 'alles' && !categories.includes(filter)
      })
    })
  })
}

/* --------------------------------------------------------------------------
   Video tiles (activates as soon as a source is supplied)
   -------------------------------------------------------------------------- */

document.querySelectorAll('[data-video-tile]').forEach((tile) => {
  const src = tile.dataset.src
  if (!src) return
  tile.dataset.playable = 'true'
  const play = document.createElement('span')
  play.className = 'video-tile__play'
  play.setAttribute('aria-hidden', 'true')
  play.textContent = '▶'
  tile.appendChild(play)
  tile.setAttribute('role', 'button')
  tile.setAttribute('tabindex', '0')
  tile.setAttribute('aria-label', `Speel de testimonial af: ${tile.dataset.name || ''}`)

  const playTile = () => {
    if (tile.querySelector('video')) return
    const video = document.createElement('video')
    video.src = src
    video.controls = true
    video.autoplay = true
    video.playsInline = true
    if (tile.dataset.poster) video.poster = tile.dataset.poster
    tile.appendChild(video)
    video.play().catch(() => {})
  }

  tile.addEventListener('click', playTile)
  tile.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      playTile()
    }
  })
})

/* --------------------------------------------------------------------------
   Contact form
   -------------------------------------------------------------------------- */

document.querySelectorAll('[data-contact-form]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const status = form.querySelector('[data-form-status]')
    const button = form.querySelector('button[type="submit"]')
    const payload = Object.fromEntries(new FormData(form).entries())

    const show = (message, variant) => {
      if (!status) return
      status.textContent = message
      status.className = `form__status is-visible form__status--${variant}`
    }

    if (!config.formEndpoint) {
      show(
        'Het formulier is nog niet gekoppeld. Boek intussen direct een gratis intake, dan spreken we je snel.',
        'error',
      )
      return
    }

    if (button) {
      button.disabled = true
      button.textContent = 'Versturen…'
    }

    try {
      const response = await fetch(config.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, tag: 'website-contact', page: window.location.pathname }),
      })
      if (!response.ok) throw new Error('Request failed')
      form.reset()
      show('Bedankt. Je bericht is binnen — je hoort snel van ons.', 'ok')
      track('Lead', { content_name: 'Contactformulier' })
    } catch (error) {
      show('Er ging iets mis bij het versturen. Probeer het opnieuw of boek direct een intake.', 'error')
    } finally {
      if (button) {
        button.disabled = false
        button.textContent = button.dataset.label || 'Verstuur bericht'
      }
    }
  })
})

/* --------------------------------------------------------------------------
   WhatsApp + webshop + Instagram links from config
   -------------------------------------------------------------------------- */

document.querySelectorAll('[data-whatsapp]').forEach((link) => {
  if (!config.whatsappNumber) {
    link.hidden = true
    return
  }
  link.href = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(config.whatsappMessage)}`
})

document.querySelectorAll('[data-instagram]').forEach((link) => {
  link.href = config.instagramUrl
})

document.querySelectorAll('[data-webshop]').forEach((link) => {
  link.href = config.webshopUrl
})

/* --------------------------------------------------------------------------
   UTM handling — carried from the ad click into the intake booking
   -------------------------------------------------------------------------- */

const UTM_KEY = 'rww-utm'
const searchParams = new URLSearchParams(window.location.search)
const utmFromUrl = Array.from(searchParams.entries()).filter(([key]) => key.startsWith('utm_'))

if (utmFromUrl.length) {
  try {
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utmFromUrl))
  } catch (error) {
    /* storage unavailable */
  }
}

const storedUtm = (() => {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) || '[]')
  } catch (error) {
    return []
  }
})()

if (storedUtm.length) {
  const query = new URLSearchParams(storedUtm).toString()
  document.querySelectorAll('a[href^="intake"]').forEach((link) => {
    const base = link.getAttribute('href').split('?')[0].split('#')[0]
    link.setAttribute('href', `${base}?${query}`)
  })
  document.querySelectorAll('[data-calendar]').forEach((frame) => {
    const base = frame.dataset.calendar
    if (!base) return
    frame.src = `${base}${base.includes('?') ? '&' : '?'}${query}`
  })
}

/* --------------------------------------------------------------------------
   Consent + analytics
   -------------------------------------------------------------------------- */

const CONSENT_KEY = 'rww-consent'
let analyticsLoaded = false

function readConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY)
  } catch (error) {
    return null
  }
}

function loadAnalytics() {
  if (analyticsLoaded) return
  analyticsLoaded = true

  if (config.ga4Id) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`
    document.head.appendChild(script)
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', config.ga4Id, { anonymize_ip: true })
  }

  if (config.clarityId) {
    ;(function clarity(c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function clarityStub() {
          ;(c[a].q = c[a].q || []).push(arguments)
        }
      t = l.createElement(r)
      t.async = 1
      t.src = 'https://www.clarity.ms/tag/' + i
      y = l.getElementsByTagName(r)[0]
      y.parentNode.insertBefore(t, y)
    })(window, document, 'clarity', 'script', config.clarityId)
  }

  if (config.metaPixelId) {
    ;(function metaPixel(f, b, e, v, n, t, s) {
      if (f.fbq) return
      n = f.fbq = function metaPixelStub() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = true
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = true
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    window.fbq('init', config.metaPixelId)
    window.fbq('track', 'PageView')
  }
}

function track(name, data = {}) {
  if (readConsent() !== 'granted') return
  if (typeof window.fbq === 'function') window.fbq('track', name, data)
  if (typeof window.gtag === 'function') window.gtag('event', name, data)
}

window.rwwTrack = track

const consentBanner = document.querySelector('[data-consent]')

if (consentBanner) {
  if (!readConsent()) consentBanner.classList.add('is-visible')

  const choose = (value) => {
    try {
      localStorage.setItem(CONSENT_KEY, value)
    } catch (error) {
      /* storage unavailable */
    }
    consentBanner.classList.remove('is-visible')
    if (value === 'granted') {
      loadAnalytics()
      track('PageView')
    }
  }

  consentBanner.querySelectorAll('[data-consent-choice]').forEach((button) => {
    button.addEventListener('click', () => choose(button.dataset.consentChoice))
  })
}

if (readConsent() === 'granted') {
  loadAnalytics()
  track('PageView')
}

const pageEvent = document.body.dataset.pageEvent
if (pageEvent) {
  if (pageEvent === 'ViewContent') track('ViewContent', { content_name: document.title })
  if (pageEvent === 'Schedule') track('Schedule', { content_name: 'Intake geboekt' })
}

/* --------------------------------------------------------------------------
   Small stuff
   -------------------------------------------------------------------------- */

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear())
})

document.querySelectorAll('[data-submit-label]').forEach((button) => {
  button.dataset.label = button.textContent
})
