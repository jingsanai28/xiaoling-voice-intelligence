import { useState } from 'react';

interface SpaceSettingsDrawerProps {
  spaceName: string;
  spaceDescription: string;
  onClose: () => void;
}

export default function SpaceSettingsDrawer({ spaceName, spaceDescription, onClose }: SpaceSettingsDrawerProps) {
  const [name, setName] = useState(spaceName);
  const [description, setDescription] = useState(spaceDescription);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(['客服', '运营']);
  const [agentScope, setAgentScope] = useState<string[]>(['客服 Agent', '品牌 Agent']);

  const toggleTeam = (team: string) => {
    setSelectedTeams((prev) => prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]);
  };

  const toggleAgent = (agent: string) => {
    setAgentScope((prev) => prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent]);
  };

  const allTeams = ['产品', '客服', '运营', '品牌/公关', '技术'];
  const allAgents = ['客服 Agent', '品牌 Agent', '产品 Agent', '运营 Agent'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-[420px] h-full bg-background-50 overflow-y-auto border-l border-background-200/70" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-background-50 z-10 p-5 border-b border-background-200/70">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground-900 font-heading">空间设置</h3>
            <button type="button" onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded text-foreground-500 hover:text-foreground-700 cursor-pointer">
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Basic Info */}
          <div>
            <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3">基本信息</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-foreground-600 font-label mb-1">空间名称</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-foreground-600 font-label mb-1">说明</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body resize-none"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                ></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-foreground-600 font-label mb-1">负责人</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
                  placeholder="输入负责人姓名"
                />
              </div>
            </div>
          </div>

          {/* Visible Teams */}
          <div>
            <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3">可见团队</h4>
            <div className="space-y-1.5">
              {allTeams.map((team) => (
                <label key={team} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTeams.includes(team)}
                    onChange={() => toggleTeam(team)}
                    className="w-3.5 h-3.5 rounded accent-primary-500 cursor-pointer"
                  />
                  <span className="text-xs text-foreground-700 font-body">{team}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Agent Scope */}
          <div>
            <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3">Agent 使用范围</h4>
            <p className="text-[10px] text-foreground-500 font-body mb-2">允许以下业务 Agent 检索该空间的知识</p>
            <div className="space-y-1.5">
              {allAgents.map((agent) => (
                <label key={agent} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agentScope.includes(agent)}
                    onChange={() => toggleAgent(agent)}
                    className="w-3.5 h-3.5 rounded accent-primary-500 cursor-pointer"
                  />
                  <span className="text-xs text-foreground-700 font-body">{agent}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3">成员角色</h4>
            <div className="space-y-2">
              {[
                { name: '张明', role: '管理员', icon: 'ri-vip-crown-line', color: 'text-primary-500' },
                { name: '李婷', role: '编辑者', icon: 'ri-edit-line', color: 'text-secondary-500' },
                { name: '王蕾', role: '审核人', icon: 'ri-shield-check-line', color: 'text-accent-500' },
              ].map((member) => (
                <div key={member.name} className="flex items-center justify-between p-2 rounded-lg bg-background-100 border border-background-200/70">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-background-200 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-foreground-600 font-mono">{member.name[0]}</span>
                    </div>
                    <span className="text-xs text-foreground-700 font-body">{member.name}</span>
                  </div>
                  <span className={`text-[10px] font-label ${member.color}`}>
                    <i className={`${member.icon} mr-1`}></i>{member.role}
                  </span>
                </div>
              ))}
              <button type="button" className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-dashed border-background-300 text-xs text-foreground-500 font-body hover:border-primary-300 hover:text-primary-600 transition-colors cursor-pointer">
                <i className="ri-add-line"></i>添加成员
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-background-200/70">
            <h4 className="text-[11px] font-semibold text-accent-600 uppercase tracking-wider font-label mb-2">危险操作</h4>
            <button type="button" className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-accent-200 text-accent-600 text-xs font-medium hover:bg-accent-50 transition-colors cursor-pointer whitespace-nowrap font-label">
              <i className="ri-pause-circle-line"></i>停用空间
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background-50 border-t border-background-200/70 p-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-background-200/70 text-xs text-foreground-600 font-label hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">取消</button>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap font-label">保存设置</button>
        </div>
      </div>
    </div>
  );
}