/* Daily financial simulation. All values are rubles; dates are day indices starting at 1. */
(function(root){
'use strict';
function unit(a){
 const discount=a.price*a.discount/100, real=a.price-discount, commission=a.price*a.commission/100, acquiring=a.price*a.acquiring/100, ads=a.price*a.drr/100, nominal=commission+acquiring+ads+a.logistics, credit=Math.min(discount,nominal*a.eligible/100), premium=discount-credit, actual=nominal-credit, vatBase=real+(a.premiumVat?premium:0), vat=vatBase*a.vat/(100+a.vat), payout=real+premium-actual, cost=a.cost+(a.extra||0), before=payout-cost, taxBase=before-vat, tax=Math.max(0,taxBase*a.usn/100,a.minTax?Math.max(0,real+premium-vat)*.01:0), profit=taxBase-tax;
 return {discount,real,commission,acquiring,ads,nominal,credit,premium,actual,vatBase,vat,payout,cost,before,taxBase,tax,profit};
}
function demandAt(a,d){const v=a.dailyDemand?.[d-1];return Number.isInteger(v)&&v>=0?v:Math.floor(d*a.sales/30+1e-8)-Math.floor((d-1)*a.sales/30+1e-8);}
function coverage(a,day,stock){if(stock<=0)return {days:0,bounded:false};let left=stock,days=0;for(let d=day+1;d<=a.horizon;d++){const q=demandAt(a,d);if(q>left)return {days:days+left/q,bounded:false};left-=q;days++;if(left===0)return {days,bounded:false};}return {days,bounded:true};}
function simulate(a,orders,accelerate=true){
 const u=unit(a), H=a.horizon, events=[], rows=[], rejected=[], stock0=a.initialStock, investedStock=stock0*u.cost;
 let stock=stock0, transit=0, cash=a.capital, min=cash, ar=0, profit=0, sold=0, lost=0, fees=0, taxes=0, receipts=0, buys=0, oos=0, pending=[];
 let accepted=0,notBought=0,cycleSum=0,cycleUnits=0;const lots=stock0?[{qty:stock0,paid:0}]:[], buyout=Number.isFinite(a.buyout)?a.buyout:100;
 const mode=a.funding==='limited'; const due=new Map(), arrivals=new Map();
 const add=(m,d,x)=>{if(!m.has(d))m.set(d,[]);m.get(d).push(x)};
 const ordinaryDay=d=>Math.ceil(d/a.batchDays)*a.batchDays+a.delay;
 function receive(d){let gross=0,net=0,fee=0,reserve=0;for(const e of due.get(d)||[]){gross+=e.gross;net+=e.gross-e.fee;fee+=e.fee;reserve+=e.tax; ar-=e.gross;} due.delete(d);cash+=net-reserve;receipts+=net;taxes+=reserve;min=Math.min(min,cash);return {net,fee,reserve};}
 const byDay=new Map();orders.forEach((o,i)=>add(byDay,o.order,{...o,i}));
 for(let d=1;d<=H;d++){
  let received=receive(d), purchased=0, arrived=0;
  for(const n of arrivals.get(d)||[]){stock+=n.qty;transit-=n.qty;arrived+=n.qty;lots.push({...n});} arrivals.delete(d);
  for(const o of byDay.get(d)||[]){let q=o.qty; if(mode&&cash+1e-8<q*u.cost){rejected.push({day:d,qty:q});continue;} let cost=q*u.cost;cash-=cost;buys+=cost;purchased+=cost;min=Math.min(min,cash); if(o.arrival===d){stock+=q;arrived+=q;lots.push({qty:q,paid:d});}else{transit+=q;add(arrivals,o.arrival,{qty:q,paid:d});} }
  const demand=demandAt(a,d), fulfilled=Math.min(stock,demand);
  const s=Math.floor((accepted+fulfilled)*buyout/100+1e-8)-Math.floor(accepted*buyout/100+1e-8);accepted+=fulfilled;notBought+=fulfilled-s;stock-=s;sold+=s;lost+=demand-fulfilled;if(fulfilled<demand)oos++;
  let left=s,age=0;while(left>0&&lots.length){const lot=lots[0],q=Math.min(left,lot.qty);age+=q*(d-lot.paid);lot.qty-=q;left-=q;if(!lot.qty)lots.shift();}
  let gross=s*u.payout, share=accelerate? a.earlyShare/100:0;
  // When the payout would not arrive earlier, do not charge a fee.
  const regular=ordinaryDay(d), early=d+a.earlyDelay; if(early>=regular||gross<=0)share=0;
  if(gross>0){cycleSum+=age+s*(share*(early-d)+(1-share)*(regular-d));cycleUnits+=s;}
  const fast=gross*share, slow=gross-fast, fee=fast*a.fee/100, taxableSaving=a.feeDeductible?Math.min(u.tax*s,Math.max(0,fee*a.usn/100)):0, tax=(u.vat+u.tax)*s-taxableSaving;
  profit+=s*u.profit-fee+taxableSaving; fees+=fee; ar+=gross;
  if(s>0){if(gross<=0){add(due,d,{gross,fee:0,tax});}else{if(share>0)add(due,early,{gross:fast,fee,tax:tax*share});if(share<1)add(due,regular,{gross:slow,fee:0,tax:tax*(1-share)});}}
  const same=receive(d);received.net+=same.net;received.fee+=same.fee;received.reserve+=same.reserve;
  rows.push({day:d, demand,fulfilled,notBought:fulfilled-s,sold:s,lost:demand-fulfilled,stock,transit,arrived,purchased,receipt:received.net,reserve:received.reserve,paidFee:received.fee,cash,ar,profit,fees});
 }
 for(const [day,es] of due)for(const e of es)pending.push({day,...e});
 return {u,rows,sold,lost,accepted,notBought,cycleDays:cycleUnits?cycleSum/cycleUnits:null,oos,profit,fees,taxes,receipts,buys,cash,min,ar,stock,transit,investedStock,rejected,pending,needed:Math.max(0,a.capital-min),capitalTotal:a.capital+investedStock};
}
function plan(a,qty,interval,lead){const out=[];for(let d=1;d<=a.horizon;d+=interval)out.push({order:d,arrival:d+lead,qty});return out;}
const api={unit,simulate,plan,demandAt,coverage}; if(typeof module!=='undefined')module.exports=api;else root.Finance=api;
})(globalThis);
