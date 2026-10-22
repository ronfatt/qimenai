import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {seedContent,type Content} from '../../data';
export const dynamic='force-dynamic';
const ADMIN_EMAIL='ronfatt@gmail.com';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function context(){
 let u=await getChatGPTUser();
 // Local preview identity is compiled out of production builds.
 if(!u && import.meta.env.DEV)u={userId:'local-preview',email:'preview@shijing.test',displayName:'Ronnie',fullName:null};
 if(!u)throw new Error('UNAUTHORIZED');
 if(!env.DB)throw new Error('DATABASE_NOT_READY');
 const db=env.DB;const now=new Date().toISOString();
 await db.batch([db.prepare('INSERT OR IGNORE INTO members (id,email,name,member_until,created_at) VALUES (?,?,?,?,?)').bind(u.userId,u.email,u.displayName,new Date(Date.now()+30*86400000).toISOString(),now),db.prepare('INSERT OR IGNORE INTO ledger (id,user_id,amount,label,created_at) VALUES (?,?,?,?,?)').bind('welcome:'+u.userId,u.userId,120,'体验会员赠送点数（非真实购买）',now)]);
 return {u,db,admin:u.email.toLowerCase()===ADMIN_EMAIL||(import.meta.env.DEV&&u.userId==='local-preview')};
}
async function seed(db:D1Database){await db.batch(seedContent.map(c=>db.prepare('INSERT OR IGNORE INTO contents (id,data,status,created_at) VALUES (?,?,?,?)').bind(c.id,JSON.stringify(c),c.status,new Date().toISOString())))}
function preview(c:Content,access:boolean){if(access)return {...c,audio:c.audio?.startsWith('assets/audio/')?'/api/media?content='+encodeURIComponent(c.id):'/ambient.wav',accessible:true};const {steps,visualization,closing,explanation,items,image,audio,...teaser}=c;return {...teaser,accessible:false,itemCount:items.length,stepCount:steps.length}}
async function getContent(db:D1Database,id:string){const r=await db.prepare('SELECT * FROM contents WHERE id=?').bind(id).first<any>();if(!r)return null;return {...JSON.parse(r.data),status:r.status} as Content}
async function canAccess(db:D1Database,uid:string,c:Content){return c.price===0||!!await db.prepare('SELECT id FROM unlocks WHERE user_id=? AND content_id=?').bind(uid,c.id).first()}
export async function GET(){try{const {u,db,admin}=await context();await seed(db);const [member,rows,ls,us,rs,fs,js]=await Promise.all([db.prepare('SELECT * FROM members WHERE id=?').bind(u.userId).first(),db.prepare(admin?'SELECT * FROM contents ORDER BY created_at':'SELECT * FROM contents WHERE status=\'published\' ORDER BY created_at').all<any>(),db.prepare('SELECT * FROM ledger WHERE user_id=? ORDER BY created_at DESC').bind(u.userId).all<any>(),db.prepare('SELECT * FROM unlocks WHERE user_id=?').bind(u.userId).all<any>(),db.prepare('SELECT * FROM reminders WHERE user_id=?').bind(u.userId).all<any>(),db.prepare('SELECT * FROM favorites WHERE user_id=?').bind(u.userId).all<any>(),db.prepare('SELECT * FROM journals WHERE user_id=? ORDER BY created_at DESC').bind(u.userId).all<any>()]);const unlocked=new Set(us.results.map(x=>x.content_id));return json({member,admin,balance:ls.results.reduce((s,x)=>s+x.amount,0),contents:rows.results.filter(r=>r.status==='published').map(r=>{const c={...JSON.parse(r.data),status:r.status};return preview(c,c.price===0||unlocked.has(c.id))}),adminContents:admin?rows.results.map(r=>({...JSON.parse(r.data),status:r.status})):[],ledger:ls.results,unlocks:us.results,reminders:rs.results,favorites:fs.results.map(x=>x.content_id),journals:js.results})}catch(e){return fail(e)}}
export async function POST(req:Request){try{if(req.headers.get('x-shijing-client')!=='1')return json({error:'请求来源无效'},403);const {u,db,admin}=await context();const b:any=await req.json();const now=new Date().toISOString();if(b.action==='saveContent'){
 if(!admin)return json({error:'仅导师管理员可发布'},403);const c=b.content as Content;const themes=['财富','人缘','爱情','事业','静心'];
 if(!c||!c.title?.trim()||c.title.length>100||!themes.includes(c.theme)||!['观想练习','空间布局','吉时行动'].includes(c.kind)||!Number.isInteger(c.price)||c.price<0||c.price>999||!['draft','published'].includes(c.status))return json({error:'请检查标题、主题、类型、点数及发布状态'},400);
 if(c.start&&(!Number.isFinite(Date.parse(c.start))||!c.end||Date.parse(c.end)<=Date.parse(c.start)))return json({error:'结束时间必须晚于开始时间'},400);
 if(c.end&&!c.start)return json({error:'请同时填写开始时间'},400);
 if(!Array.isArray(c.steps)||!c.steps.length||c.steps.some(s=>typeof s!=='string'||s.length>2000)||!Array.isArray(c.items))return json({error:'请至少填写一个有效步骤'},400);
 if(!Number.isFinite(c.duration)||c.duration<1||c.duration>120||!Number.isInteger(c.days)||c.days<0||c.days>365)return json({error:'时长或保留天数无效'},400);
 if(c.image&&!(c.image.startsWith('/reference/')||/^data:image\/(jpeg|png|webp);base64,/.test(c.image)))return json({error:'请使用上传的图片'},400);
 if(JSON.stringify(c).length>1900000)return json({error:'内容过大，请使用小于1MB的图片'},400);
 if(c.audio&&c.audio!=='/ambient.wav'&&!/^assets\/audio\/[a-f0-9-]+\.(mp3|wav|m4a|ogg)$/.test(c.audio))return json({error:'音频来源无效'},400);c.id=c.id||crypto.randomUUID();c.isSample=true;c.audio=c.audio||'/ambient.wav';
 await db.prepare('INSERT INTO contents (id,data,status,created_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,status=excluded.status').bind(c.id,JSON.stringify(c),c.status,now).run();return json({ok:true,id:c.id});
 }
 const c=await getContent(db,String(b.id||''));if(!c||c.status!=='published')return json({error:'内容不存在或尚未发布'},404);
 if(b.action==='unlock'){
 if(c.price===0)return json({ok:true});if(await canAccess(db,u.userId,c))return json({ok:true,alreadyUnlocked:true});
 if(c.end&&Date.parse(c.end)<Date.now())return json({error:'活动已结束，无法解锁。请选择下一场活动。'},400);
 const uid=crypto.randomUUID();await db.batch([db.prepare(`INSERT OR IGNORE INTO unlocks (user_id,content_id,id,created_at) SELECT ?,?,?,? WHERE (SELECT member_until FROM members WHERE id=?)>? AND COALESCE((SELECT SUM(amount) FROM ledger WHERE user_id=?),0)>=?`).bind(u.userId,c.id,uid,now,u.userId,now,u.userId,c.price),db.prepare('INSERT OR IGNORE INTO ledger (id,user_id,amount,label,created_at) SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM unlocks WHERE id=? AND user_id=?)').bind('unlock:'+uid,u.userId,-c.price,'解锁：'+c.title,now,uid,u.userId)]);
 if(!await canAccess(db,u.userId,c))return json({error:'点数不足或体验会员已到期。真实充值尚未开放。'},400);return json({ok:true});
 }
 if(b.action==='favorite'){if(b.enabled)await db.prepare('INSERT OR IGNORE INTO favorites (user_id,content_id) VALUES (?,?)').bind(u.userId,c.id).run();else await db.prepare('DELETE FROM favorites WHERE user_id=? AND content_id=?').bind(u.userId,c.id).run();return json({ok:true})}
 if(!await canAccess(db,u.userId,c))return json({error:'请先解锁完整内容'},403);
 if(b.action==='reminder'){
 if(b.enabled===false){await db.prepare('DELETE FROM reminders WHERE user_id=? AND content_id=?').bind(u.userId,c.id).run();return json({ok:true})}
 if(!c.start||Date.parse(c.start)<Date.now())return json({error:'只能为尚未开始的活动设置提醒'},400);if(![0,10,30,60,1440].includes(b.minutes))return json({error:'提醒时间无效'},400);
 await db.prepare('INSERT INTO reminders (user_id,content_id,minutes,created_at) VALUES (?,?,?,?) ON CONFLICT(user_id,content_id) DO UPDATE SET minutes=excluded.minutes').bind(u.userId,c.id,b.minutes,now).run();return json({ok:true});
 }
 if(b.action==='journal'){
 const feeling=String(b.feeling||'').slice(0,1000),action=String(b.nextAction||'').slice(0,1000);if(!feeling&&!action)return json({error:'请记录感受或下一步行动'},400);
 await db.prepare('INSERT INTO journals (id,user_id,content_id,feeling,action,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),u.userId,c.id,feeling,action,now).run();return json({ok:true});
 }
 return json({error:'未知操作'},400);
 }catch(e){return fail(e)}}
function fail(e:unknown){const msg=e instanceof Error?e.message:'';if(msg==='UNAUTHORIZED')return json({error:'请先登录后再使用',signIn:'/signin-with-chatgpt?return_to=%2F'},401);console.error('Platform request failed',msg);return json({error:'服务暂时不可用，请稍后重试'},500)}
