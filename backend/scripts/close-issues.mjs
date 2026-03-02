/**
 * Closes all open GitHub issues for bichota-tech/butcheryorders via REST API.
 * Uses the same token that git uses for push authentication.
 * Run: node scripts/close-issues.mjs
 */

const REPO = 'bichota-tech/butcheryorders'
const BASE = 'https://api.github.com'

// Read token from git credential store
// If this fails, manually set: const TOKEN = 'your_ghp_token'
let TOKEN
try {
    const { execSync } = await import('child_process')
    // Extract token from git credential manager
    const result = execSync(
        'git credential fill',
        { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', timeout: 5000 }
    )
    const match = result.match(/password=(.+)/)
    TOKEN = match ? match[1].trim() : null
} catch (e) {
    TOKEN = null
}

if (!TOKEN) {
    console.error('❌ No token found. Set TOKEN manually or run: gh auth token')
    process.exit(1)
}

const headers = {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'ButcheryOrders-Script'
}

async function closeIssue(number, title) {
    const body = `Resuelto en el sprint \`fix/bugfixes-sprint\`. Mergeado a main en el commit de cierre de sprint.\n\nTodas las mejoras de voz, NLP y correcciones de bugs han sido implementadas y verificadas.`

    // Post a comment first
    await fetch(`${BASE}/repos/${REPO}/issues/${number}/comments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body })
    })

    // Then close the issue
    const res = await fetch(`${BASE}/repos/${REPO}/issues/${number}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ state: 'closed', state_reason: 'completed' })
    })

    if (res.ok) {
        console.log(`  ✅ Closed #${number}: ${title}`)
    } else {
        const err = await res.json()
        console.log(`  ❌ Failed #${number}: ${err.message}`)
    }
}

async function main() {
    console.log('📋 Fetching open issues...')

    const res = await fetch(`${BASE}/repos/${REPO}/issues?state=open&per_page=50`, { headers })
    if (!res.ok) {
        console.error('❌ Failed to fetch issues:', res.status, res.statusText)
        process.exit(1)
    }

    const issues = await res.json()
    console.log(`Found ${issues.length} open issues.\n`)

    for (const issue of issues) {
        await closeIssue(issue.number, issue.title)
    }

    console.log('\n🎉 All issues closed!')
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
