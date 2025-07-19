export function calculatePregnancyWeek(lastMenstrualPeriod: string): number {
  const lmp = new Date(lastMenstrualPeriod);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lmp.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

export function getDaysUntilDueDate(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getPregnancyTrimester(weeks: number): number {
  if (weeks <= 12) return 1;
  if (weeks <= 28) return 2;
  return 3;
}

export function formatPregnancyWeeks(weeks: number): string {
  const weekNum = Math.floor(weeks);
  const days = Math.floor((weeks - weekNum) * 7);
  return `${weekNum}周${days > 0 ? `${days}天` : ''}`;
}

export function getPregnancyMilestones(weeks: number): string[] {
  const milestones = [];
  
  if (weeks >= 4) milestones.push('胚胎着床');
  if (weeks >= 8) milestones.push('胎心开始跳动');
  if (weeks >= 12) milestones.push('进入相对安全期');
  if (weeks >= 16) milestones.push('可能感受到胎动');
  if (weeks >= 20) milestones.push('大排畸检查时期');
  if (weeks >= 24) milestones.push('胎儿存活率显著提高');
  if (weeks >= 28) milestones.push('进入孕晚期');
  if (weeks >= 32) milestones.push('胎儿肺部发育成熟');
  if (weeks >= 36) milestones.push('胎儿足月准备');
  
  return milestones;
}