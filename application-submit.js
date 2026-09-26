/* Public project key only. Administrator and email credentials stay on the server. */
window.ATRSubmission=(()=>{
  const endpoint='https://bxaachlardxdofkmfruu.supabase.co/functions/v1/atr-submit';
  const key='sb_publishable_Eg1TVPfyRzdkXWcI_CXg2Q_gw6n_CWA';
  function payload(kind,draft){
    return {kind,full_name:draft.fields.fullName,email:draft.fields.email,phone:draft.fields.phone||'',timezone:draft.timezoneLabel,notes:draft.fields.notes||'',organization:draft.fields.organization,volume_unsure:draft.unsure===true,daily_cases:draft.unsure?null:Number(draft.cases),shifts:draft.schedule.flatMap((s,i)=>s.selected?[{day:i,start:s.start,end:s.end,all_day:s.allDay===true,frequency:s.frequency}]:[])};
  }
  async function submit(kind,draft,file){
    const data=payload(kind,draft),storageKey='atr-'+kind+'-submission';
    // Include file bytes so changing a Resume cannot reuse an old submission key.
    const bytes=file?new Uint8Array(await file.arrayBuffer()):new Uint8Array();
    const fileHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
    const fingerprint=JSON.stringify({data,fileHash,name:file?.name});
    let attempt;try{attempt=JSON.parse(sessionStorage.getItem(storageKey));}catch{}
    if(attempt?.fingerprint!==fingerprint)attempt={fingerprint,draft:JSON.stringify(draft),id:crypto.randomUUID()};
    sessionStorage.setItem(storageKey,JSON.stringify(attempt));
    if(attempt.receipt)return attempt.receipt;
    data.idempotency_key=attempt.id;
    const body=new FormData();body.set('application',JSON.stringify(data));if(file)body.set('resume',file);
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),60000);
    let response;try{response=await fetch(endpoint,{method:'POST',headers:{apikey:key},body,signal:controller.signal});}catch{throw Error('We could not confirm the submission. Your answers are still here. Please try again; retries will not create a duplicate.');}finally{clearTimeout(timeout);}
    const answer=await response.json().catch(()=>({}));
    if(!response.ok||!answer.confirmation_number)throw Error(answer.error||'Unable to confirm submission. Please try again.');
    attempt.receipt=answer;try{sessionStorage.setItem(storageKey,JSON.stringify(attempt));}catch{}
    return answer;
  }
  function showReceipt(receipt){
    const form=document.getElementById('confirm-form'),status=document.getElementById('confirmed');
    form.hidden=true;status.replaceChildren();
    const title=document.createElement('h2');title.textContent='Thank you. Your application was received.';
    const number=document.createElement('p');number.textContent='Confirmation number: '+receipt.confirmation_number;number.style.overflowWrap='anywhere';
    const message=document.createElement('p');message.textContent=receipt.email_status==='unavailable'?'Your application is saved. Email confirmations are not available yet. Please save this confirmation number for your records.':'Your application is saved. A confirmation email is queued for delivery. Please save this number for your records.';
    const link=document.createElement('a');link.href='index.html';link.textContent='Return to ATR';status.append(title,number,message,link);status.hidden=false;status.focus();
  }
  function showError(message){let error=document.getElementById('submit-error');if(!error){error=document.createElement('p');error.id='submit-error';error.className='error-box';error.setAttribute('role','alert');document.getElementById('confirm-form').append(error);}error.textContent=message;}
  function completed(kind,draft){try{const attempt=JSON.parse(sessionStorage.getItem('atr-'+kind+'-submission'));return attempt?.draft===JSON.stringify(draft)?attempt.receipt:null;}catch{return null;}}
  return {submit,showReceipt,showError,completed};
})();
