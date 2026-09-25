'use strict';
const $=id=>document.getElementById(id);
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const time=t=>{const [h,m]=t.split(':').map(Number);return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'a.m.':'p.m.'}`;};
let draft;
try{draft=JSON.parse(sessionStorage.getItem('atr-coverage-draft'));}catch{}
if(!draft||draft.version!==1||!draft.fields||!Array.isArray(draft.schedule)||draft.schedule.length!==7){$('missing').hidden=false;}else{
$('confirmation').hidden=false;
const add=(target,label,value)=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;$(target).append(dt,dd);};
for(const [key,label]of [['fullName','First and Last Name'],['organization','Group or hospital'],['email','Email address'],['phone','Phone number']])add('contact-details',label,draft.fields[key]||'Not provided');
add('schedule-details','Requested coverage',draft.schedule.flatMap((s,i)=>s.selected?[`${days[i]}: ${s.allDay?'24 hours':`${time(s.start)} – ${time(s.end)}${s.end<s.start?' (next day)':''}`}`]:[]).join('\n'));
add('schedule-details','Time zone',draft.timezoneLabel);
add('schedule-details','Average daily cases',draft.unsure?'Not sure yet':draft.cases+' cases during requested coverage hours');
$('review-notes').textContent=draft.fields.notes||'No additional notes.';
$('confirm-form').addEventListener('submit',e=>{e.preventDefault();$('confirm-form').hidden=true;$('confirmed').hidden=false;$('confirmed').focus();});
}
