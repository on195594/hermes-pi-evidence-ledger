# Hermes×Pi 验证证据台账

手机优先的个人工程验证台账。Sites 保存版本，不执行生产部署。

## 当前能力
实践新建/编辑、领域/状态/层级/结果/用时/下一步筛选、详情与历史快照、语义链路模板、四类结果录入与校验、分层证据与场景覆盖、下一步行动、基础周复盘。

初始仅一项待验证实践，零运行记录；目标架构不代表实现完成。模拟、局部、真实链路独立留证。真实链路要求人工确认和证据位置，不自动检查远端或执行任务。场景覆盖不是验收通过。

## 数据与恢复
当前 MVP 使用当前浏览器 localStorage（键 hermes-pi-ledger-v1），没有云端同步。清理浏览器数据会丢失本机记录。顶部导出 JSON 备份/导入恢复；导入是完整替换，须确认。导出失败时不要清理原浏览器数据。

SQLite 友好模型包含 practices、verification_records、practice_versions。底部下载 schema.sql 和 ledger-data.sql，依次在空 SQLite 库执行。主键是 UUID（初始模板为稳定标识），记录以追加方式保存，不覆写证据。重复 task_id 允许作为同一任务的重跑，记录 ID 独立。

`timeout` 使用 null 退出码；`invalid_output` 保留实际退出码或 null。真实链路的 ok 只证明已录入的那个场景，不代表全部系统经过验收。

周计划按北京时间周一归组。闭环率=本周 closed 实践/本周全部实践；闭环要求已有记录及继续/暂缓/停止判断，不等同于通过。未闭环失败按所属实践尚未 closed 统计；常见错误按完整文本精确聚合。

## 开发与检查
- Node 22+；`pnpm install`、`pnpm dev`
- `node --test tests/ledger.test.mjs`
- `node node_modules/typescript/bin/tsc --noEmit`
- `pnpm build`

没有队列、DAG、独立数据库服务、生产自动部署或 Agent 执行能力。浏览器保存是本机 MVP 的明确边界；未来如需多设备同步，可使用同一表结构迁移至单文件 SQLite 后端。
