import React from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis,
  Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts'

/**
 * Score visualization chart.
 * Props:
 *  - answers: { feedback: { score, content_score, delivery_score } }[]
 *  - type: 'radar' | 'bar'
 */
export default function ScoreChart({ answers = [], type = 'bar' }) {
  if (answers.length === 0) return null

  // Bar chart — per-question scores
  const barData = answers.map((a, i) => ({
    name: `Q${i + 1}`,
    content: a.feedback?.content_score?.overall_score ?? a.feedback?.score ?? 0,
    delivery: a.feedback?.delivery_score?.delivery_score ?? 0,
  }))

  // Radar chart — aggregate across all dimensions
  const radarData = [
    { subject: 'Relevance', value: avgDim(answers, 'relevance_score') },
    { subject: 'Depth', value: avgDim(answers, 'depth_score') },
    { subject: 'Clarity', value: avgDim(answers, 'clarity_score') },
    { subject: 'Confidence', value: avgDim(answers, 'confidence_score') },
    { subject: 'STAR', value: avgDim(answers, 'star_score') },
    { subject: 'Delivery', value: avgDelivery(answers) },
  ]

  const ACCENT = '#22c55e'
  const BLUE = '#3b82f6'

  if (type === 'radar') {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#1e1e2e" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'DM Sans' }} />
          <Radar name="Score" dataKey="value" stroke={ACCENT} fill={ACCENT} fillOpacity={0.15} strokeWidth={2} />
          <Tooltip
            contentStyle={{ background: '#16161f', border: '1px solid #1e1e2e', borderRadius: 12, color: '#f9fafb', fontSize: 12 }}
            cursor={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={barData} barSize={16} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#16161f', border: '1px solid #1e1e2e', borderRadius: 12, color: '#f9fafb', fontSize: 12 }}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar name="Content" dataKey="content" radius={[4, 4, 0, 0]} fill={ACCENT}>
          {barData.map((entry, i) => (
            <Cell key={i} fill={entry.content >= 80 ? ACCENT : entry.content >= 55 ? '#eab308' : '#ef4444'} />
          ))}
        </Bar>
        <Bar name="Delivery" dataKey="delivery" radius={[4, 4, 0, 0]} fill={BLUE}>
          {barData.map((entry, i) => (
            <Cell key={i} fill={entry.delivery >= 80 ? BLUE : entry.delivery >= 55 ? '#8b5cf6' : '#f97316'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Average a content_score dimension across all answers */
function avgDim(answers, key) {
  const vals = answers
    .map((a) => a.feedback?.content_score?.[key])
    .filter((v) => typeof v === 'number')
  if (!vals.length) return 0
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
}

/** Average delivery score across all answers */
function avgDelivery(answers) {
  const vals = answers
    .map((a) => a.feedback?.delivery_score?.delivery_score)
    .filter((v) => typeof v === 'number')
  if (!vals.length) return 0
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
}
