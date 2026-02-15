// Fetch and document all issues from the Butchery project
import config from './mcp.json' with { type: 'json' };

const GITHUB_TOKEN = config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const GRAPHQL_URL = 'https://api.github.com/graphql';

async function graphql(query) {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });
    return response.json();
}

const query = `
    query {
        user(login: "bichota-tech") {
            projectsV2(first: 10) {
                nodes {
                    title
                    url
                    items(first: 100) {
                        nodes {
                            content {
                                ... on Issue {
                                    number
                                    title
                                    body
                                    state
                                    createdAt
                                    updatedAt
                                    labels(first: 10) {
                                        nodes {
                                            name
                                        }
                                    }
                                    assignees(first: 5) {
                                        nodes {
                                            login
                                        }
                                    }
                                }
                            }
                            fieldValues(first: 10) {
                                nodes {
                                    ... on ProjectV2ItemFieldSingleSelectValue {
                                        name
                                        field {
                                            ... on ProjectV2SingleSelectField {
                                                name
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        repository(owner: "bichota-tech", name: "butcheryorders") {
            issues(first: 100, states: [OPEN, CLOSED]) {
                nodes {
                    number
                    title
                    body
                    state
                    createdAt
                    updatedAt
                    labels(first: 10) {
                        nodes {
                            name
                        }
                    }
                    assignees(first: 5) {
                        nodes {
                            login
                        }
                    }
                }
            }
        }
    }
`;

const result = await graphql(query);
if (result.errors) {
    console.error('Errors:', result.errors);
    process.exit(1);
}

const project = result.data.user.projectsV2.nodes.find(p => p.title === 'Butchery');
const allIssues = result.data.repository.issues.nodes;

console.log('# Butchery Project - Issues Documentation\n');
console.log(`**Project URL:** ${project?.url || 'N/A'}\n`);
console.log(`**Total Repository Issues:** ${allIssues.length}\n`);
console.log(`**Issues in Project:** ${project?.items.nodes.length || 0}\n`);
console.log('---\n');

// Group issues by status
const byStatus = {};
if (project) {
    project.items.nodes.forEach(item => {
        const status = item.fieldValues.nodes.find(fv => fv.field?.name === 'Status');
        const statusName = status?.name || 'No Status';
        if (!byStatus[statusName]) byStatus[statusName] = [];
        byStatus[statusName].push(item.content);
    });
}

// Document all issues
allIssues.forEach(issue => {
    console.log(`## Issue #${issue.number}: ${issue.title}\n`);
    console.log(`**State:** ${issue.state}`);
    console.log(`**Created:** ${new Date(issue.createdAt).toLocaleDateString()}`);
    console.log(`**Updated:** ${new Date(issue.updatedAt).toLocaleDateString()}`);

    if (issue.labels.nodes.length > 0) {
        console.log(`**Labels:** ${issue.labels.nodes.map(l => l.name).join(', ')}`);
    }

    if (issue.assignees.nodes.length > 0) {
        console.log(`**Assignees:** ${issue.assignees.nodes.map(a => a.login).join(', ')}`);
    }

    // Find project status
    let projectStatus = 'Not in project';
    Object.entries(byStatus).forEach(([status, issues]) => {
        if (issues.find(i => i.number === issue.number)) {
            projectStatus = status;
        }
    });
    console.log(`**Project Status:** ${projectStatus}`);

    console.log('\n**Description:**');
    console.log(issue.body || 'No description provided');
    console.log('\n---\n');
});

// Summary by status
console.log('\n## Summary by Project Status\n');
Object.entries(byStatus).forEach(([status, issues]) => {
    console.log(`### ${status} (${issues.length})\n`);
    issues.forEach(issue => {
        console.log(`- #${issue.number}: ${issue.title}`);
    });
    console.log('');
});
