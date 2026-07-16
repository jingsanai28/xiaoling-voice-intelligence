import { useState } from 'react';
import type { EventCardData } from '@/types/conversation';

interface TaskModalProps {
  eventData: EventCardData;
  onConfirm: (data: { title: string; team: string; assignee: string; priority: string; deadline: string; description: string }) => void;
  onClose: () => void;
}

export default function TaskModal({ eventData, onConfirm, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(eventData.title);
  const [team, setTeam] = useState(eventData.teams[0] || '');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState(eventData.riskLevel);
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState(eventData.summary);

  const handleSubmit = () => {
    onConfirm({ title, team, assignee, priority, deadline, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-background-50 rounded-xl border border-background-200/70 w-[480px] max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-background-200/70">
          <div className="flex items-center gap-2">
            <i className="ri-task-line text-lg text-primary-500"></i>
            <h3 className="text-sm font-semibold text-foreground-900 font-heading">添加到任务</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background-100 text-foreground-400 hover:text-foreground-600 transition-colors cursor-pointer"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label">任务标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-800 placeholder:text-foreground-400 hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label">责任团队</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-800 appearance-none cursor-pointer hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
              >
                {eventData.teams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label">负责人</label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="输入负责人姓名..."
                className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-800 placeholder:text-foreground-400 hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label">优先级</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-800 appearance-none cursor-pointer hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
              >
                <option value="P0">P0 · 最高优先级</option>
                <option value="P1">P1 · 高优先级</option>
                <option value="P2">P2 · 中优先级</option>
                <option value="P3">P3 · 低优先级</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label">截止时间</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-800 hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label">任务说明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-800 placeholder:text-foreground-400 resize-none hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-background-200/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-600 hover:bg-background-100 transition-all cursor-pointer whitespace-nowrap font-label"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-sm font-medium text-background-50 hover:bg-primary-600 transition-all cursor-pointer whitespace-nowrap font-label"
          >
            <i className="ri-check-line"></i>
            <span>确认添加</span>
          </button>
        </div>
      </div>
    </div>
  );
}