import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
export const dynamic='force-dynamic';
async function identity(){let u=await getChatGPTUser();if(!u&&import.meta.env.DEV)u={userId:'local-preview',email:'preview@shijing.test',displayName:'Ronnie',fullName:null};return u}
export async function POST(req:Request){try{
 if(req.headers.get('x-shijing-client')!=='1')return Response.json({error:'请求来源无效'},{status:403});
 const u=await identity();if(!u)return Response.json({error:'请先登录'},{status:401});
 if(u.email!=='ronfatt@gmail.com'&&!(import.meta.env.DEV&&u.userId==='local-preview'))return Response.json({error:'只有导师管理员可以上传音频'},{status:403});
 if(!env.BUCKET)return Response.json({error:'音频存储尚未就绪'},{status:503});
 const body=await req.formData();const file=body.get('file');if(!(file instanceof File)||file.size===0||file.size>20*1024*1024)return Response.json({error:'请选择小于20MB的音频'},{status:400});
 const ext=file.name.split('.').pop()?.toLowerCase()||'';const types:Record<string,string>={mp3:'audio/mpeg',wav:'audio/wav',m4a:'audio/mp4',ogg:'audio/ogg'};
 if(!types[ext])return Response.json({error:'音频格式不支持'},{status:400});
 const key='assets/audio/'+crypto.randomUUID()+'.'+ext;await env.BUCKET.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:types[ext]}});return Response.json({key});
 }catch{return Response.json({error:'上传失败，请稍后重试'},{status:500})}}
export async function GET(req:Request){try{const u=await identity();if(!u)return new Response('Unauthorized',{status:401});if(!env.DB||!env.BUCKET)return new Response('Unavailable',{status:503});const id=new URL(req.url).searchParams.get('content');const row=await env.DB.prepare('SELECT data,status FROM contents WHERE id=?').bind(id).first<any>();if(!row||row.status!=='published')return new Response('Not found',{status:404});const c=JSON.parse(row.data);const admin=u.email==='ronfatt@gmail.com'||import.meta.env.DEV&&u.userId==='local-preview';if(!admin&&c.price!==0&&!await env.DB.prepare('SELECT id FROM unlocks WHERE user_id=? AND content_id=?').bind(u.userId,id).first())return new Response('Unlock required',{status:403});if(!c.audio?.startsWith('assets/audio/'))return new Response('Not found',{status:404});const obj=await env.BUCKET.get(c.audio);if(!obj)return new Response('Not found',{status:404});return new Response(obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'audio/mpeg','Content-Length':String(obj.size),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}catch{return new Response('Unavailable',{status:500})}}
