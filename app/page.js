'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [goals, setGoals] = useState([])
  const [newGoal, setNewGoal] = useState('')
  const [loading, setLoading] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const [chatLog, setChatLog] = useState([])
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    fetchGoals()
  }, [])

  async function fetchGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setGoals(data)
    setLoading(false)
  }

  async function addGoal(e) {
    e.preventDefault()
    if (!newGoal.trim()) return
    const { error } = await supabase.from('goals').insert({ title: newGoal })
    if (!error) {
      setNewGoal('')
      fetchGoals()
    }
  }

  async function toggleGoal(goal) {
    await supabase.from('goals').update({ done: !goal.done }).eq('id', goal.id)
    fetchGoals()
  }

  async function deleteGoal(id) {
    await supabase.from('goals').delete().eq('id', id)
    fetchGoals()
  }

  async function sendChat(e) {
    e.preventDefault()
    if (!chatInput.trim()) return
    const userMsg = chatInput
    setChatLog((log) => [...log, { role: 'user', text: userMsg }])
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setChatLog((log) => [...log, { role: 'mentor', text: data.reply }])
    } catch (err) {
      setChatLog((log) => [...log, { role: 'mentor', text: 'Fehler beim Verbinden mit dem Mentor.' }])
    }

    setChatLoading(false)
  }

  return (
    <div className="container">
      <h1>AI Mentor App</h1>
      <p>Setze dir Ziele und lass dich vom KI-Mentor coachen.</p>

      <div className="card">
        <h2>Meine Ziele</h2>
        <form onSubmit={addGoal}>
          <input
            type="text"
            placeholder="Neues Ziel eingeben..."
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
          />
          <button type="submit">Ziel hinzufuegen</button>
        </form>

        {loading ? (
          <p>Lade Ziele...</p>
        ) : goals.length === 0 ? (
          <p>Noch keine Ziele. Fuege dein erstes Ziel hinzu!</p>
        ) : (
          <div>
            {goals.map((goal) => (
              <div key={goal.id} className={`goal-item ${goal.done ? 'done' : ''}`}>
                <input
                  type="checkbox"
                  checked={goal.done}
                  onChange={() => toggleGoal(goal)}
                />
                <span style={{ flex: 1 }}>{goal.title}</span>
                <button onClick={() => deleteGoal(goal.id)}>Loeschen</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>KI-Mentor Chat</h2>
        <div className="chat-log">
          {chatLog.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}`}>
              <b>{msg.role === 'user' ? 'Du' : 'Mentor'}:</b> {msg.text}
            </div>
          ))}
          {chatLoading && <div className="chat-msg mentor"><b>Mentor:</b> ...</div>}
        </div>
        <form onSubmit={sendChat}>
          <textarea
            rows={2}
            placeholder="Frag deinen Mentor..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button type="submit">Senden</button>
        </form>
      </div>
    </div>
  )
}
