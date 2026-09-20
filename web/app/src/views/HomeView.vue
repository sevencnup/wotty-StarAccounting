<template>
  <div class="home-page">
    <div class="home-scroll">
      <section class="hero-shell">
        <div class="hero-card">
          <div class="hero-top">
            <p class="hero-title">Good<br>morning, Alex</p>
            <div class="hero-avatar">
              <div class="avatar-frame">
                <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                  <circle cx="32" cy="32" r="32" fill="#e9eef9" />
                  <ellipse cx="32" cy="47.5" rx="17" ry="12" fill="#8c623d" />
                  <circle cx="32" cy="25" r="12.5" fill="#f1c59d" />
                  <path d="M17.5 25.2c1.6-9.1 7.5-15 14.5-15s12.9 5.9 14.5 15c-1.7-1.5-4.9-3.3-8.2-3.3-2.7 0-4.8 1-6.3 2.3-1.6-1.3-3.7-2.3-6.4-2.3-3.2 0-6.4 1.8-8.1 3.3Z" fill="#3a2a22" />
                  <circle cx="27" cy="25.5" r="1.4" fill="#241912" />
                  <circle cx="37" cy="25.5" r="1.4" fill="#241912" />
                  <path d="M29 32.2c1.6 1.2 4.4 1.2 6 0" stroke="#bb7352" stroke-width="1.8" stroke-linecap="round" />
                  <circle cx="27" cy="24.8" r="6.3" stroke="#263648" stroke-width="2" opacity="0.7" />
                  <circle cx="37" cy="24.8" r="6.3" stroke="#263648" stroke-width="2" opacity="0.7" />
                  <path d="M31.2 24.8h1.6" stroke="#263648" stroke-width="1.9" opacity="0.7" />
                </svg>
              </div>
              <span class="avatar-badge">
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="8" fill="#2f88ff" />
                  <path d="M4.5 8.1 6.8 10.3 11.4 5.7" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </div>
          </div>

          <div class="hero-glow hero-glow-top" aria-hidden="true"></div>
          <div class="hero-glow hero-glow-bottom" aria-hidden="true"></div>
        </div>

        <div class="balance-card">
          <p class="balance-label">Balance</p>
          <p class="balance-value">$8,742.36</p>
          <p class="balance-trend">+ $231 this month</p>
          <div class="balance-rings" aria-hidden="true">
            <span class="ring ring-a"></span>
            <span class="ring ring-b"></span>
            <span class="ring ring-c"></span>
          </div>
        </div>
      </section>

      <section class="stats-grid">
        <article class="stat-card" v-for="stat in stats" :key="stat.label">
          <span class="stat-icon" :class="stat.iconClass" aria-hidden="true">
            <component :is="stat.icon" />
          </span>
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ stat.value }}</p>
        </article>
      </section>

      <section class="spending-card">
        <div class="section-head">
          <h2 class="section-title">Spending this month</h2>
          <span class="head-pill">View all</span>
        </div>

        <div class="spending-body">
          <div class="donut-wrap">
            <canvas ref="donutCanvas" width="144" height="144"></canvas>
          </div>

          <div class="legend-list">
            <div class="legend-item legend-item-primary">
              <span class="legend-dot legend-blue"></span>
              <div>
                <p class="legend-name">Food &amp; Drink</p>
                <p class="legend-number">18%</p>
              </div>
            </div>
            <div class="legend-item">
              <span class="legend-dot legend-cyan"></span>
              <div>
                <p class="legend-name">Transport</p>
              </div>
            </div>
            <div class="legend-item">
              <span class="legend-dot legend-purple"></span>
              <div>
                <p class="legend-name">Shopping</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="merchant-row">
        <article class="merchant-pill" v-for="merchant in merchants" :key="merchant.name">
          <span class="merchant-logo" :class="merchant.logoClass" aria-hidden="true">
            <span v-if="merchant.mark === 'starbucks'" class="merchant-mark merchant-mark-starbucks">+</span>
            <span v-else-if="merchant.mark === 'uber'" class="merchant-mark merchant-mark-uber">UBER</span>
            <span v-else class="merchant-mark merchant-mark-amazon">a</span>
          </span>
          <div class="merchant-copy">
            <p class="merchant-name">{{ merchant.name }}</p>
            <p class="merchant-value">{{ merchant.value }}</p>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup>
import { h, onMounted, ref } from 'vue'

const IconSpent = {
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('circle', { cx: '12', cy: '12', r: '9.2', fill: '#2d8cff' }),
      h('path', {
        d: 'M8.4 12.4 10.8 14.8 15.6 10',
        stroke: '#fff',
        'stroke-width': '2.1',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      })
    ])
}

const IconSaved = {
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', {
        d: 'M7 10.8c0-1.8 1.2-3.1 3.1-3.1h.8c0-2.1 1.5-3.6 3.6-3.6 2.3 0 3.9 1.7 3.9 4 0 .6-.1 1.5-.5 2.3l-.2.3c1.1.4 1.9 1.4 1.9 2.7 0 1.9-1.5 3.2-3.5 3.2H10c-1.8 0-3-1.1-3-2.9v-2.9Z',
        fill: '#ff9eb2'
      }),
      h('circle', { cx: '15.6', cy: '8.9', r: '1', fill: '#ffd5de' })
    ])
}

const IconLoans = {
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('circle', { cx: '12', cy: '12', r: '8.7', fill: '#f0f6ff', stroke: '#2a85ff', 'stroke-width': '1.4' }),
      h('circle', { cx: '12', cy: '12', r: '3.7', fill: '#d6ebff', stroke: '#2a85ff', 'stroke-width': '1.4' }),
      h('circle', { cx: '12', cy: '12', r: '1.1', fill: '#2a85ff' })
    ])
}

const IconCashback = {
  render: () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
      h('rect', { x: '4.4', y: '6.8', width: '15.2', height: '10.4', rx: '2.4', fill: '#4a90ff' }),
      h('path', { d: 'M7.5 10.5h8.8', stroke: '#fff', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
      h('path', { d: 'M7.5 13.6h4.4', stroke: '#fff', 'stroke-width': '1.5', 'stroke-linecap': 'round', opacity: '0.85' })
    ])
}

const stats = [
  { label: 'Spent', value: '$1,834', icon: IconSpent, iconClass: 'stat-icon-blue' },
  { label: 'Saved', value: '$920', icon: IconSaved, iconClass: 'stat-icon-pink' },
  { label: 'Loans', value: '$3,200', icon: IconLoans, iconClass: 'stat-icon-blue' },
  { label: 'Cashback', value: '$47', icon: IconCashback, iconClass: 'stat-icon-blue' }
]

const merchants = [
  { name: 'Starbucks', value: '$42', logoClass: 'merchant-logo-starbucks', mark: 'starbucks' },
  { name: 'Uber', value: '$19', logoClass: 'merchant-logo-uber', mark: 'uber' },
  { name: 'Amazon', value: '$87', logoClass: 'merchant-logo-amazon', mark: 'amazon' }
]

const donutCanvas = ref(null)

onMounted(() => {
  const canvas = donutCanvas.value
  if (!canvas) {
    return
  }

  const context = canvas.getContext('2d')
  if (!context) {
    return
  }

  const centerX = 72
  const centerY = 72
  const radius = 48
  const lineWidth = 19
  const gap = 0.032
  const slices = [
    { size: 0.52, color: '#2469de' },
    { size: 0.22, color: '#3f93f7' },
    { size: 0.16, color: '#4cd0cb' },
    { size: 0.10, color: '#9a4edf' }
  ]

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.lineWidth = lineWidth
  context.lineCap = 'butt'

  let startAngle = -Math.PI / 2
  slices.forEach((slice) => {
    const endAngle = startAngle + slice.size * Math.PI * 2
    context.beginPath()
    context.arc(centerX, centerY, radius, startAngle, endAngle)
    context.strokeStyle = slice.color
    context.stroke()
    startAngle = endAngle + gap
  })
})
</script>

<style scoped>
.home-page {
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(102, 156, 255, 0.13), transparent 29%),
    linear-gradient(180deg, #f8fbff 0%, #eff4fb 42%, #e9eff8 100%);
}

.home-scroll {
  min-height: 100%;
  overflow-y: auto;
  padding: 14px 0 calc(var(--bottom-nav-height) + 26px);
  scrollbar-width: none;
}

.home-scroll::-webkit-scrollbar {
  display: none;
}

.hero-shell {
  padding: 0 14px;
  position: relative;
}

.hero-card {
  position: relative;
  overflow: hidden;
  border-radius: 33px;
  min-height: 264px;
  padding: 16px 18px 20px;
  background: linear-gradient(138deg, #3f95ff 0%, #266fdf 44%, #0d54c7 100%);
  box-shadow:
    0 18px 32px rgba(29, 79, 166, 0.19),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.hero-card::before {
  content: '';
  position: absolute;
  top: -38px;
  right: -72px;
  width: 198px;
  height: 198px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.075);
}

.hero-card::after {
  content: '';
  position: absolute;
  right: -20px;
  bottom: -8px;
  width: 170px;
  height: 100px;
  border-radius: 38px 0 34px 0;
  background: linear-gradient(135deg, rgba(67, 137, 252, 0.42), rgba(12, 72, 183, 0.72));
}

.hero-top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.hero-title {
  color: #fff;
  font-size: 25px;
  line-height: 1.08;
  font-weight: 900;
  letter-spacing: -0.5px;
  text-shadow: 0 4px 12px rgba(11, 53, 122, 0.16);
  margin-top: 26px;
}

.hero-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  margin-top: 22px;
  flex: 0 0 auto;
}

.avatar-frame {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.82);
  background: rgba(255, 255, 255, 0.14);
  box-shadow: 0 8px 18px rgba(7, 48, 121, 0.16);
}

.avatar-frame svg {
  display: block;
  width: 100%;
  height: 100%;
}

.avatar-badge {
  position: absolute;
  right: -1px;
  bottom: 1px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #fff;
}

.avatar-badge svg {
  display: block;
  width: 100%;
  height: 100%;
}

.balance-label,
.balance-value,
.balance-trend {
  position: relative;
  z-index: 1;
}

.balance-label {
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  font-weight: 700;
}

.balance-value {
  margin-top: 10px;
  color: #fff;
  font-size: 29px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.9px;
}

.balance-trend {
  margin-top: 13px;
  color: #98f276;
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
}

.balance-rings {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.09);
}

.ring-a {
  width: 154px;
  height: 154px;
  right: -6px;
  top: -6px;
  background: rgba(255, 255, 255, 0.045);
}

.ring-b {
  width: 126px;
  height: 126px;
  right: 13px;
  top: 14px;
  background: rgba(255, 255, 255, 0.03);
}

.ring-c {
  width: 98px;
  height: 98px;
  right: 28px;
  top: 29px;
  background: rgba(255, 255, 255, 0.018);
}

.hero-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
}

.hero-glow-top {
  top: -62px;
  right: -14px;
  width: 186px;
  height: 186px;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.hero-glow-bottom {
  right: 18px;
  bottom: 40px;
  width: 112px;
  height: 112px;
  background: rgba(255, 255, 255, 0.02);
}

.balance-card {
  position: relative;
  z-index: 3;
  overflow: hidden;
  margin: -68px 18px 0;
  border-radius: 21px;
  min-height: 136px;
  padding: 17px 18px 18px;
  background:
    linear-gradient(135deg, #3e91fb 0%, #2a7af0 45%, #2168e4 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 12px 22px rgba(24, 84, 184, 0.18);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 16px 14px 0;
}

.stat-card {
  min-height: 102px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 12px 24px rgba(60, 93, 150, 0.08);
  padding: 13px 7px 11px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-blue {
  background: #edf4ff;
}

.stat-icon-pink {
  background: #fff2f5;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-label {
  margin-top: 8px;
  color: #707a91;
  font-size: 11px;
  line-height: 1.1;
}

.stat-value {
  margin-top: 8px;
  color: #101726;
  font-size: 16px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
}

.spending-card {
  margin: 16px 14px 0;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 14px 28px rgba(60, 93, 150, 0.08);
  padding: 18px 16px 17px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title {
  color: #111827;
  font-size: 18px;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0;
}

.head-pill {
  min-width: 68px;
  height: 29px;
  border-radius: 999px;
  background: #eef4ff;
  color: #3689ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.spending-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
}

.donut-wrap {
  width: 150px;
  height: 150px;
  flex: 0 0 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-wrap canvas {
  width: 142px;
  height: 142px;
  display: block;
}

.legend-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.legend-item-primary {
  margin-top: 8px;
}

.legend-dot {
  width: 11px;
  height: 11px;
  margin-top: 5px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.legend-blue {
  background: #2469de;
}

.legend-cyan {
  background: #4cd0cb;
}

.legend-purple {
  background: #9a4edf;
}

.legend-name {
  color: #1d2432;
  font-size: 13px;
  line-height: 1.14;
  font-weight: 800;
}

.legend-number {
  margin-top: 8px;
  color: #0f1728;
  font-size: 15px;
  line-height: 1;
  font-weight: 900;
}

.merchant-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  padding: 15px 14px 0;
}

.merchant-pill {
  min-height: 64px;
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 12px 24px rgba(60, 93, 150, 0.08);
  padding: 9px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.merchant-logo {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.merchant-logo-starbucks {
  background: #0b7b52;
}

.merchant-logo-uber {
  background: #0d0d0d;
}

.merchant-logo-amazon {
  background: #fff7e7;
  box-shadow: inset 0 0 0 1px rgba(228, 200, 145, 0.42);
}

.merchant-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.merchant-mark-starbucks {
  color: #fff;
  font-size: 18px;
  line-height: 1;
  font-weight: 500;
}

.merchant-mark-uber {
  color: #fff;
  font-size: 6px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0.4px;
}

.merchant-mark-amazon {
  color: #161616;
  font-size: 22px;
  line-height: 1;
  font-weight: 800;
}

.merchant-copy {
  min-width: 0;
}

.merchant-name {
  color: #1a2230;
  font-size: 10px;
  line-height: 1.1;
  font-weight: 700;
  white-space: nowrap;
}

.merchant-value {
  margin-top: 6px;
  color: #111827;
  font-size: 12px;
  line-height: 1;
  font-weight: 900;
}

@media (max-width: 360px) {
  .hero-card {
    min-height: 250px;
    padding-left: 14px;
    padding-right: 14px;
  }

  .balance-card {
    margin-top: -62px;
    margin-left: 15px;
    margin-right: 15px;
  }

  .hero-title {
    font-size: 22px;
  }

  .balance-value {
    font-size: 28px;
  }

  .stats-grid {
    gap: 6px;
  }

  .spending-body {
    gap: 0;
  }

  .donut-wrap {
    width: 136px;
    height: 136px;
    flex-basis: 136px;
  }

  .donut-wrap canvas {
    width: 132px;
    height: 132px;
  }
}
</style>
