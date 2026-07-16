export default function Permissions() {
  const roles = [
    {
      name: '系统管理员',
      icon: 'ri-admin-line',
      permissions: '全部信号查看、规则配置、角色管理',
      cases: '全部',
      actions: '全部操作',
      color: 'bg-foreground-100 text-foreground-700',
    },
    {
      name: '风险管理员',
      icon: 'ri-shield-user-line',
      permissions: '全部高价值信号、复核队列',
      cases: '全部信号',
      actions: '分派、复核、关闭',
      color: 'bg-accent-50 text-accent-700',
    },
    {
      name: '客服主管',
      icon: 'ri-customer-service-2-line',
      permissions: '客服质检相关信号',
      cases: '客服质检、涉及客服的混合场景',
      actions: '查看、备注、提交复核',
      color: 'bg-primary-50 text-primary-700',
    },
    {
      name: '品牌/公关负责人',
      icon: 'ri-megaphone-line',
      permissions: '品牌舆情和公开传播信号',
      cases: '品牌舆情、公开传播、媒体相关',
      actions: '查看、备注、提交复核',
      color: 'bg-accent-50 text-accent-600',
    },
    {
      name: '运营/产品负责人',
      icon: 'ri-bar-chart-grouped-line',
      permissions: '运营反馈、Bug、需求类信号',
      cases: '运营反馈、产品缺陷、功能需求',
      actions: '查看、备注、问题跟进',
      color: 'bg-secondary-100 text-secondary-700',
    },
    {
      name: '只读观察者',
      icon: 'ri-eye-line',
      permissions: '脱敏结果和复盘材料',
      cases: '脱敏后的案例和复盘',
      actions: '仅查看',
      color: 'bg-background-200 text-foreground-600',
    },
  ];

  const principles = [
    { title: '默认最小权限', desc: '每个角色只能看到与职责相关的信号详情' },
    { title: '高风险动作留痕', desc: '所有高风险决策必须留下人工记录，不可撤回' },
    { title: '敏感信息隔离', desc: '原始敏感信息不进入公开展示材料，脱敏后方可用于评估' },
    { title: 'AI 不越权', desc: 'AI 不可代表企业认责、赔偿或对外发布回应' },
  ];

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Info Banner */}
      <div className="rounded-lg bg-primary-50 border border-primary-200/70 p-4">
        <div className="flex items-start gap-3">
          <i className="ri-information-line text-primary-600 text-lg mt-0.5"></i>
          <div>
            <h3 className="text-sm font-semibold text-primary-700 font-heading mb-1">MVP 阶段说明</h3>
            <p className="text-xs text-primary-600 font-body leading-relaxed">
              当前版本展示角色设计方案和权限边界。真实企业身份系统（SSO、LDAP、RBAC）将在生产阶段接入。
              MVP 阶段所有功能对所有用户开放，但界面设计已预留角色边界。
            </p>
          </div>
        </div>
      </div>

      {/* Role Cards */}
      <section>
        <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-4">角色定义</h3>
        <div className="grid grid-cols-3 gap-3">
          {roles.map((role) => (
            <div key={role.name} className="rounded-lg bg-background-50 border border-background-200/70 p-4">
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg mb-3 ${role.color}`}>
                <i className={`${role.icon} text-lg`}></i>
              </div>
              <h4 className="text-sm font-semibold text-foreground-800 mb-2 font-label">{role.name}</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-foreground-400">权限范围</span>
                  <p className="text-foreground-700 mt-0.5 font-body">{role.permissions}</p>
                </div>
                <div>
                  <span className="text-foreground-400">可查看信号</span>
                  <p className="text-foreground-700 mt-0.5 font-body">{role.cases}</p>
                </div>
                <div>
                  <span className="text-foreground-400">可执行动作</span>
                  <p className="text-foreground-700 mt-0.5 font-body">{role.actions}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Permission Principles */}
      <section>
        <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-4">权限安全原则</h3>
        <div className="grid grid-cols-4 gap-3">
          {principles.map((p) => (
            <div key={p.title} className="rounded-lg bg-background-50 border border-background-200/70 p-4">
              <h4 className="text-xs font-semibold text-foreground-700 mb-2 font-label">{p.title}</h4>
              <p className="text-[11px] text-foreground-500 leading-relaxed font-body">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Capability Boundary */}
      <section className="rounded-lg bg-background-50 border border-background-200/70 p-5">
        <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-4">AI 能力边界</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-secondary-600 mb-2 font-label">小聆可以执行</h4>
            <ul className="space-y-1.5">
              {['分析反馈内容和信号', '降噪去重和主题聚合', '判定信号价值和优先级', '关联历史相似事件', '生成行动建议和复核摘要'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-foreground-600 font-body">
                  <i className="ri-check-line text-secondary-500 text-sm"></i>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-accent-600 mb-2 font-label">小聆不可执行</h4>
            <ul className="space-y-1.5">
              {['代表企业认责或道歉', '承诺赔偿或退款', '对外发布回应或声明', '绕过权限查看敏感数据', '未经人工确认执行高风险动作'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-foreground-600 font-body">
                  <i className="ri-close-line text-accent-500 text-sm"></i>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}