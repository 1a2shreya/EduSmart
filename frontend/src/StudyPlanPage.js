import React, { useEffect, useState } from "react";
import api from "./Api";

/* ─────────────────────────────────────────────────────────
   Utilities
───────────────────────────────────────────────────────── */
const clone = (x) => {
  try { return structuredClone(x); }
  catch { return JSON.parse(JSON.stringify(x)); }
};

const computeProgress = (plan) => {
  const weeks = plan?.plan_data?.weeks || [];
  const total = weeks.reduce((s, w) => s + (w?.tasks?.length || 0), 0);
  const done = weeks.reduce((s, w) => s + (w?.tasks || []).filter((t) => t?.done).length, 0);
  return total ? Math.round((done / total) * 100) : 0;
};

const normalizePlan = (raw) => {
  if (!raw) return null;
  const p = clone(raw);
  const pd = p.plan_data || {};
  pd.weeks = (pd.weeks || []).map((w, i) => ({
    ...w,
    title: w.title || `Week ${i + 1}`,
    tasks: (w.tasks || []).map((t) => ({
      ...t,
      title: t.title || t.topic || "Task",
      done: !!t.done,
      resources: (t.resources || []).map((r) =>
        typeof r === "string"
          ? { title: r, url: r, type: "article", visited: false }
          : { title: r.title || r.label || "Resource", url: r.url || r.href || "#", type: r.type || "article", visited: !!r.visited }
      ),
    })),
  }));
  pd.extra = pd.extra || [];
  p.plan_data = pd;
  p.progress = computeProgress(p);
  return p;
};

const PLATFORM_COLORS = {
  youtube: { bg: "#FF0000", label: "▶ YouTube" },
  coursera: { bg: "#0056D3", label: "🎓 Coursera" },
  edx: { bg: "#02262B", label: "📘 edX" },
  video: { bg: "#FF0000", label: "▶ Video" },
  article: { bg: "#374151", label: "📄 Article" },
  course: { bg: "#0056D3", label: "🎓 Course" },
  doc: { bg: "#059669", label: "📖 Docs" },
};

function getResourceStyle(r) {
  const url = (r.url || "").toLowerCase();
  const type = (r.type || "").toLowerCase();
  if (url.includes("youtube")) return PLATFORM_COLORS.youtube;
  if (url.includes("coursera")) return PLATFORM_COLORS.coursera;
  if (url.includes("edx")) return PLATFORM_COLORS.edx;
  return PLATFORM_COLORS[type] || PLATFORM_COLORS.article;
}

function serverMsg(err, fallback) {
  return err?.response?.data?.error ||
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    fallback;
}

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [msg, onClose]);

  const colors = {
    success: "#059669", danger: "#DC2626", warning: "#D97706", info: "#2563EB"
  };
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: colors[type] || colors.info,
      color: "#fff", padding: "12px 20px", borderRadius: 10,
      fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      animation: "slideUp .3s ease",
      maxWidth: 340,
    }}>
      {msg}
      <button onClick={onClose} style={{
        background: "none", border: "none", color: "#fff",
        marginLeft: 12, cursor: "pointer", fontSize: 16, lineHeight: 1,
      }}>×</button>
    </div>
  );
}

function ProgressRing({ pct, size = 80, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct === 100 ? "#059669" : pct > 50 ? "#2563EB" : "#D97706";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#e5e7eb" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset .6s ease" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px` }}
        fill={color} fontSize={size * 0.22} fontWeight={700} fontFamily="sans-serif">
        {pct}%
      </text>
    </svg>
  );
}

function ResourceLink({ r }) {
  const style = getResourceStyle(r);
  return (
    <a href={r.url} target="_blank" rel="noreferrer"
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: style.bg, color: "#fff",
        padding: "4px 10px", borderRadius: 6,
        fontSize: 12, fontWeight: 600, textDecoration: "none",
        marginRight: 6, marginBottom: 6,
        opacity: r.visited ? 0.6 : 1,
        transition: "opacity .2s, transform .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "none"}
    >
      {style.label}
      {r.visited && <span style={{ fontSize: 10 }}>✓</span>}
    </a>
  );
}

function TaskItem({ task, weekIdx, taskIdx, onToggle, onResourceClick, onStartQuiz }) {
  const isQuiz = task.type === "quiz";
  const hasResources = task.resources?.length > 0;
  const quizPassed = task.quiz_passed === true;
  const quizFailed = task.quiz_passed === false && task.quiz_score != null;
  const quizScore = task.quiz_score;

  return (
    <div style={{
      background: task.done ? "rgba(16,185,129,0.08)" : quizFailed ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${task.done ? "rgba(16,185,129,0.2)" : quizFailed ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 10, padding: "12px 16px", marginBottom: 8,
      transition: "all .2s ease",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Checkbox */}
        <div style={{ paddingTop: 2 }}>
          {isQuiz ? (
            <span title={quizPassed ? "Quiz passed" : "Completes automatically after quiz"}
              style={{ fontSize: 18, opacity: quizPassed ? 1 : 0.4, cursor: "default" }}>
              {quizPassed ? "✅" : "🎯"}
            </span>
          ) : (
            <input type="checkbox" checked={task.done}
              onChange={() => onToggle(weekIdx, taskIdx, task)}
              style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#2563EB" }} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{
              fontWeight: 600, fontSize: 14,
              color: task.done ? "#64748b" : "#e2e8f0",
              textDecoration: task.done ? "line-through" : "none",
            }}>
              {task.title}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
              background: isQuiz ? (quizPassed ? "#d1fae5" : quizFailed ? "#fee2e2" : "#fef3c7")
                : task.done ? "#d1fae5" : "#dbeafe",
              color: isQuiz ? (quizPassed ? "#065f46" : quizFailed ? "#dc2626" : "#92400e")
                : task.done ? "#065f46" : "#1e40af",
            }}>
              {isQuiz ? "quiz" : task.type || "reading"}
            </span>
            {task.done && (
              <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>✓ Done</span>
            )}
            {quizScore != null && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: quizPassed ? "#d1fae5" : "#fee2e2",
                color: quizPassed ? "#065f46" : "#dc2626",
              }}>
                Score: {quizScore}%
              </span>
            )}
          </div>

          {task.description && (
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 8px", lineHeight: 1.5 }}>
              {task.description}
            </p>
          )}

          {isQuiz && (
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {quizPassed ? (
                <span style={{
                  fontSize: 13, fontWeight: 700, color: "#059669",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  ✅ Quiz Passed ({quizScore}%)
                </span>
              ) : quizFailed ? (
                <>
                  <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                    ❌ Score: {quizScore}% (Need 60% to pass)
                  </span>
                  <button type="button" className="sp-btn"
                    style={{ fontSize: 12, padding: "6px 14px", background: "#f59e0b", color: "#fff" }}
                    onClick={() => onStartQuiz && onStartQuiz(task, weekIdx, taskIdx)}>
                    🔄 Retry Quiz
                  </button>
                </>
              ) : (
                <button type="button" className="sp-btn sp-btn-primary"
                  style={{ fontSize: 12, padding: "6px 14px" }}
                  onClick={() => onStartQuiz && onStartQuiz(task, weekIdx, taskIdx)}>
                  🎯 Start Quiz
                </button>
              )}
            </div>
          )}

          {hasResources && (
            <div style={{ marginTop: 6 }}>
              {task.resources.map((r, ri) => (
                <span key={ri} onClick={() => onResourceClick && onResourceClick(r, weekIdx, taskIdx)}>
                  <ResourceLink r={r} />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WeekCard({ week, weekIdx, onToggle, onResourceClick, onStartQuiz, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? weekIdx === 0);
  const tasks = week.tasks || [];
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const weekPct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.06)",
      marginBottom: 16, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
    }}>
      {/* Header */}
      <button onClick={() => setOpen(v => !v)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: weekPct === 100 ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14,
            color: weekPct === 100 ? "#10b981" : "#818cf8",
          }}>
            {weekPct === 100 ? "✓" : `W${weekIdx + 1}`}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{week.title}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>
              {done}/{total} tasks complete
              {week.starts_on && ` · starts ${new Date(week.starts_on).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Mini progress bar */}
          <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
            <div style={{
              width: `${weekPct}%`, height: "100%",
              background: weekPct === 100 ? "#10b981" : "#818cf8",
              borderRadius: 3, transition: "width .4s ease",
            }} />
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8", minWidth: 30, textAlign: "right" }}>
            {weekPct}%
          </span>
          <span style={{ fontSize: 18, color: "#64748b", transform: open ? "rotate(180deg)" : "none", transition: ".2s" }}>
            ▾
          </span>
        </div>
      </button>

      {/* Tasks */}
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          {tasks.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: "16px 0", fontSize: 13 }}>
              No tasks in this week.
            </p>
          ) : (
            tasks.map((task, ti) => (
              <TaskItem key={ti} task={task} weekIdx={weekIdx} taskIdx={ti}
                onToggle={onToggle} onResourceClick={onResourceClick} onStartQuiz={onStartQuiz} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ExtraSection({ extra }) {
  if (!extra || extra.length === 0) return null;
  return (
    <div style={{
      marginTop: 24, background: "rgba(245,158,11,0.08)",
      border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: 20,
    }}>
      <h4 style={{ fontWeight: 700, fontSize: 15, color: "#fbbf24", marginBottom: 12 }}>
        🔥 Adaptive Resources — Weak Topics
      </h4>
      {extra.map((block, bi) => (
        <div key={bi} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#fcd34d", marginBottom: 8 }}>
            {(block.topics || []).join(", ")}
          </div>
          <div>
            {(block.resources || []).map((r, ri) => (
              <ResourceLink key={ri} r={r} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ mode, onCareerQuiz }) {
  return (
    <div style={{
      textAlign: "center", padding: "60px 20px",
      background: "rgba(255,255,255,0.03)", borderRadius: 16,
      border: "2px dashed rgba(255,255,255,0.08)",
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
      <h3 style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>No Active Study Plan</h3>
      <p style={{ color: "#94a3b8", marginBottom: 24, maxWidth: 360, margin: "0 auto 24px" }}>
        {mode === "career_quiz"
          ? "Take the career quiz first — your plan will be auto-generated from your results."
          : "Select notes below and click Generate to create your personalized plan."}
      </p>
      {mode === "career_quiz" && (
        <button onClick={onCareerQuiz} style={{
          background: "var(--gradient-primary)", color: "#fff", border: "none",
          padding: "12px 28px", borderRadius: 10, fontWeight: 700,
          fontSize: 15, cursor: "pointer",
        }}>
          🚀 Go to Career Quiz
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Topic Quiz Modal — Inline quiz with professional UI
───────────────────────────────────────────────────────── */
function TopicQuizModal({ open, topic, questions, answers, onAnswer, loading, submitting, result, onSubmit, onRetry, onClose }) {
  if (!open) return null;
  const topicLabel = topic || "Quiz";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeIn .25s ease", padding: 16,
    }} onClick={e => e.target === e.currentTarget && !submitting && onClose()}>
      <div style={{
        background: "#1e1e2e", borderRadius: 20, width: "100%", maxWidth: 640,
        maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)",
        animation: "slideUp .3s ease",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #312e81 0%, #6366f1 100%)",
          padding: "20px 24px", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#93c5fd", marginBottom: 4 }}>
              {result ? "Quiz Results" : "Topic Quiz"}
            </div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>{topicLabel}</h3>
          </div>
          <button onClick={onClose} disabled={submitting} style={{
            background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
            width: 36, height: 36, borderRadius: "50%", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", color: "#e2e8f0" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{
                width: 48, height: 48, border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "#818cf8",
                borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px",
              }} />
              <p style={{ color: "#94a3b8", fontWeight: 600 }}>Generating quiz questions with AI...</p>
              <p style={{ color: "#64748b", fontSize: 13 }}>This may take a few seconds</p>
            </div>
          ) : result ? (
            /* ── Results View ── */
            <div>
              {/* Score Card */}
              <div style={{
                textAlign: "center", padding: 24, borderRadius: 16, marginBottom: 20,
                background: result.passed
                  ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
                  : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
              }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>{result.passed ? "🎉" : "😔"}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: result.passed ? "#065f46" : "#dc2626" }}>
                  {result.score}%
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: result.passed ? "#047857" : "#b91c1c", marginTop: 4 }}>
                  {result.passed ? "Congratulations! You passed!" : `You need ${result.passing_score}% to pass`}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>
                  {result.correct} of {result.total} correct
                </div>
              </div>

              {/* Question Results */}
              {(result.results || []).map((r, i) => (
                <div key={i} style={{
                  padding: 16, borderRadius: 12, marginBottom: 10,
                  border: `1px solid ${r.is_correct ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                  background: r.is_correct ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{r.is_correct ? "✅" : "❌"}</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{r.question}</span>
                  </div>
                  {!r.is_correct && (
                    <div style={{ fontSize: 13, marginLeft: 24 }}>
                      <div style={{ color: "#dc2626" }}>Your answer: {r.user_answer_text || "Not answered"}</div>
                      <div style={{ color: "#059669", fontWeight: 600 }}>Correct: {r.correct_answer_text}</div>
                    </div>
                  )}
                  {r.explanation && (
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6, marginLeft: 24, fontStyle: "italic" }}>
                      💡 {r.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : questions.length > 0 ? (
            /* ── Questions View ── */
            <div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
                Answer all {questions.length} questions. You need <strong>60%</strong> to pass.
              </div>
              {questions.map((q, qi) => (
                <div key={q.id} style={{
                  padding: 16, borderRadius: 12, marginBottom: 12,
                  border: `1px solid ${answers[String(q.id)] ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`,
                  background: answers[String(q.id)] ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
                  transition: "all .2s",
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0", marginBottom: 12, display: "flex", gap: 8 }}>
                    <span style={{
                      minWidth: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: answers[String(q.id)] ? "#6366f1" : "rgba(255,255,255,0.08)",
                      color: answers[String(q.id)] ? "#fff" : "#94a3b8",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {qi + 1}
                    </span>
                    <span>{q.question}</span>
                  </div>
                  <div style={{ display: "grid", gap: 6, marginLeft: 34 }}>
                    {Object.entries(q.options || {}).map(([key, text]) => {
                      const selected = answers[String(q.id)] === key;
                      return (
                        <label key={key} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                          border: `2px solid ${selected ? "#6366f1" : "rgba(255,255,255,0.06)"}`,
                          background: selected ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
                          transition: "all .15s",
                        }}
                        onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; }}
                        onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                        >
                          <input type="radio" name={`q-${q.id}`} value={key}
                            checked={selected} onChange={() => onAnswer(String(q.id), key)}
                            style={{ accentColor: "#6366f1" }} />
                          <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                            <strong style={{ color: "#94a3b8", marginRight: 4 }}>{key}.</strong> {text}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
              No questions available. Try again later.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", justifyContent: "flex-end", gap: 10, background: "rgba(255,255,255,0.02)",
        }}>
          {result ? (
            result.passed ? (
              <button className="sp-btn sp-btn-primary" onClick={onClose}
                style={{ padding: "10px 24px" }}>
                ✅ Done — Close
              </button>
            ) : (
              <>
                <button className="sp-btn sp-btn-outline" onClick={onClose}
                  style={{ padding: "10px 20px" }}>Close</button>
                <button className="sp-btn" onClick={onRetry}
                  style={{ padding: "10px 24px", background: "#f59e0b", color: "#fff" }}>
                  🔄 Retry Quiz
                </button>
              </>
            )
          ) : !loading && questions.length > 0 ? (
            <>
              <button className="sp-btn sp-btn-outline" onClick={onClose}
                style={{ padding: "10px 20px" }}>Cancel</button>
              <button className="sp-btn sp-btn-primary" onClick={onSubmit}
                disabled={submitting}
                style={{ padding: "10px 24px", opacity: submitting ? 0.6 : 1 }}>
                {submitting ? "⏳ Submitting..." : "📝 Submit Quiz"}
              </button>
            </>
          ) : !loading && (
            <button className="sp-btn sp-btn-outline" onClick={onClose}
              style={{ padding: "10px 20px" }}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
export default function StudyPlanPage() {
  const [plan, setPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [mode, setMode] = useState("career_quiz");
  const [activeTab, setActiveTab] = useState("plan");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [toast, setToast] = useState(null);
  const [weakTopics, setWeakTopics] = useState("");
  const [showAdaptPanel, setShowAdaptPanel] = useState(false);

  // ─── Quiz Modal State ───
  const [quizModal, setQuizModal] = useState({ open: false, task: null, wi: null, ti: null });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const showToast = (msg, type = "info") => setToast({ msg, type });

  // ─── Load on mount ───
  useEffect(() => {
    (async () => {
      await fetchLatestPlan();
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (mode === "note_quiz") fetchNotes();
    // eslint-disable-next-line
  }, [mode]);

  // ─── API helpers ───
  async function fetchLatestPlan() {
    try {
      const res = await api.get("/api/study-plan/latest/");
      if (res.data && !res.data.message) {
        setPlan(normalizePlan(res.data));
      }
    } catch { /* no active plan */ }
  }

  async function fetchAllPlans() {
    try {
      const res = await api.get("/api/study-plan/all/");
      setAllPlans(Array.isArray(res.data) ? res.data : []);
    } catch { setAllPlans([]); }
  }

  async function fetchNotes() {
    try {
      const res = await api.get("/api/notes/progress/");
      setNotes(Array.isArray(res.data) ? res.data.filter(n => n.status === "COMPLETED") : []);
    } catch { setNotes([]); }
  }

  async function generateNotesPlan() {
    if (selectedNotes.length === 0) {
      showToast("⚠️ Select at least one note first.", "warning"); return;
    }
    setGenerating(true);
    try {
      const res = await api.post("/api/study-plan/generate/", {
        plan_type: "note_quiz",
        note_ids: selectedNotes,
      });
      setPlan(normalizePlan(res.data));
      setActiveTab("plan");
      showToast("✅ Notes plan generated!", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showToast(`❌ ${serverMsg(err, "Failed to generate plan.")}`, "danger");
    } finally {
      setGenerating(false);
    }
  }

  // ─── Toggle task ───
  async function toggleTask(wi, ti, task) {
    if (!plan) return;
    if (task.type === "quiz") {
      showToast("ℹ️ Quiz tasks complete automatically after submission.", "info"); return;
    }

    // Optimistic update
    const draft = clone(plan);
    const t = draft.plan_data.weeks[wi]?.tasks[ti];
    if (!t) return;
    t.done = !t.done;
    draft.progress = computeProgress(draft);
    setPlan(draft);

    try {
      const res = await api.put("/api/study-plan/update/", {
        id: plan.id,
        plan_id: plan.id,
        plan_data: draft.plan_data,
      });
      // Use server response if it includes plan_data
      if (res.data?.plan_data) {
        setPlan(normalizePlan({ ...plan, plan_data: res.data.plan_data }));
      }
    } catch (err) {
      // Revert
      t.done = !t.done;
      setPlan(clone(plan));
      showToast(`❌ ${serverMsg(err, "Failed to update task.")}`, "danger");
    }
  }

  // ─── Mark resource visited ───
  async function handleResourceClick(r, wi, ti) {
    if (!plan || r.visited) return;
    // Optimistically mark visited
    const draft = clone(plan);
    const res = draft.plan_data.weeks[wi]?.tasks[ti]?.resources;
    if (res) {
      const found = res.find(x => x.url === r.url);
      if (found) found.visited = true;
      setPlan(draft);
    }
    try {
      await api.post("/api/study-plan/resource-visit/", {
        plan_id: plan.id,
        week_index: wi,
        task_index: ti,
        resource_url: r.url,
      });
    } catch { /* non-critical */ }
  }

  // ─── Adapt plan ───
  async function handleAdapt() {
    if (!plan) return;
    setAdapting(true);
    try {
      const topics = weakTopics
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      const payload = { plan_id: plan.id };
      if (topics.length > 0) payload.weak_topics = topics;

      const res = await api.post("/api/study-plan/adapt/", payload);
      const updated = res.data?.updated_plan || res.data;
      if (updated && updated.plan_data) {
        setPlan(normalizePlan(updated));
        showToast("✅ Plan adapted with extra resources!", "success");
        setShowAdaptPanel(false);
        setWeakTopics("");
        // Scroll to extra section
        setTimeout(() => {
          document.getElementById("extra-section")?.scrollIntoView({ behavior: "smooth" });
        }, 400);
      }
    } catch (err) {
      showToast(`❌ ${serverMsg(err, "Failed to adapt plan.")}`, "danger");
    } finally {
      setAdapting(false);
    }
  }

  // ─── Reset plan ───
  async function handleReset() {
    if (!plan || !window.confirm("Reset all task progress?")) return;
    try {
      const res = await api.post("/api/study-plan/reset/");
      if (res.data) setPlan(normalizePlan({ ...plan, plan_data: res.data.plan_data || plan.plan_data }));
      showToast("🔄 Plan reset.", "warning");
    } catch (err) {
      showToast(`❌ ${serverMsg(err, "Failed to reset.")}`, "danger");
    }
  }

  // ─── Export ICS ───
  async function handleExport() {
    if (!plan) return;
    try {
      const res = await api.get(`/api/study-plan/${plan.id}/export/`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = `study_plan.ics`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      showToast("📆 Calendar exported!", "success");
    } catch { showToast("❌ Export failed.", "danger"); }
  }

  // ─── Delete plan ───
  async function handleDelete(id) {
    if (!window.confirm("Delete this plan permanently?")) return;
    try {
      await api.delete(`/api/study-plan/${id}/delete/`);
      if (plan && String(plan.id) === String(id)) { setPlan(null); }
      setAllPlans(prev => prev.filter(p => String(p.id) !== String(id)));
      showToast("🗑️ Plan deleted.", "warning");
    } catch (err) {
      showToast(`❌ ${serverMsg(err, "Failed to delete.")}`, "danger");
    }
  }

  function handleStartQuiz(task, wi, ti) {
    if (!plan) return;
    const topic = task?.topic || task?.title?.replace(/^Quiz:\s*/i, "") || "General";
    setQuizModal({ open: true, task, wi, ti });
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizLoading(true);

    api.post("/api/study-plan/topic-quiz/generate/", {
      topic,
      plan_id: plan.id,
      week_index: wi,
      task_index: ti,
      note_id: task?.note_id || task?.noteId || null,
    }).then(res => {
      setQuizQuestions(res.data.questions || []);
    }).catch(err => {
      showToast(serverMsg(err, "Failed to generate quiz."), "danger");
      setQuizModal({ open: false, task: null, wi: null, ti: null });
    }).finally(() => setQuizLoading(false));
  }

  function handleQuizSubmit() {
    if (!plan || !quizModal.task) return;
    const unanswered = quizQuestions.filter(q => !quizAnswers[String(q.id)]);
    if (unanswered.length > 0) {
      showToast(`⚠️ Please answer all ${unanswered.length} remaining question(s).`, "warning");
      return;
    }
    setQuizSubmitting(true);
    const topic = quizModal.task?.topic || quizModal.task?.title?.replace(/^Quiz:\s*/i, "") || "";
    api.post("/api/study-plan/topic-quiz/submit/", {
      plan_id: plan.id,
      week_index: quizModal.wi,
      task_index: quizModal.ti,
      answers: quizAnswers,
      questions: quizQuestions,
      topic,
    }).then(res => {
      setQuizResult(res.data);
      if (res.data.passed) {
        const draft = clone(plan);
        const t = draft.plan_data.weeks[quizModal.wi]?.tasks[quizModal.ti];
        if (t) { t.done = true; t.quiz_score = res.data.score; t.quiz_passed = true; }
        draft.progress = computeProgress(draft);
        setPlan(draft);
        showToast(`✅ Passed! Score: ${res.data.score}%`, "success");
      } else {
        const draft = clone(plan);
        const t = draft.plan_data.weeks[quizModal.wi]?.tasks[quizModal.ti];
        if (t) { t.quiz_score = res.data.score; t.quiz_passed = false; }
        setPlan(draft);
      }
    }).catch(err => {
      showToast(serverMsg(err, "Failed to submit quiz."), "danger");
    }).finally(() => setQuizSubmitting(false));
  }

  function handleQuizRetry() {
    if (!quizModal.task) return;
    handleStartQuiz(quizModal.task, quizModal.wi, quizModal.ti);
  }

  function closeQuizModal() {
    setQuizModal({ open: false, task: null, wi: null, ti: null });
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizResult(null);
  }

  // ─── Computed ───
  const progress = plan ? computeProgress(plan) : 0;
  const weeks = plan?.plan_data?.weeks || [];
  const extra = plan?.plan_data?.extra || [];
  const planCareer = plan?.plan_data?.career || plan?.plan_type?.replace("_", " ") || "Study Plan";
  const salaryRange = plan?.plan_data?.salary_range;
  const totalTasks = weeks.reduce((s, w) => s + (w.tasks?.length || 0), 0);
  const doneTasks = weeks.reduce((s, w) => s + (w.tasks || []).filter(t => t.done).length, 0);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, border: "4px solid rgba(255,255,255,0.1)",
            borderTopColor: "#818cf8", borderRadius: "50%",
            animation: "spin 1s linear infinite", margin: "0 auto 16px"
          }} />
          <p style={{ color: "#94a3b8" }}>Loading your study plan…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 900, margin: "0 auto", padding: "24px 16px 48px",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .sp-tab { padding:10px 20px; border:none; background:none; cursor:pointer; font-size:14px; font-weight:600; color:#64748b; border-bottom:2px solid transparent; transition:.2s; }
        .sp-tab:hover { color:#818cf8; }
        .sp-tab.active { color:#818cf8; border-color:#818cf8; }
        .sp-btn { padding:8px 16px; border-radius:8px; font-weight:600; font-size:13px; cursor:pointer; border:none; transition:.15s; }
        .sp-btn:hover { opacity:.88; transform:translateY(-1px); }
        .sp-btn:active { transform:none; }
        .sp-btn-primary { background:#6366f1; color:#fff; }
        .sp-btn-outline { background:rgba(255,255,255,0.04); color:#cbd5e1; border:1px solid rgba(255,255,255,0.1); }
        .sp-btn-danger { background:rgba(239,68,68,0.12); color:#f87171; border:1px solid rgba(239,68,68,0.2); }
        .sp-btn-warning { background:rgba(245,158,11,0.12); color:#fbbf24; border:1px solid rgba(245,158,11,0.2); }
        .sp-btn-green { background:rgba(16,185,129,0.12); color:#34d399; border:1px solid rgba(16,185,129,0.2); }
        .note-card { border:2px solid rgba(255,255,255,0.06); border-radius:10px; padding:12px 16px; cursor:pointer; transition:.15s; background:rgba(255,255,255,0.03); color:#e2e8f0; }
        .note-card:hover { border-color:rgba(99,102,241,0.3); background:rgba(99,102,241,0.06); }
        .note-card.selected { border-color:#6366f1; background:rgba(99,102,241,0.1); }
        .plan-list-item { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px 20px; margin-bottom:10px; display:flex; align-items:center; gap:16px; }
        .plan-list-item:hover { border-color:rgba(99,102,241,0.3); }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontWeight: 800, fontSize: 28, color: "#e2e8f0", margin: 0 }}>
          📅 Study Plan
        </h1>
        <p style={{ color: "#94a3b8", marginTop: 4, fontSize: 14 }}>
          Track your learning week by week, complete tasks, and access curated resources.
        </p>
      </div>

      {/* Mode selector */}
      <div style={{
        background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 20px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#cbd5e1" }}>Plan Type:</span>
        {[
          { val: "career_quiz", label: "🎯 Career Roadmap" },
          { val: "note_quiz", label: "📄 Notes-Based" },
        ].map(({ val, label }) => (
          <button key={val} onClick={() => setMode(val)}
            className="sp-btn"
            style={{
              background: mode === val ? "#6366f1" : "rgba(255,255,255,0.05)",
              color: mode === val ? "#fff" : "#cbd5e1",
              border: "none",
            }}>
            {label}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {mode === "career_quiz" && (
            <button className="sp-btn sp-btn-primary"
              onClick={() => window.location.href = "/career-quiz"}>
              🚀 Take Career Quiz
            </button>
          )}
          {plan && (
            <>
              <button className="sp-btn sp-btn-outline"
                onClick={() => { setShowAdaptPanel(v => !v); setActiveTab("plan"); }}>
                🔧 Adapt Plan
              </button>
              <button className="sp-btn sp-btn-warning" onClick={handleReset}>
                🔄 Reset
              </button>
              <button className="sp-btn sp-btn-green" onClick={handleExport}>
                📆 Export
              </button>
            </>
          )}
          {mode === "note_quiz" && (
            <button className="sp-btn sp-btn-primary"
              onClick={generateNotesPlan}
              disabled={generating || selectedNotes.length === 0}
              style={{ opacity: selectedNotes.length === 0 ? 0.5 : 1 }}>
              {generating ? "⏳ Generating…" : "✨ Generate Notes Plan"}
            </button>
          )}
        </div>
      </div>

      {/* Notes selector for notes mode */}
      {mode === "note_quiz" && (
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 20px", marginBottom: 20, animation: "fadeIn .3s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0", margin: 0 }}>
              Select Completed Notes
            </h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="sp-btn sp-btn-outline" style={{ fontSize: 12 }}
                onClick={() => setSelectedNotes(notes.map(n => n.id))}>All</button>
              <button className="sp-btn sp-btn-outline" style={{ fontSize: 12 }}
                onClick={() => setSelectedNotes([])}>None</button>
            </div>
          </div>
          {notes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b" }}>
              No completed notes found.{" "}
              <a href="/notes-upload" style={{ color: "#818cf8" }}>Upload notes first →</a>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {notes.map(n => (
                <div key={n.id}
                  className={`note-card${selectedNotes.includes(n.id) ? " selected" : ""}`}
                  onClick={() => setSelectedNotes(prev =>
                    prev.includes(n.id) ? prev.filter(x => x !== n.id) : [...prev, n.id]
                  )}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" readOnly checked={selectedNotes.includes(n.id)}
                      style={{ accentColor: "#2563EB" }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#e2e8f0", lineHeight: 1.3 }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                        {(n.topics || []).length} topics · {(n.quiz_questions || []).length} questions
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Adapt Panel */}
      {showAdaptPanel && plan && (
        <div style={{
          background: "rgba(245,158,11,0.06)", borderRadius: 14, border: "1px solid rgba(245,158,11,0.2)",
          padding: "16px 20px", marginBottom: 20, animation: "fadeIn .3s ease",
        }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: "#fbbf24", marginBottom: 8 }}>
            🔧 Adapt Plan — Add Extra Resources
          </h3>
          <p style={{ fontSize: 13, color: "#fcd34d", marginBottom: 12 }}>
            Enter topics you want extra help with (comma-separated), or leave blank to auto-detect weak topics from your notes.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text"
              value={weakTopics}
              onChange={e => setWeakTopics(e.target.value)}
              placeholder="e.g. Machine Learning, Python OOP, SQL Joins"
              style={{
                flex: 1, minWidth: 240, padding: "10px 14px",
                border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8,
                fontSize: 14, outline: "none", background: "rgba(255,255,255,0.04)", color: "#e2e8f0",
              }}
            />
            <button className="sp-btn"
              onClick={handleAdapt}
              disabled={adapting}
              style={{ background: "#d97706", color: "#fff", minWidth: 100 }}>
              {adapting ? "⏳ Adapting…" : "🔧 Adapt"}
            </button>
            <button className="sp-btn sp-btn-outline"
              onClick={() => setShowAdaptPanel(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: "2px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
        {[
          { key: "plan", label: "📘 My Plan" },
          { key: "history", label: "📜 All Plans" },
        ].map(({ key, label }) => (
          <button key={key}
            className={`sp-tab${activeTab === key ? " active" : ""}`}
            onClick={() => {
              setActiveTab(key);
              if (key === "history") fetchAllPlans();
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── MY PLAN TAB ── */}
      {activeTab === "plan" && (
        <div style={{ animation: "fadeIn .3s ease" }}>
          {!plan ? (
            <EmptyState mode={mode} onCareerQuiz={() => window.location.href = "/career-quiz"} />
          ) : (
            <>
              {/* Plan header card */}
              <div style={{
                background: "linear-gradient(135deg, #312e81 0%, #6366f1 100%)",
                borderRadius: 16, padding: "24px 28px", marginBottom: 24,
                color: "#fff", display: "flex", alignItems: "center",
                gap: 24, flexWrap: "wrap",
              }}>
                <ProgressRing pct={progress} size={88} stroke={8} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h2 style={{ fontWeight: 800, fontSize: 22, margin: "0 0 4px", color: "#fff" }}>
                    {planCareer}
                  </h2>
                  {salaryRange && (
                    <div style={{ fontSize: 13, color: "#bfdbfe", marginBottom: 6 }}>
                      💰 Expected Salary: <strong style={{ color: "#fff" }}>{salaryRange}</strong>
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: "#bfdbfe" }}>
                    {doneTasks} of {totalTasks} tasks completed · {weeks.length} weeks
                  </div>
                  {/* Overall progress bar */}
                  <div style={{
                    height: 8, background: "rgba(255,255,255,0.2)",
                    borderRadius: 4, marginTop: 12, overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${progress}%`, height: "100%",
                      background: progress === 100 ? "#34d399" : "#fff",
                      borderRadius: 4, transition: "width .6s ease",
                    }} />
                  </div>
                </div>

                {/* Status badge */}
                <div style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 12, padding: "8px 16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, color: "#bfdbfe", marginBottom: 2 }}>STATUS</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {progress === 100 ? "🎉 Complete" : progress > 0 ? "⚡ In Progress" : "🕐 Not Started"}
                  </div>
                </div>
              </div>

              {/* Week cards */}
              {weeks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  This plan has no weeks yet. Try regenerating it.
                </div>
              ) : (
                weeks.map((week, wi) => (
                  <WeekCard key={wi} week={week} weekIdx={wi}
                    onToggle={toggleTask}
                    onResourceClick={handleResourceClick}
                    onStartQuiz={handleStartQuiz}
                    defaultOpen={wi === 0} />
                ))
              )}

              {/* Extra / Adapt section */}
              {extra.length > 0 && (
                <div id="extra-section">
                  <ExtraSection extra={extra} />
                </div>
              )}

              {/* Completion banner */}
              {progress === 100 && (
                <div style={{
                  background: "linear-gradient(135deg, #065f46, #059669)",
                  borderRadius: 16, padding: 24, marginTop: 24,
                  color: "#fff", textAlign: "center",
                  animation: "slideUp .5s ease",
                }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
                  <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
                    Plan Complete!
                  </h3>
                  <p style={{ color: "#a7f3d0", fontSize: 14 }}>
                    Excellent work. Consider taking a mock interview or starting an advanced plan.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── ALL PLANS TAB ── */}
      {activeTab === "history" && (
        <div style={{ animation: "fadeIn .3s ease" }}>
          {allPlans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
              No plans yet. Generate one to get started!
            </div>
          ) : (
            allPlans.map(p => {
              const prog = Math.round(p.progress || 0);
              const career = p.career || p.plan_type?.replace("_", " ") || "Study Plan";
              return (
                <div key={p.id} className="plan-list-item">
                  {/* Mini ring */}
                  <ProgressRing pct={prog} size={52} stroke={5} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>{career}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {p.plan_type?.replace("_", " ")} ·{" "}
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      }) : ""}
                    </div>
                    {/* Progress bar */}
                    <div style={{
                      height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3,
                      marginTop: 8, width: "100%", maxWidth: 240,
                    }}>
                      <div style={{
                        width: `${prog}%`, height: "100%",
                        background: prog === 100 ? "#10b981" : "#818cf8",
                        borderRadius: 3,
                      }} />
                    </div>
                  </div>

                  {/* Status */}
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                    background: prog === 100 ? "rgba(16,185,129,0.15)" : prog > 0 ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                    color: prog === 100 ? "#34d399" : prog > 0 ? "#818cf8" : "#64748b",
                  }}>
                    {prog === 100 ? "Complete" : prog > 0 ? `${prog}%` : "Not started"}
                  </span>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="sp-btn sp-btn-outline"
                      style={{ fontSize: 12 }}
                      onClick={async () => {
                        try {
                          const res = await api.get(`/api/study-plan/${p.id}/`);
                          setPlan(normalizePlan(res.data));
                          setActiveTab("plan");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                          showToast("↩️ Plan loaded.", "info");
                        } catch { showToast("❌ Failed to load plan.", "danger"); }
                      }}>
                      ↩️ Load
                    </button>
                    <button className="sp-btn sp-btn-danger"
                      style={{ fontSize: 12 }}
                      onClick={() => handleDelete(p.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Topic Quiz Modal */}
      <TopicQuizModal
        open={quizModal.open}
        topic={quizModal.task?.topic || quizModal.task?.title?.replace(/^Quiz:\s*/i, "") || ""}
        questions={quizQuestions}
        answers={quizAnswers}
        onAnswer={(qid, key) => setQuizAnswers(prev => ({ ...prev, [qid]: key }))}
        loading={quizLoading}
        submitting={quizSubmitting}
        result={quizResult}
        onSubmit={handleQuizSubmit}
        onRetry={handleQuizRetry}
        onClose={closeQuizModal}
      />

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}