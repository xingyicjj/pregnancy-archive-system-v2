import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, AlertCircle, CheckCircle, Settings, Users, BarChart3 } from 'lucide-react';
import { exportAllData, downloadDataAsFile, importDataFromFile, ExportData } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';

interface DataManagerProps {
  onClose?: () => void;
}

export function DataManager({ onClose }: DataManagerProps) {
  const { refreshUserData } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [exportPreview, setExportPreview] = useState<ExportData | null>(null);
  const [importOptions, setImportOptions] = useState({
    overwrite: false,
    mergeUsers: true,
    preserveCurrentUser: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      downloadDataAsFile();
      // 同时显示预览
      const data = exportAllData();
      setExportPreview(data);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importDataFromFile(file, importOptions);
      setImportResult(result);
      
      if (result.success) {
        // 刷新应用数据
        refreshUserData();
        setTimeout(() => {
          window.location.reload(); // 刷新页面以确保所有组件都更新
        }, 1000);
      }
    } catch (error) {
      console.error('导入失败:', error);
      setImportResult({ success: false, message: '导入失败，请稍后重试' });
    } finally {
      setIsImporting(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getDataSummary = () => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('pregnancy-registered-users') || '[]');
      const reports = JSON.parse(localStorage.getItem('pregnancy-reports') || '[]');
      const healthMetrics = JSON.parse(localStorage.getItem('pregnancy-metrics') || '[]');
      
      return {
        users: registeredUsers.length,
        reports: reports.length,
        metrics: healthMetrics.length,
      };
    } catch {
      return { users: 0, reports: 0, metrics: 0 };
    }
  };

  const dataSummary = getDataSummary();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Settings className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">数据管理</h2>
                <p className="text-sm text-gray-600">备份和恢复您的数据</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* 数据概览 */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">当前数据概览</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Users size={16} className="text-blue-600" />
                </div>
                <div className="text-lg font-bold text-gray-800">{dataSummary.users}</div>
                <div className="text-xs text-gray-600">用户</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
                  <FileText size={16} className="text-green-600" />
                </div>
                <div className="text-lg font-bold text-gray-800">{dataSummary.reports}</div>
                <div className="text-xs text-gray-600">报告</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2">
                  <BarChart3 size={16} className="text-purple-600" />
                </div>
                <div className="text-lg font-bold text-gray-800">{dataSummary.metrics}</div>
                <div className="text-xs text-gray-600">指标</div>
              </div>
            </div>
          </div>

          {/* 导出功能 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📤 导出数据</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4">
                将您的所有数据导出为 JSON 文件，包括用户信息、检查报告、健康指标等。
              </p>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Download size={20} />
                <span>{isExporting ? '导出中...' : '导出数据'}</span>
              </button>
            </div>
          </div>

          {/* 导入功能 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📥 导入数据</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4">
                从备份文件恢复数据。请选择之前导出的 JSON 文件。
              </p>

              {/* 导入选项 */}
              <div className="mb-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mergeUsers"
                    checked={importOptions.mergeUsers}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, mergeUsers: e.target.checked }))}
                    className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                  />
                  <label htmlFor="mergeUsers" className="text-sm text-gray-700">
                    合并用户数据（推荐）
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="preserveCurrentUser"
                    checked={importOptions.preserveCurrentUser}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, preserveCurrentUser: e.target.checked }))}
                    className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                  />
                  <label htmlFor="preserveCurrentUser" className="text-sm text-gray-700">
                    保持当前登录状态
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="overwrite"
                    checked={importOptions.overwrite}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, overwrite: e.target.checked }))}
                    className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <label htmlFor="overwrite" className="text-sm text-gray-700">
                    完全覆盖现有数据 ⚠️
                  </label>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Upload size={20} />
                <span>{isImporting ? '导入中...' : '选择文件导入'}</span>
              </button>
            </div>
          </div>

          {/* 导入结果 */}
          {importResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              importResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {importResult.success ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <AlertCircle className="text-red-600" size={20} />
                )}
                <span className={`font-medium ${
                  importResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {importResult.success ? '导入成功！' : '导入失败'}
                </span>
              </div>
              <p className={`text-sm ${
                importResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {importResult.message}
              </p>
              {importResult.success && importResult.details && (
                <div className="mt-2 text-sm text-green-700">
                  <p>• 导入用户: {importResult.details.usersImported} 个</p>
                  <p>• 导入报告: {importResult.details.reportsImported} 个</p>
                  <p>• 导入指标: {importResult.details.metricsImported} 个</p>
                </div>
              )}
            </div>
          )}

          {/* 导出预览 */}
          {exportPreview && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="text-blue-600" size={20} />
                <span className="font-medium text-blue-800">导出完成！</span>
              </div>
              <div className="text-sm text-blue-700">
                <p>• 导出时间: {new Date(exportPreview.exportDate).toLocaleString()}</p>
                <p>• 用户数据: {exportPreview.metadata.totalUsers} 个用户</p>
                <p>• 检查报告: {exportPreview.metadata.totalReports} 个报告</p>
                <p>• 健康指标: {exportPreview.metadata.totalMetrics} 个指标</p>
                <p>• 图片数据: {exportPreview.metadata.imageDataIncluded ? '✅ 已包含' : '❌ 无图片'}</p>
                {exportPreview.metadata.imageDataIncluded && (
                  <p className="text-xs mt-1 text-blue-600">📸 包含用户头像和报告照片的完整数据</p>
                )}
              </div>
            </div>
          )}

          {/* 注意事项 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">注意事项：</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>导出的文件包含所有用户数据，请妥善保管</li>
                  <li>导入数据前建议先导出当前数据作为备份</li>
                  <li>导入完成后页面将自动刷新以更新数据</li>
                  <li>如遇问题，可以重新导入之前的备份文件</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
