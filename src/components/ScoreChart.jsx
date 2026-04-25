import React from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis,
  Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts'

/**
 * Props:
 *  - answers: { questionText, feedback: { score, categories } }[]
 *  - type: 'radar' | 'bar'
 */
export default function ScoreChart({ answers = [], type = 'bar' }) {
  if (answers.length === 0) return null

  const barData = answers.map((a, i) => ({
    name: `Q${i + 1}`,
    score: a.feedback?.score ?? 0,
  }))

  const radarData = [
    { subject: 'Clarity', value: avg(answers, 'clarity') },
    { subject: 'Relevance', value: avg(answers, 'relevance') },
    { subject: 'Confidence', value: avg(answers, 'confidence') },
    { subject: 'Structure', value: avg(answers, 'structure') },
    { subject: 'Delivery', value: avg(answers, 'delivery') },
  ]

  const GREEN = '#22c55e'
  const DIM = '#16a34a'

  if (type === 'radar') {
    return (
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#1e1e2e" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'DM Sans' }} />
          <Radar name="Score" dataKey="value" stroke={GREEN} fill={GREEN} fillOpacity={0.15} strokeWidth={2} />
          <Tooltip
            contentStyle={{ background: '#16161f', border: '1px solid #1e1e2e', borderRadius: 12, color: '#f9fafb', fontSize: 12 }}
            cursor={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={barData} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#16161f', border: '1px solid #1e1e2e', borderRadius: 12, color: '#f9fafb', fontSize: 12 }}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
          {barData.map((entry, i) => (
            <Cell key={i} fill={entry.score >= 80 ? GREEN : entry.score >= 55 ? '#eab308' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function avg(answers, key) {
  const vals = answers
    .map((a) => a.feedback?.categories?.[key])
    .filter((v) => typeof v === 'number')
  if (!vals.length) return Math.floor(Math.random() * 30 + 60) // demo fallback
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
}
