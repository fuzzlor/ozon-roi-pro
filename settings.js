/* Common settings between the quick and daily models; no sales or calendar changes without explicit action. */
(function(g){
 const key='ozon-pro-shared-v02', planKey='ozon-pro-transfer-plan-v02', classicKey='ozon-pro-classic-v02', dailyKey='ozon-pro-v01';
 const limits={price:[1,1e7],cost:[.01,1e7],discount:[0,100],commission:[0,100],logistics:[0,1e6],acquiring:[0,100],drr:[0,100],extra:[0,1e6],eligible:[0,100],vat:[0,100],usn:[0,100],premiumVat:'bool',minTax:'bool'};
 function get(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}
 function put(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}
 function remove(k){try{localStorage.removeItem(k)}catch{}}
 function common(a){const out={};for(const [k,l] of Object.entries(limits)){const v=a?.[k];if(l==='bool'?typeof v==='boolean':typeof v==='number'&&Number.isFinite(v)&&v>=l[0]&&v<=l[1])out[k]=v;}return out}
 g.ProSettings={key,planKey,classicKey,dailyKey,limits,get,put,remove,common,read(){return common(get(key)||get(dailyKey)?.a||{})},write(a){return put(key,common(a))}};
})(globalThis);
