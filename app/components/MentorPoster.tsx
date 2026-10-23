'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CalendarDays, Clock, Compass, Expand, Minus, Plus, X } from 'lucide-react';
import './mentor-poster.css';

export const mentorPoster = {
  src: '/reference/new-beginning-2026-10-16.jpg',
  title: '开始新事物吉日',
  date: '2026年10月16日 · 星期五',
  time: '17:00–19:00',
  direction: '面向东北',
  alt: '导师原图：开始新事物吉日，2026年10月16日星期五下午5点至7点，面向东北；右侧为带有四柱、九宫、星门神与天干的完整奇门盘，署名 Louis Loh 罗鸣。',
};

export default function MentorPoster() {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const el = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    el.showModal();
    return () => {
      el.close();
      document.body.style.overflow = previousOverflow;
      trigger.current?.focus();
    };
  }, [open]);

  return <section className="mentor-poster-section" aria-label="导师原图与详细奇门盘">
    <div className="mentor-poster-heading"><div><span>MENTOR’S ORIGINAL CHART</span><h2>导师原盘 · 吉时指引</h2></div><span className="mentor-history-label">历史图文</span></div>
    <article className="mentor-poster-card">
      <button ref={trigger} className="mentor-poster-image" onClick={() => { setZoom(1); setOpen(true); }} aria-label="放大导师原图：开始新事物吉日">
        <img src={mentorPoster.src} alt={mentorPoster.alt} width={1536} height={864} loading="lazy" decoding="async" />
        <span><Expand size={13} />点击放大原图</span>
      </button>
      <div className="mentor-poster-copy"><div className="mentor-poster-title"><h3>{mentorPoster.title}</h3><Compass size={18} strokeWidth={1.3} /></div><div className="mentor-poster-facts"><span><CalendarDays size={13} />{mentorPoster.date}</span><span><Clock size={13} />{mentorPoster.time}</span><span><Compass size={13} />{mentorPoster.direction}</span></div><p>完整保留导师图文、四柱与九宫盘。该图所示时段已结束，供浏览参考。</p></div>
    </article>
    {open && <dialog ref={dialog} className="mentor-poster-dialog" aria-label="导师原图放大查看" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="mentor-viewer"><header><div><small>导师原图 · 历史参考</small><h2>{mentorPoster.title}</h2></div><button autoFocus className="mentor-viewer-close" aria-label="关闭原图" onClick={() => setOpen(false)}><X size={22} /></button></header><div className="mentor-viewer-toolbar"><button disabled={zoom <= 1} aria-label="缩小原图" onClick={() => setZoom(z => Math.max(1, z - .5))}><Minus size={17} /></button><span>{Math.round(zoom * 100)}%</span><button disabled={zoom >= 4} aria-label="放大原图" onClick={() => setZoom(z => Math.min(4, z + .5))}><Plus size={17} /></button><button className="mentor-viewer-fit" onClick={() => setZoom(1)}>完整图</button><a href={mentorPoster.src} target="_blank" rel="noreferrer">原图<ArrowUpRight size={13} /></a></div><div className="mentor-viewer-scroll"><img src={mentorPoster.src} alt={mentorPoster.alt} style={{ width: `${zoom * 100}%` }} /></div><footer>放大后左右滑动查看盘面 · 原图日期 2026/10/16 · 面向东北</footer></div>
    </dialog>}
  </section>;
}
