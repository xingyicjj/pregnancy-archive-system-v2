2025-07-10 21:30
5. 修改文件：src/components/upload/UploadInterface.tsx
   - 豆包API内容始终赋值ocrContent并打印。
   - deepseek分析只用ocrContent。
   - summary只存deepseek摘要。
   - 前端只展示ocrContent、AI建议、summary三栏，顺序严格。 