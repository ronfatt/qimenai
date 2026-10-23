'use client';
import { useState } from 'react';
import { ArrowUpRight, ArrowRight, Compass, Layers3, BookOpen, MoveUpRight, Info } from 'lucide-react';
import { palaces, earthPlate, elementRelation, doorMeanings, qimenSources, type Dun } from '../qimen';
import './qimen.css';

const layers = ['总览', '八门', '九星', '八神', '天地盘'] as const;
type Layer = typeof layers[number];

export function QimenEntry({ onOpen }: { onOpen: () => void }) {
  return <button className="qimen-entry" onClick={onOpen}>
    <span className="qimen-entry-grid" aria-hidden="true">{palaces.map(p => <span key={p.id}>{p.id}</span>)}</span>
    <span className="qimen-entry-copy"><small>THE MAP BEHIND THE MOMENT</small><b>一张九宫，看懂奇门</b><span>天地人神 · 方位与五行 · 点击探索</span></span>
    <ArrowUpRight size={19} />
  </button>;
}

export default function Qimen({ onExplore }: { onExplore: () => void }) {
  const [mode, setMode] = useState<'chart' | 'earth'>('chart');
  const [layer, setLayer] = useState<Layer>('总览');
  const [selected, setSelected] = useState(1);
  const [dun, setDun] = useState<Dun>('阳遁');
  const [ju, setJu] = useState(1);
  const active = palaces.find(p => p.id === selected)!;
  const plate = earthPlate(mode === 'chart' ? '阳遁' : dun, mode === 'chart' ? 1 : ju);
  const relation = active.doorElement ? elementRelation(active.doorElement, active.element) : null;
  const mainLabel = (p: typeof active) => {
    if (mode === 'earth') return plate[p.id];
    if (layer === '八门') return p.id === 5 ? '无门' : p.door;
    if (layer === '九星') return p.id === 5 ? '寄坤' : p.star + (p.id === 2 ? '·禽' : '');
    if (layer === '八神') return p.god || '无神';
    if (layer === '天地盘') return plate[p.id];
    return p.door;
  };

  return <div className="qimen-page">
    <header className="qimen-heading"><span className="eyebrow">THE LANGUAGE OF TIME & SPACE</span><h1>九宫为局，<span>时空成象。</span></h1><p>先看懂空间，再认识天地人神的叠加。</p></header>
    <section className="qimen-intro"><Compass size={31} strokeWidth={1} /><div><span>奇门遁甲 · 传统时空模型</span><h2>把复杂的盘，慢慢读懂。</h2><p>九宫是底图，星、门、神与干是盘层。<br />同一位置上的组合，才是读盘的开始。</p></div><span className="qimen-seal" aria-hidden="true">奇<br />门</span></section>

    <div className="qimen-mode" role="group" aria-label="选择九宫展示方式"><button aria-pressed={mode === 'chart'} className={mode === 'chart' ? 'active' : ''} onClick={() => setMode('chart')}><Layers3 size={15} />完整示范盘</button><button aria-pressed={mode === 'earth'} className={mode === 'earth' ? 'active' : ''} onClick={() => setMode('earth')}><MoveUpRight size={15} />地盘排布演示</button></div>

    <section className="qimen-board-card" aria-label="奇门九宫盘">
      <div className="qimen-board-heading"><div><span className="tiny-eyebrow">{mode === 'chart' ? 'TEACHING CHART' : 'EARTH PLATE LAB'}</span><h2>{mode === 'chart' ? '阳遁一局 · 甲子时' : dun + ' · ' + ju + '局'}</h2></div><span className="qimen-sample-tag">{mode === 'chart' ? '固定教学盘' : '规则演示'}</span></div>
      {mode === 'chart' ? <><div className="qimen-chart-meta"><span>旬首 <b>甲子戊</b></span><span>值符星 <b>天蓬</b></span><span>值使门 <b>休门</b></span></div><div className="qimen-layers" role="group" aria-label="九宫图层">{layers.map(l => <button key={l} aria-pressed={layer === l} className={layer === l ? 'active' : ''} onClick={() => setLayer(l)}>{l}</button>)}</div></> : <><div className="qimen-earth-controls"><div role="group" aria-label="阴阳遁">{(['阳遁', '阴遁'] as const).map(d => <button key={d} aria-pressed={dun === d} className={dun === d ? 'active' : ''} onClick={() => setDun(d)}>{d}</button>)}</div><label>局数<select aria-label="地盘局数" value={ju} onChange={e => setJu(Number(e.target.value))}>{Array.from({ length: 9 }, (_, i) => <option key={i} value={i + 1}>{i + 1}局</option>)}</select></label></div><p className="qimen-earth-caption">戊从{ju}宫起，{dun === '阳遁' ? '按宫数递增' : '按宫数递减'}布置六仪三奇。此处仅演示地盘，不计算其余盘层。</p></>}

      <div className="qimen-south">南 S <span>↑</span></div>
      <div className={'qimen-grid ' + (mode === 'earth' ? 'earth-only' : layer === '总览' ? 'all-layers' : 'single-layer')} role="group" aria-label="九宫，上南下北，左东右西">
        {palaces.map(p => <button key={p.id} aria-label={`${p.name}${p.number}宫 ${p.direction} ${p.element} ${mode === 'earth' ? '地盘' + plate[p.id] : p.door + ' ' + p.star + ' ' + p.god}`} aria-pressed={p.id === selected} className={`qimen-cell element-${p.element} ${p.id === 5 ? 'center-cell' : ''} ${p.id === selected ? 'selected' : ''}`} onClick={() => setSelected(p.id)}>
          <span className="qimen-cell-top"><b>{p.name}{p.number}</b><small>{p.direction} · {p.element}</small></span>
          {mode === 'chart' && layer === '总览' ? <><span className="qimen-god">{p.god || '中宫无神'}</span><span className="qimen-door">{p.id === 5 ? p.trigram : p.door}</span><span className="qimen-star">{p.id === 5 ? '天禽寄坤' : p.star + (p.id === 2 ? ' · 禽' : '')}</span><span className="qimen-stems">{p.id !== 5 && <span>天 <b>{plate[p.id]}</b></span>}<span>地 <b>{plate[p.id]}</b></span>{p.id === 2 && <small>寄壬</small>}</span></> : <><span className="qimen-layer-main">{mainLabel(p)}</span><span className="qimen-layer-caption">{mode === 'earth' ? '地盘干' : layer === '天地盘' ? p.id === 5 ? '地盘 · 中干寄坤' : '天盘与地盘相同' : p.id === 5 && layer === '九星' ? '天禽随天芮寄坤' : p.id === 2 && layer === '九星' ? '天芮与天禽同宫' : p.trigram}</span>{mode === 'chart' && p.id === 2 && layer === '天地盘' && <small className="qimen-guest-stem">寄干 壬</small>}</>}
          {mode === 'chart' && p.id === 1 && <span className="qimen-chief-dot" aria-label="值符星与值使门所在宫" />}
        </button>)}
      </div>
      <div className="qimen-orientation"><span>东 E ←</span><span>北 N ↓</span><span>→ 西 W</span></div>
      <p className="qimen-board-hint">点击宫位查看解释 · 方位固定，盘层依规则排布</p>
      <div className="qimen-board-note"><Info size={14} /><p>{mode === 'chart' ? '这是阳遁一局甲子时的固定教学示例，不对应今天或当前活动的吉时。采用天禽、中干寄坤及白虎、玄武命名；流派配置可能不同。' : '仅实现阴阳遁、局数与地盘六仪三奇的顺逆排布。未进行节气、干支、旬首及值符值使的公历换算。'}</p></div>
    </section>

    <section className="qimen-palace-detail" aria-live="polite" aria-label="所选宫位解释"><div className="qimen-detail-title"><span className={'qimen-trigram element-' + active.element}>{active.trigram}</span><div><span className="tiny-eyebrow">SELECTED PALACE / {String(active.id).padStart(2, '0')}</span><h2>{active.name}{active.number}宫 <small>{active.direction} · {active.element}</small></h2></div></div><p>{active.meaning}</p>
      {mode === 'chart' ? <><div className="qimen-detail-facts"><div><small>人盘 · 八门</small><b>{active.door}</b><span>{doorMeanings[active.door] || '中五宫不置门'}</span></div><div><small>天盘 · 九星</small><b>{active.id === 5 ? '天禽 · 寄坤' : active.star + (active.id === 2 ? '、天禽' : '')}</b><span>{active.id === 1 ? '本示例的值符星' : '九星位置随具体局时变化'}</span></div><div><small>神盘 · 八神</small><b>{active.god || '不置八神'}</b><span>传统象意层，并非天文星体</span></div><div><small>天地盘干</small><b>{active.id === 5 ? '地壬 · 随寄坤' : `天${plate[active.id]} / 地${plate[active.id]}`}</b><span>{active.id === 2 ? '另含中宫寄干壬' : '甲子遁戊 · 三奇乙丙丁'}</span></div></div>{relation && <div className="qimen-relation"><span>{active.door}属{active.doorElement} / 宫属{active.element}</span><b>{relation.name}</b><p>{relation.text}这里只说明五行关系，不能单凭这一项判断吉凶。</p></div>}</> : <div className="qimen-earth-result"><span>地盘干 <b>{plate[active.id]}</b></span><p>{dun}{ju}局 · {active.name}{active.number}宫。切换局数，会改变戊的起点；切换阴阳遁，会改变布干方向。</p></div>}
    </section>

    <section className="qimen-logic"><div className="section-heading"><div><span className="tiny-eyebrow">UNDERSTAND THE FOUNDATION</span><h2>奇门的底层逻辑</h2></div><BookOpen size={20} strokeWidth={1.3} /></div>
      <p className="qimen-logic-lead">用历法定位时间，用九宫定位空间，再将不同符号叠加成一张传统术数盘。读盘需要看组合与关系。</p>
      <ol className="qimen-flow">{['定时', '定局', '布盘', '读盘', '行动'].map((s, i) => <li key={s}><span>0{i + 1}</span><b>{s}</b></li>)}</ol>
      <details open><summary><span>01</span>九宫是空间坐标</summary><p>洛书采用四九二、三五七、八一六的九宫排列，对应后天八卦的方位。上南下北、左东右西；八个外宫加中五宫，构成不随盘层变化的底图。</p></details>
      <details><summary><span>02</span>三奇六仪与「遁甲」</summary><p>三奇为乙、丙、丁，六仪为戊、己、庚、辛、壬、癸。六甲分别隐于六仪之下：甲子戊、甲戌己、甲申庚、甲午辛、甲辰壬、甲寅癸。地盘按戊己庚辛壬癸丁丙乙的次序，从局数所指的宫位顺排或逆排。</p></details>
      <details><summary><span>03</span>天地人神，四层一起看</summary><p>地盘定位空间与地盘干；天盘叠加九星及天盘干；人盘叠加八门；神盘叠加八神。九星是传统术数符号，不等同于实测天体。值符星与八神中的值符需要区分，值使则是本局时所取的门。</p><div className="qimen-four-layers">{[['地', '九宫 · 地盘干'], ['天', '九星 · 天盘干'], ['人', '八门 · 人事'], ['神', '八神 · 象意']].map(([title, text]) => <span key={title}><b>{title}</b>{text}</span>)}</div></details>
      <details><summary><span>04</span>时间为什么会改变盘面</summary><p>时家奇门通常先依据节气、干支和所用流派的定局方法，确定阴阳遁与局数，再按旬首、时干时支等规则安置星、门、神。拆补、置闰等方法并不完全相同，不能仅凭钟表时间任意转动九宫。</p><p>当前完整盘是固定教学示例；「地盘排布演示」只计算布干规则，尚未提供任意日期的完整起局。</p></details>
      <details><summary><span>05</span>五行生克，到观想行动</summary><p>五行相生为木→火→土→金→水→木，相克为木→土→水→火→金→木。分析时还需考虑用神、旺衰与格局等条件，不能只看生门、开门就保证某种结果。</p><p>在时境里，由导师审核盘局与方位，再策划主题、准备物件、观想、音乐和现实行动。观想仪式是导师设计的内容，不是九宫自动推导出的必然结论。</p></details>
      <div className="qimen-sources"><small>基础阅读 · 古籍用语与流派配置可能有差异</small>{qimenSources.map(s => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.title}<ArrowUpRight size={13} /></a>)}</div>
    </section>
    <button className="qimen-practice-link" onClick={onExplore}><span><small>FROM UNDERSTANDING TO PRACTICE</small><b>看懂之后，把心愿化成行动。</b></span><ArrowRight size={21} /></button>
  </div>;
}
