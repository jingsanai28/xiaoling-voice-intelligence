import { useEffect, useState } from 'react';
import { mockUsageRecords } from '@/mocks/knowledge';
import { knowledgeApi } from '@/services/knowledgeApi';
import type { UsageRecord } from '@/types/knowledge';

const actionLabels: Record<string, { label: string; icon: string; color: string }> = {
  cited: { label: 'Agent 引用', icon: 'ri-link-m', color: 'bg-primary-50 text-primary-700 border-primary-200/40' },
  viewed: { label: '管理员查看', icon: 'ri-eye-line', color: 'bg-secondary-50 text-secondary-700 border-secondary-200/40' },
  feedback: { label: '引用反馈', icon: 'ri-feedback-line', color: 'bg-accent-50 text-accent-700 border-accent-200/40' },
};

export default function UsageRecords() {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [records, setRecords] = useState<UsageRecord[]>(mockUsageRecords);

  useEffect(() => {
    knowledgeApi.usage().then(setRecords).catch(() => undefined);
  }, []);

  const filtered = filterAction === 'all'
    ? records
    : records.filter((r) => r.action === filterAction);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground-900 font-heading">使用记录</h3>
          <p className="text-[11px] text-foreground-500 font-body mt-0.5">系统记录所有上传、编辑、审核、发布、停用和引用问题反馈</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] text-foreground-500 font-label">筛选：</span>
        {[
          { value: 'all', label: '全部' },
          { value: 'cited', label: 'Agent 引用' },
          { value: 'viewed', label: '管理员查看' },
          { value: 'feedback', label: '引用反馈' },
        ].map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilterAction(f.value)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer whitespace-nowrap font-label ${
              filterAction === f.value
                ? 'bg-primary-500 text-background-50'
                : 'bg-background-50 border border-background-200/70 text-foreground-600 hover:bg-background-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Records Table */}
      <div className="rounded-lg border border-background-200/70 bg-background-50 overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-background-100 border-b border-background-200/70 text-[10px] font-semibold text-foreground-500 uppercase tracking-wider font-label">
          <span className="col-span-2">时间</span>
          <span className="col-span-2">操作类型</span>
          <span className="col-span-2">事件</span>
          <span className="col-span-3">知识文档</span>
          <span className="col-span-1">版本</span>
          <span className="col-span-2">操作人</span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-background-200/70 flex items-center justify-center">
              <i className="ri-history-line text-lg text-foreground-400"></i>
            </div>
            <p className="text-xs text-foreground-500 font-body">暂无使用记录</p>
          </div>
        ) : (
          filtered.map((record) => {
            const action = actionLabels[record.action];
            return (
              <div key={record.id} className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-background-200/40 last:border-b-0 items-center hover:bg-background-100/50 transition-colors">
                <span className="col-span-2 text-[10px] font-mono text-foreground-500">{record.timestamp}</span>
                <span className={`col-span-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-label w-fit border ${action.color}`}>
                  <i className={`${action.icon} text-[9px]`}></i>
                  {action.label}
                </span>
                <span className="col-span-2 text-[10px] text-foreground-700 font-body truncate" title={record.eventTitle}>{record.eventTitle}</span>
                <span className="col-span-3 text-[10px] text-foreground-700 font-body truncate" title={record.documentTitle}>{record.documentTitle}</span>
                <span className="col-span-1 text-[10px] font-mono text-foreground-500">v{record.version}</span>
                <span className="col-span-2 text-[10px] text-foreground-500 font-body">{record.user}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
