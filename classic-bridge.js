/* Preserve all original Lite controls and keep common product settings synced. */
(function(){
 const S=ProSettings, orig=render;
 const tips={price:'Цена до скидки площадки. Например, 1 330 ₽.',cost:'Цена закупки одной единицы без дополнительных расходов.',discount:'Скидка покупателю по модели соинвеста.',extra:'Упаковка и доставка товара до Ozon на единицу; включаются в полную себестоимость.',qty:'Условный объём партии для быстрого расчёта ROI. Не календарь поставок.',turns:'Сколько таких партий продаётся за 30 дней. Например, 2 000 × 1 = 2 000 шт.',commission:'Процент от цены продавца по допущению Lite.',logistics:'Стоимость доставки покупателю за единицу.',acquiring:'Плата за обработку оплаты, в процентах от цены продавца.',drr:'Доля рекламных расходов от цены продавца.',vat:'Ставка для выделения НДС из принятой базы.',usn:'Налог на положительную базу доходов минус расходов.',eligible:'Какая часть номинальных услуг доступна для зачёта скидки.',basePrice:'Цена эталонной стратегии, с которой сравниваем текущую.',baseTurns:'Число оборотов эталонной стратегии.'};
 for(const [k,t] of Object.entries(tips)){const el=$(k);if(!el)continue;const l=el.closest('label')||document.querySelector('label[for="'+k+'"]');if(l){const s=document.createElement('small');s.style.cssText='display:block;font-weight:400;line-height:1.35;margin-top:3px';s.textContent=t;l.appendChild(s);}else el.title=t;}
 for(const [k,l] of Object.entries(S.limits)){if(Array.isArray(l)&&$(k)){ $(k).min=l[0];$(k).max=l[1];}}
 function restore(){
 const state=S.get(S.classicKey);
 if(state?.values){for(const k of ids)if(Number.isFinite(state.values[k]))$(k).value=state.values[k];if(Array.isArray(state.manualPrices)&&state.manualPrices.length===3)manualPrices=state.manualPrices.map(Boolean);for(let i=0;i<3;i++){if(Number.isFinite(state.prices?.[i]))$('sp'+i).value=state.prices[i];if(Number.isFinite(state.turns?.[i]))$('sn'+i).value=state.turns[i];}if([1,3,6,12].includes(state.period))period=state.period;if(['profit','roi'].includes(state.chartMode))chartMode=state.chartMode;}
 for(const [k,v] of Object.entries(S.read())){const el=$(k);if(!el)continue;if(typeof v==='boolean')el.checked=v;else el.value=v;}
 }
 function save(){const a=read();S.write(a);S.put(S.classicKey,{values:a,manualPrices:[...manualPrices],prices:[0,1,2].map(i=>$('sp'+i).valueAsNumber),turns:[0,1,2].map(i=>$('sn'+i).valueAsNumber),period,chartMode});}
 render=function(){orig();save();};
 restore();render();
 $('transferPlan').onclick=()=>{const a=read(),n=Math.round(a.qty*a.turns);if(!Number.isFinite(n)||n>1e7){alert('План продаж превышает допустимый диапазон календарной модели.');return;}if(!S.put(S.planKey,n)){alert('Не удалось сохранить план в браузере. Введи спрос в календарной модели вручную.');return;}location.href='advanced.html';};
 window.addEventListener('pageshow',e=>{if(e.persisted){restore();render();}});
})();
