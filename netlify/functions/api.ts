import {getStore} from '@netlify/blobs';
import {z} from 'zod';
import {analyze,seeds,categories,priorities,statuses,departments,type Report} from '../../lib/campus/model';
const reportInput=z.object({id:z.string().uuid(),title:z.string().trim().min(3).max(120),description:z.string().trim().min(10).max(4000),location:z.string().trim().min(2).max(160),category:z.enum(categories),priority:z.enum(priorities),imageUrl:z.string().max(300).default(''),aiRecommendation:z.object({category:z.enum(categories),priority:z.enum(priorities),department:z.enum(departments),reason:z.string().max(1000)}).nullable()});
const updateInput=z.object({id:z.string(),status:z.enum(statuses),department:z.enum(departments),note:z.string().trim().max(2000),updatedAt:z.string()});
export default async function handler(req:Request){
 const url=new URL(req.url),route=url.pathname.split('/').filter(Boolean).at(-1);
 const sid=req.headers.get('cookie')?.match(/(?:^|;\s*)campusfix_demo=([a-f0-9-]{36})(?:;|$)/)?.[1]??crypto.randomUUID();
 const headers={'Cache-Control':'no-store','Set-Cookie':`campusfix_demo=${sid}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${url.protocol==='https:'?'; Secure':''}`};
 const reply=(data:unknown,status=200)=>Response.json(data,{status,headers});
 if(req.method!=='GET'&&req.headers.get('origin')&&req.headers.get('origin')!==url.origin)return reply({error:'Request not allowed.'},403);
 try{
  if(route==='analyze'&&req.method==='POST'){const x=z.object({description:z.string().trim().min(10).max(4000)}).parse(await req.json());return reply({recommendation:analyze(x.description),mode:'Rule-based suggestions'});}
  const store=getStore({name:'campusfix-reports',consistency:'strong'});
  const photos=getStore({name:'campusfix-photos',consistency:'strong'});
  if(route==='upload'&&req.method==='POST'){
   if(Number(req.headers.get('content-length'))>3200000)return reply({error:'Choose a photo smaller than 3 MB.'},400);
   const file=(await req.formData()).get('photo');if(!(file instanceof File)||file.size>3*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))return reply({error:'Choose a JPG, PNG, or WebP smaller than 3 MB.'},400);
   const b=new Uint8Array(await file.arrayBuffer());const valid=file.type==='image/jpeg'?b[0]===255&&b[1]===216:file.type==='image/png'?b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71:String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';if(!valid)return reply({error:'Invalid image file.'},400);
   const key=`${sid}/${crypto.randomUUID()}`;await photos.set(key,b.buffer,{metadata:{contentType:file.type}});return reply({imageUrl:`/api/photo?key=${encodeURIComponent(key)}`});
  }
  if(route==='photo'&&req.method==='GET'){const key=url.searchParams.get('key');if(!key?.startsWith(sid+'/'))return reply({error:'Photo not found.'},404);const result=await photos.getWithMetadata(key,{type:'arrayBuffer'});if(!result)return reply({error:'Photo not found.'},404);return new Response(result.data,{headers:{...headers,'Content-Type':String(result.metadata.contentType??'application/octet-stream'),'X-Content-Type-Options':'nosniff'}});}
  if(route!=='reports')return reply({error:'Endpoint not found.'},404);
  let current=await store.getWithMetadata(sid,{type:'json'});
  if(!current){await store.setJSON(sid,seeds(),{onlyIfNew:true});current=await store.getWithMetadata(sid,{type:'json'});}
  if(!current)throw Error('Unable to initialize reports');
  const reports=current.data as Report[];
  if(req.method==='GET')return reply({reports});
  if(req.method==='POST'){
   const x=reportInput.parse(await req.json());const exists=reports.find(r=>r.id===x.id);if(exists)return reply({report:exists});
   if(x.imageUrl&&!x.imageUrl.startsWith(`/api/photo?key=${sid}%2F`))return reply({error:'Invalid photo.'},400);
   const now=new Date().toISOString();const report:Report={...x,reportId:`CF-${new Date().getFullYear()}-${x.id.split('-')[0].toUpperCase()}`,status:'Pending',department:'Other',adminNote:'',createdBy:'student-demo',createdAt:now,updatedAt:now,updates:[{status:'Pending',note:'Report submitted. Awaiting administrator review.',department:'Other',at:now}]};
   const saved=await store.setJSON(sid,[...reports,report],{onlyIfMatch:current.etag});if(!saved.modified)return reply({error:'Another report was saved at the same time. Please retry.'},409);return reply({report},201);
  }
  if(req.method==='PATCH'){
   const x=updateInput.parse(await req.json());const report=reports.find(r=>r.id===x.id);if(!report)return reply({error:'Report not found.'},404);if(report.updatedAt!==x.updatedAt)return reply({error:'This report changed. Refresh before saving.'},409);
   report.status=x.status;report.department=x.department;report.adminNote=x.note||report.adminNote;report.updatedAt=new Date().toISOString();report.updates.push({status:report.status,department:report.department,note:x.note||`Status set to ${report.status}; department: ${report.department}.`,at:report.updatedAt});
   const saved=await store.setJSON(sid,reports,{onlyIfMatch:current.etag});if(!saved.modified)return reply({error:'Another update was saved. Refresh and retry.'},409);return reply({report});
  }
  return reply({error:'Method not allowed.'},405);
 }catch(e){if(e instanceof z.ZodError)return reply({error:'Please check your required fields and selected values.'},400);console.error('CampusFix API',e);return reply({error:'Storage is temporarily unavailable. Please retry. Use Netlify Git deployment or the included deploy command; plain drag-and-drop does not install the backend.'},503);}
}
