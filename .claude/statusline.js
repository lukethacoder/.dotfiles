// Claude Code status line. Reads the status JSON on stdin and prints a single
// line: <dir> (<branch><dirty>) | <model> | ctx: <tokens> (<pct>%)
//
// The context segment is best-effort: token usage is not exposed by every
// Claude Code version, so we probe a few known field locations and simply omit
// the segment when none are present (never error out — a status line must
// always print *something*).
const { execSync } = require('node:child_process')

function readStdin() {
  try {
    return require('node:fs').readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

let data = {}
try {
  data = JSON.parse(readStdin() || '{}')
} catch {
  data = {}
}

const cwd = data.workspace?.current_dir || data.cwd || process.cwd()
const dir =
  cwd
    .replace(/[/\\]+$/, '')
    .split(/[/\\]/)
    .pop() || cwd

// Git branch + dirty flag, scoped to the workspace dir. Quiet on non-repos.
let gitSeg = ''
try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD', {
    cwd,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .toString()
    .trim()
  if (branch) {
    // --porcelain catches staged, unstaged, and untracked changes alike.
    let dirty = ''
    try {
      const status = execSync('git status --porcelain', {
        cwd,
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .toString()
        .trim()
      if (status) dirty = '*'
    } catch {
      // ignore — treat as clean
    }
    gitSeg = ` (${branch}${dirty})`
  }
} catch {
  // not a git repo — leave gitSeg empty
}

const model = data.model?.display_name || data.model?.id || ''

// Context usage — probe several shapes, newest-known first.
const CONTEXT_LIMIT = 200000
function num(v) {
  return typeof v === 'number' && isFinite(v) ? v : null
}
const cw = data.context_window || {}
let tokens =
  num(cw.total_input_tokens) != null || num(cw.total_output_tokens) != null
    ? (num(cw.total_input_tokens) || 0) + (num(cw.total_output_tokens) || 0)
    : (num(cw.used_tokens) ?? num(data.cost?.total_tokens) ?? null)
let pct = num(cw.used_percentage)
const limit = num(cw.context_window_size) || CONTEXT_LIMIT
if (pct == null && tokens != null) pct = (tokens / limit) * 100

let ctxSeg = ''
if (tokens != null || pct != null) {
  const parts = []
  if (tokens != null) parts.push(`${tokens.toLocaleString('en-US')} tok`)
  if (pct != null) parts.push(`${pct.toFixed(1)}%`)
  ctxSeg = ` | ctx: ${parts.join(' ')}`
}

const out = [dir + gitSeg, model].filter(Boolean).join(' | ') + ctxSeg
process.stdout.write(out)
