export const statuses=['ok','failed','timeout','invalid_output'];
export const levels=['simulation','local','real'];
export const levelNames={simulation:'模拟验收',local:'局部验证',real:'真实链路验证'};
export function validateRecord(r){
 const errors={};
 for(const k of ['task_id','input','output','reproduce','next_action','evidence']) if(typeof r[k]!=='string'||!r[k].trim()) errors[k]='请填写此项';
 if(!statuses.includes(r.status)) errors.status='请选择有效结果';
 if(!levels.includes(r.level)) errors.level='请选择验证层级';
 if(!Number.isInteger(r.elapsed_ms)||r.elapsed_ms<0) errors.elapsed_ms='请输入非负整数毫秒';
 if(r.exit_code!==null&&!Number.isInteger(r.exit_code)) errors.exit_code='退出码须为整数或 null';
 if(typeof r.result!=='string') errors.result='result 必须为文本';
 if(typeof r.error!=='string') errors.error='error 必须为文本';
 if(r.status==='ok'){
  if(r.exit_code!==0) errors.exit_code='ok 的退出码必须是 0';
  if(typeof r.result!=='string'||!r.result.trim()) errors.result='ok 必须填写实际结果';
  if(r.error?.trim()) errors.error='ok 的 error 应为空';
 }else{
  if(typeof r.error!=='string'||!r.error.trim()) errors.error='请填写错误或失败原因';
  if(r.status==='failed'&&(r.exit_code===null||r.exit_code===0)) errors.exit_code='failed 需要实际非零退出码';
  if(r.status==='timeout'&&r.exit_code!==null) errors.exit_code='此模板 timeout 使用 null 表示未获得退出码';
 }
 if(r.level==='real'&&!r.real_confirmed) errors.real_confirmed='请确认确实经过 Hermes → Pi 实际调用';
 return errors;
}
export function coverage(records,level){return statuses.filter(s=>records.some(r=>r.level===level&&r.status===s));}
export function exportSql(data){
 const q=v=>v==null?'NULL':typeof v==='number'?String(v):"'"+String(v).replaceAll("'","''")+"'";
 const insert=(table,rows,keys)=>rows.map(r=>`INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(k=>q(typeof r[k]==='boolean'?Number(r[k]):r[k])).join(',')});`).join('\n');
 return 'PRAGMA foreign_keys=ON;\nBEGIN;\n'+insert('practices',data.practices,['id','title','domain','state','minutes','week','goal','facts','hypotheses','steps','method','benefit','limitations','next_action','decision','code_ref','created_at','updated_at'])+'\n'+insert('verification_records',data.records,['id','practice_id','task_id','status','level','exit_code','elapsed_ms','result','error','input','output','evidence','reproduce','fix','next_action','real_confirmed','created_at'])+'\n'+insert('practice_versions',data.versions.map(v=>({...v,snapshot:JSON.stringify(v.snapshot)})),['id','practice_id','snapshot','created_at'])+'\nCOMMIT;\n';
}
export function validateBackup(d){
 if(d?.schema_version!==1||!Array.isArray(d.practices)||!Array.isArray(d.records)||!Array.isArray(d.versions))throw Error('不支持的备份格式');
 const ids=new Set();for(const p of d.practices){
  if(typeof p.id!=='string'||ids.has(p.id))throw Error('实践 ID 重复或无效');ids.add(p.id);
  for(const k of ['title','domain','state','week','goal','facts','hypotheses','steps','method','benefit','limitations','next_action','decision','code_ref','created_at','updated_at'])if(typeof p[k]!=='string')throw Error('实践字段缺失：'+k);
  if(!['pending','active','closed'].includes(p.state)||!Number.isInteger(p.minutes)||p.minutes<1)throw Error('实践状态或用时无效');
 }
 const rids=new Set();for(const r of d.records){if(typeof r.fix!=='string'||typeof r.real_confirmed!=='boolean')throw Error('验证字段无效');if(!ids.has(r.practice_id)||typeof r.id!=='string'||rids.has(r.id)||Object.keys(validateRecord(r)).length||typeof r.created_at!=='string')throw Error('验证记录不完整或关联无效');rids.add(r.id);}
 for(const v of d.versions)if(!ids.has(v.practice_id)||typeof v.id!=='string'||typeof v.created_at!=='string'||!v.snapshot||typeof v.snapshot.title!=='string')throw Error('历史版本无效');
 return d;
}
