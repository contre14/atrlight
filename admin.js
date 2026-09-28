(()=>{'use strict';
const endpoint='https://bxaachlardxdofkmfruu.supabase.co/functions/v1/atr-staff';
const key='sb_publishable_Eg1TVPfyRzdkXWcI_CXg2Q_gw6n_CWA';
const $=id=>document.getElementById(id), storageKey='atr-staff-session';
const route=new URLSearchParams(location.search);
let session=null,kind=route.get('kind')==='radiologist'?'radiologist':'hospital',offset=0,search='',version=0,detailVersion=0,expiryTimer;
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function el(tag,text,cls){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;}
function showMessage(id,text,error=false){$(id).textContent=text;$(id).classList.toggle('error',error);}
function clearSession(message=''){
  session=null;version++;detailVersion++;clearTimeout(expiryTimer);sessionStorage.removeItem(storageKey);
  $('dashboard').hidden=true;$('signin').hidden=false;$('applications').replaceChildren();$('detail-body').replaceChildren();$('signed-in-email').textContent='';
  if($('detail-dialog').open)$('detail-dialog').close();$('email-form').hidden=false;$('code-form').hidden=true;$('staff-code').value='';showMessage('login-message',message);
}
async function request(data,binary=false){
  const token=session?.access_token;
  const response=await fetch(endpoint,{method:'POST',headers:{apikey:key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(data),cache:'no-store',signal:AbortSignal.timeout(30000)});
  if(response.status===401&&token){clearSession('Your session has ended. Please sign in again.');throw new Error('Please sign in again.');}
  if(!response.ok){const result=await response.json().catch(()=>({}));throw new Error(result.error||'Unable to connect. Please try again.');}
  return binary?response.blob():response.json();
}
function dateText(value){return new Date(value).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}
function timeText(value){return new Date('2000-01-01T'+value).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});}
function activate(){
  if(!session?.access_token||session.expires_at<=Date.now()){clearSession();return;}
  $('signin').hidden=true;$('dashboard').hidden=false;$('signed-in-email').textContent=session.email;
  clearTimeout(expiryTimer);expiryTimer=setTimeout(()=>clearSession('Your session has ended. Please sign in again.'),session.expires_at-Date.now());
  document.querySelector('[data-kind="'+kind+'"]').click();
  const applicationId=route.get('application');
  if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(applicationId||''))openDetail(applicationId);
}
async function busy(form,fn){const buttons=[...form.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{await fn();}finally{buttons.forEach(b=>b.disabled=false);}}
$('email-form').addEventListener('submit',event=>{event.preventDefault();busy(event.currentTarget,async()=>{
  showMessage('login-message','Sending your code…');
  try{const result=await request({action:'send_code',email:$('staff-email').value.trim()});$('email-form').hidden=true;$('code-form').hidden=false;$('staff-code').value='';$('code-hint').textContent='Check '+$('staff-email').value.trim()+', including spam.';showMessage('login-message',result.message);$('staff-code').focus();}catch(error){showMessage('login-message',error.message,true);}
});});
$('change-email').addEventListener('click',()=>{$('code-form').hidden=true;$('email-form').hidden=false;showMessage('login-message','');$('staff-email').focus();});
$('code-form').addEventListener('submit',event=>{event.preventDefault();busy(event.currentTarget,async()=>{
  showMessage('login-message','Signing in…');
  try{session=await request({action:'verify_code',email:$('staff-email').value.trim(),code:$('staff-code').value.trim()});sessionStorage.setItem(storageKey,JSON.stringify(session));$('staff-code').value='';showMessage('login-message','');activate();}catch(error){session=null;showMessage('login-message',error.message,true);}
});});
$('signout').addEventListener('click',async()=>{const button=$('signout');button.disabled=true;try{await request({action:'logout'});clearSession('You have signed out.');}catch(error){showMessage('list-message','Sign-out could not be confirmed. Please retry.',true);}finally{button.disabled=false;}});
document.querySelectorAll('[data-kind]').forEach(button=>button.addEventListener('click',()=>{
  kind=button.dataset.kind;offset=0;search='';$('search').value='';
  document.querySelectorAll('[data-kind]').forEach(b=>{b.classList.toggle('selected',b===button);if(b===button)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  $('page-title').textContent=kind==='hospital'?'Hospital applications':'Radiologist applications';
  $('page-description').textContent=kind==='hospital'?'Coverage needs, schedules, and contact details—in one place.':'Get to know your applicants, their availability, and their experience.';
  $('summary-description').textContent=kind==='hospital'?'Select an application to see the full coverage request.':'Select an application to see availability and download the resume.';
  loadList();
}));
$('search-form').addEventListener('submit',event=>{event.preventDefault();search=$('search').value.trim();offset=0;loadList();});
$('search').addEventListener('search',()=>{if(!$('search').value){search='';offset=0;loadList();}});
$('previous').addEventListener('click',()=>{offset=Math.max(0,offset-25);loadList();});
$('next').addEventListener('click',()=>{offset+=25;loadList();});
$('refresh').addEventListener('click',()=>loadList());
async function loadList(){
  const current=++version;$('applications').setAttribute('aria-busy','true');$('previous').disabled=true;$('next').disabled=true;
  $('applications').replaceChildren(el('div','Loading applications…','empty'));showMessage('list-message','');
  try{
    const result=await request({action:'list',kind,search,offset});if(current!==version||!session)return;
    $('hospital-count').textContent=result.counts.hospital;$('radiologist-count').textContent=result.counts.radiologist;$('total-count').textContent=result.counts[kind];
    $('applications').replaceChildren();
    if(!result.items.length){const empty=el('div',undefined,'empty');empty.append(el('h3',search?'No matching applications':'No applications yet'),el('p',search?'Try a different name, email, or confirmation number.':'New submissions will appear here.'));$('applications').append(empty);}
    for(const item of result.items){
      const row=el('article',undefined,'application-row');const identity=el('div');identity.append(el('h3',item.full_name,'app-name'),el('div',item.organization||item.email,'app-subtitle'));
      const date=el('div',dateText(item.created_at),'date-label');date.append(el('small','Received'));
      const button=el('button','View application →','view-button');button.setAttribute('aria-label','View application from '+item.full_name);button.addEventListener('click',()=>openDetail(item.id));
      row.append(identity,date,el('span',item.status,'badge'),button);$('applications').append(row);
    }
    $('result-count').textContent=result.total?`${offset+1}–${Math.min(offset+25,result.total)} of ${result.total}${search?' matching':''} applications`:'0 applications';
    $('previous').disabled=offset===0;$('next').disabled=offset+25>=result.total;
  }catch(error){if(current===version&&session){$('applications').replaceChildren(el('div','Applications could not be loaded. Use Refresh to try again.','empty'));showMessage('list-message',error.message,true);}}
  finally{if(current===version)$('applications').setAttribute('aria-busy','false');}
}
function section(title){const node=el('section',undefined,'detail-section');node.append(el('h3',title));return node;}
function field(list,label,value,linkType){const wrap=el('div');wrap.append(el('dt',label));const dd=el('dd');if(value&&linkType){const link=el('a',value);link.href=linkType+value;dd.append(link);}else dd.textContent=value===null||value===undefined||value===''?'Not provided':String(value);wrap.append(dd);list.append(wrap);}
async function openDetail(id){
  const current=++detailVersion;const body=$('detail-body');body.replaceChildren(el('h2','Loading application…'));$('detail-kind').textContent='APPLICATION';$('detail-dialog').showModal();
  try{
    const result=await request({action:'detail',id});if(current!==detailVersion||!session)return;
    const {submission:s,application:a,shifts,emails}=result;body.replaceChildren();$('detail-kind').textContent=s.kind==='hospital'?'HOSPITAL APPLICATION':'RADIOLOGIST APPLICATION';
    const heading=el('div',undefined,'detail-heading'),title=el('h2',a.full_name);title.id='detail-title';heading.append(title);
    if(a.organization)heading.append(el('p',a.organization,'muted'));
    heading.append(el('span',s.status,'badge'),el('p','Received '+new Date(s.created_at).toLocaleString(),'muted'),el('p','Confirmation: '+s.confirmation_number,'reference'));body.append(heading);
    const contact=section('Contact details'),fields=el('dl',undefined,'fields');field(fields,'First and last name',a.full_name);if(s.kind==='hospital')field(fields,'Group or hospital',a.organization);field(fields,'Email address',a.email,'mailto:');field(fields,'Phone number',a.phone,'tel:');contact.append(fields);body.append(contact);
    const schedule=section(s.kind==='hospital'?'Coverage requested':'Reading availability');schedule.append(el('p','Time zone: '+a.timezone,'muted'));const list=el('ul',undefined,'shift-list');
    for(const shift of shifts){const row=el('li');row.append(el('strong',days[shift.day_of_week]));const description=el('span',shift.all_day?'24-hour coverage':timeText(shift.start_time)+' – '+timeText(shift.end_time)+(shift.end_time<shift.start_time?' (next day)':''));if(shift.frequency)description.append(el('small',shift.frequency==='weekly'?'Every week':shift.frequency+' time'+(shift.frequency==='1'?'':'s')+' per month'));row.append(description);list.append(row);}schedule.append(list);
    if(s.kind==='hospital'){const volume=el('dl',undefined,'fields');field(volume,'Estimated average daily cases',a.volume_unsure?'Not sure yet':a.daily_cases);schedule.append(el('br'),volume);}body.append(schedule);
    if(s.kind==='radiologist'){
      const resume=section('Resume'),box=el('div',undefined,'resume-box'),label=el('p',a.resume_original_name);label.append(el('small',Math.max(1,Math.ceil(a.resume_size/1024))+' KB · Private file'));
      const button=el('button','Download resume ↓','primary'),status=el('p');status.setAttribute('role','status');
      button.addEventListener('click',async()=>{button.disabled=true;status.textContent='Preparing download…';try{const blob=await request({action:'resume',id},true);if(!session)return;const url=URL.createObjectURL(blob),link=el('a');link.href=url;link.download=a.resume_original_name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='Download started.';}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
      box.append(label,button);resume.append(box,status);body.append(resume);
    }
    const notes=section('Additional notes');notes.append(el('p',a.notes||'No additional notes provided.','notes'));body.append(notes);
    const delivery=section('Email confirmations');for(const email of emails){const state=email.status==='sent'?'Sent to the email provider':email.status==='failed'?'Not sent — needs review':'Queued for sending';delivery.append(el('p',(email.audience==='staff'?'Staff notification':'Applicant confirmation')+': '+state,'email-state'));}body.append(delivery);
  }catch(error){if(current===detailVersion&&session)body.replaceChildren(el('h2','Unable to open application'),el('p',error.message,'error'));}
}
$('close-detail').addEventListener('click',()=>$('detail-dialog').close());
$('detail-dialog').addEventListener('close',()=>{detailVersion++;$('detail-body').replaceChildren();});
try{session=JSON.parse(sessionStorage.getItem(storageKey));}catch{sessionStorage.removeItem(storageKey);}
activate();
})();
