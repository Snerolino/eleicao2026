import { execFileSync } from 'node:child_process';

export function assertAuthoredWriterScope(root, allowedPrefixes = []) {
  const status = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  const dirty = status.split(/\r?\n/).filter(Boolean).map((line) => line.slice(3));
  const outside = dirty.filter((file) => !allowedPrefixes.some((prefix) => file === prefix || file.startsWith(`${prefix}/`)));
  if (outside.length > 0) {
    throw new Error(`authored_writer_scope_blocked:${outside.join(',')}`);
  }
  return dirty;
}
