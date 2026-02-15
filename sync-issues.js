// Add  all repository issues to the project
import config from './mcp.json' with { type: 'json' };

const GITHUB_TOKEN = config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const GRAPHQL_URL = 'https://api.github.com/graphql';

async function graphql(query, variables = {}) {
    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });
    const data = await response.json();
    return data;
}

console.log('Fetching data...');

// Get project and issues
const query = `
    query {
        user(login: "bichota-tech") {
            projectsV2(first: 10) {
                nodes {
                    id
                    title
                    url
                    fields(first: 20) {
                        nodes {
                            ... on ProjectV2SingleSelectField {
                                id
                                name
                                options {
                                    id
                                    name
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
                    id
                    number
                    title
                    state
                }
            }
        }
    }
`;

const result = await graphql(query);
if (result.errors) {
    console.error('Error:', result.errors);
    process.exit(1);
}

const project = result.data.user.projectsV2.nodes.find(p => p.title === 'Butchery');
if (!project) {
    console.error('Project "Butchery" not found');
    process.exit(1);
}

const issues = result.data.repository.issues.nodes;
console.log(`\nProject: ${project.title} (${project.url})`);
console.log(`Issues to sync: ${issues.length}\n`);

const statusField = project.fields.nodes.find(f => f.name === 'Status');
const todoOption = statusField?.options.find(o => o.name === 'Todo');
const doneOption = statusField?.options.find(o => o.name === 'Done');

// Add each issue
const addMutation = `
    mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
            item {
                id
            }
        }
    }
`;

const updateMutation = `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
        updateProjectV2ItemFieldValue(input: {
            projectId: $projectId,
            itemId: $itemId,
            fieldId: $fieldId,
            value: { singleSelectOptionId: $optionId }
        }) {
            projectV2Item {
                id
            }
        }
    }
`;

for (const issue of issues) {
    // Add issue
    const addResult = await graphql(addMutation, {
        projectId: project.id,
        contentId: issue.id
    });

    if (addResult.errors) {
        console.log(`Issue #${issue.number}: ${addResult.errors[0].message}`);
        continue;
    }

    const itemId = addResult.data.addProjectV2ItemById.item.id;

    // Set status
    let targetOption = issue.state === 'CLOSED' ? doneOption : todoOption;
    if (targetOption && statusField) {
        await graphql(updateMutation, {
            projectId: project.id,
            itemId: itemId,
            fieldId: statusField.id,
            optionId: targetOption.id
        });
    }

    console.log(`✓ Issue #${issue.number} "${issue.title}" -> ${targetOption?.name || 'added'}`);
}

console.log(`\n✅ Successfully synced ${issues.length} issues to the project!`);
console.log(`\nProject URL: ${project.url}`);
console.log('\nNote: To rename columns to Spanish (Backlog, En Progreso, En Revisión, Completado),');
console.log('please visit the project settings in the GitHub UI.');
