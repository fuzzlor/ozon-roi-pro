/* The quick model and calendar model share only per-unit assumptions. */
(function(){
 const S=ProSettings;
 Object.assign(a,S.read());
 const transfer=S.get(S.planKey);
 if(Number.isInteger(transfer)&&transfer>=0&&transfer<=1e7){a.sales=transfer;S.remove(S.planKey);$('transferNotice').textContent='План продаж перенесён из быстрого расчёта: '+num(transfer)+' шт. за 30 дней. Проверь календарь закупок и поставок — он не изменён.';}
 const orig=render;
 render=function(){orig();S.write(a);};
 form();refresh();
 window.addEventListener('pageshow',e=>{if(e.persisted){Object.assign(a,S.read());form();refresh();}});
})();
