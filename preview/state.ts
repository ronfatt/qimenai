import { seedContent } from '../app/data';

const STORAGE_KEY = 'shijing-public-preview-v1';
type Reminder = { content_id: string; minutes: number; created_at: string };
type Journal = { id: string; content_id: string; feeling: string; action: string; created_at: string };
type Saved = { favorites: string[]; reminders: Reminder[]; journals: Journal[] };
let state: Saved = { favorites: [], reminders: [], journals: [] };
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved && Array.isArray(saved.favorites) && Array.isArray(saved.reminders) && Array.isArray(saved.journals)) {
    state = saved;
  }
} catch { /* Browsing also works when browser storage is unavailable. */ }

// Keep upcoming sample events visible whenever the preview is visited.
// Historic reference posters retain their original dates and descriptions.
const anchor = new Date(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' }) + 'T00:00:00+08:00');
let offset = 0;
const contents = seedContent.map(content => {
  if (!content.isSample || !content.start) return { ...content, accessible: true };
  const day = new Date(anchor.getTime() + (++offset) * 86400000)
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' });
  return {
    ...content,
    start: day + content.start.slice(10),
    end: day + content.end.slice(10),
    accessible: true,
  };
});

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* Keep session state in memory. */ }
}

export async function demoRequest(body?: any) {
  if (body) {
    if (body.action === 'resetDemo') {
      state = { favorites: [], reminders: [], journals: [] };
    } else {
      const content = contents.find(c => c.id === body.id);
      if (!content) throw new Error('找不到这项示范内容');
      if (body.action === 'favorite') {
        state.favorites = state.favorites.filter(id => id !== content.id);
        if (body.enabled) state.favorites.push(content.id);
      } else if (body.action === 'reminder') {
        if (body.enabled !== false && (!content.start || Date.parse(content.start) <= Date.now())) {
          throw new Error('请选择尚未开始的示范活动');
        }
        if (body.enabled !== false && ![0, 10, 30, 60, 1440].includes(body.minutes)) {
          throw new Error('提醒时间无效');
        }
        state.reminders = state.reminders.filter(r => r.content_id !== content.id);
        if (body.enabled !== false) state.reminders.push({ content_id: content.id, minutes: body.minutes, created_at: new Date().toISOString() });
      } else if (body.action === 'journal') {
        const feeling = String(body.feeling || '').slice(0, 1000);
        const action = String(body.nextAction || '').slice(0, 1000);
        if (!feeling.trim() && !action.trim()) throw new Error('请先填写感受或下一步行动');
        state.journals.unshift({ id: crypto.randomUUID(), content_id: content.id, feeling, action, created_at: new Date().toISOString() });
      } else if (body.action !== 'unlock') {
        throw new Error('此功能暂未在网页体验版开放');
      }
    }
    persist();
    return { ok: true };
  }
  return {
    member: { id: 'demo', name: '体验访客', email: '', member_until: new Date(Date.now() + 30 * 86400000).toISOString() },
    admin: false,
    balance: 120,
    contents,
    adminContents: [],
    ledger: [{ id: 'demo-welcome', amount: 120, label: '示范点数 · 浏览无需扣点', created_at: new Date().toISOString() }],
    unlocks: contents.map(c => ({ id: c.id, content_id: c.id })),
    ...state,
  };
}
