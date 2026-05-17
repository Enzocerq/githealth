const BUG_LABEL_RE = /bug|defeito|fix|hotfix|regression/i;
const BUG_TITLE_RE = /\b(bug|fix|hotfix|patch|regression)\b/i;
const FIX_PREFIX_RE = /^fix[:(]/i;
const BUG_BRANCH_RE = /^(fix|hotfix|bugfix)\//i;

/**
 * Determina se um item (PR, commit, issue) é uma correção de bug
 * com base no título, labels e branch name.
 */
export function isBugFix({
  title,
  labels = [],
  branch,
}: {
  title: string;
  labels?: string[];
  branch?: string;
}): boolean {
  if (labels.some((label) => BUG_LABEL_RE.test(label))) return true;
  if (FIX_PREFIX_RE.test(title) || BUG_TITLE_RE.test(title)) return true;
  if (branch && BUG_BRANCH_RE.test(branch)) return true;
  return false;
}
