export type Element = '木' | '火' | '土' | '金' | '水';
export type Dun = '阳遁' | '阴遁';
export type Palace = {
  id: number; name: string; number: string; trigram: string;
  direction: string; element: Element; door: string; doorElement?: Element;
  star: string; god: string; meaning: string;
};

// Luo Shu, with south at the top. These positions never rotate.
export const palaces: Palace[] = [
  { id: 4, name: '巽', number: '四', trigram: '☴', direction: '东南', element: '木', door: '杜门', doorElement: '木', star: '天辅', god: '六合', meaning: '巽为风，传统取象关注渐进、传播与交流。先分清固定宫位，再看每层符号在具体盘中的落点。' },
  { id: 9, name: '离', number: '九', trigram: '☲', direction: '南', element: '火', door: '景门', doorElement: '火', star: '天英', god: '白虎', meaning: '离为火，传统取象关注光明、呈现与辨识。展示与表达可以作为理解景门的入门线索。' },
  { id: 2, name: '坤', number: '二', trigram: '☷', direction: '西南', element: '土', door: '死门', doorElement: '土', star: '天芮', god: '玄武', meaning: '坤为地，传统取象关注承载与落实。本示例采用天禽、中宫干寄坤的转盘展示约定。' },
  { id: 3, name: '震', number: '三', trigram: '☳', direction: '东', element: '木', door: '伤门', doorElement: '木', star: '天冲', god: '太阴', meaning: '震为雷，传统取象关注启动、变化与行动。宫位的五行属于空间底图，不会随星门转动而改变。' },
  { id: 5, name: '中', number: '五', trigram: '◎', direction: '中央', element: '土', door: '无门', star: '天禽', god: '', meaning: '中五宫没有独立的八门与八神。天禽本位居中；本示例转盘寄坤，与天芮同宫，中宫地盘干壬也随寄显示。' },
  { id: 7, name: '兑', number: '七', trigram: '☱', direction: '西', element: '金', door: '惊门', doorElement: '金', star: '天柱', god: '九地', meaning: '兑为泽，传统取象关注言语、交换与感受。取象是一种传统解释方式，需结合问题和全盘关系理解。' },
  { id: 8, name: '艮', number: '八', trigram: '☶', direction: '东北', element: '土', door: '生门', doorElement: '土', star: '天任', god: '螣蛇', meaning: '艮为山，传统取象关注边界、积累与稳定。生门常被用于讨论生长与经营，但单一符号不足以决定结果。' },
  { id: 1, name: '坎', number: '一', trigram: '☵', direction: '北', element: '水', door: '休门', doorElement: '水', star: '天蓬', god: '值符', meaning: '坎为水，传统取象关注流动与内藏。阳遁一局甲子时，甲子遁戊在坎一宫，天蓬为值符星、休门为值使门。' },
  { id: 6, name: '乾', number: '六', trigram: '☰', direction: '西北', element: '金', door: '开门', doorElement: '金', star: '天心', god: '九天', meaning: '乾为天，传统取象关注主导、秩序与开创。开门可作为开放与沟通的学习线索，仍需结合其他盘层。' },
];

export const stems = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
export const cycle: Element[] = ['木', '火', '土', '金', '水'];

// This is the earth-plate placement rule only, not a calendar/charting engine.
export function earthPlate(dun: Dun, ju: number): Record<number, string> {
  if (!Number.isInteger(ju) || ju < 1 || ju > 9) throw new Error('局数须为1至9');
  const result: Record<number, string> = {};
  stems.forEach((stem, i) => {
    result[((ju - 1 + (dun === '阳遁' ? i : -i)) % 9 + 9) % 9 + 1] = stem;
  });
  return result;
}

export function elementRelation(from: Element, to: Element) {
  const distance = (cycle.indexOf(to) - cycle.indexOf(from) + 5) % 5;
  return [
    { name: '比和', text: '同属一个五行，称为比和。' },
    { name: '门生宫', text: '门的五行生宫的五行。' },
    { name: '门克宫', text: '门的五行克宫的五行，常称门迫。' },
    { name: '宫克门', text: '宫的五行克门的五行。' },
    { name: '宫生门', text: '宫的五行生门的五行。' },
  ][distance];
}

export const doorMeanings: Record<string, string> = {
  '休门': '休养、调适、沟通', '生门': '生长、经营、积累', '伤门': '行动、竞争、损伤',
  '杜门': '守护、隐蔽、研究', '景门': '呈现、表达、文书', '死门': '终止、收束、静止',
  '惊门': '警觉、言语、争议', '开门': '开放、开展、联络',
};

export const qimenSources = [
  { title: '《奇门遁甲统宗》· 古籍原文', url: 'https://zh.wikisource.org/zh-hans/奇門遁甲統宗' },
  { title: '《遁甲演义》· 古籍原文', url: 'https://zh.wikisource.org/wiki/遁甲演義' },
];
