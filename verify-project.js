// Verify project setup
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
            projectsV2(first: 5) {
                nodes {
                    title
                    url
                    number
                    items(first: 100) {
                        totalCount
                        nodes {
                            content {
                                ... on Issue {
                                    number
                                    title
                                    state
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
                    fields(first: 20) {
                        nodes {
                            ... on ProjectV2SingleSelectField {
                                name
                                options {
                                    name
                                }
                            }
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
} else {
    const projects = result.data.user.projectsV2.nodes;
    const butchery = projects.find(p => p.title === 'Butchery');

    if (butchery) {
        console.log('\n✅ PROJECT FOUND');
        console.log(`Name: ${butchery.title}`);
        console.log(`URL: ${butchery.url}`);
        console.log(`Total Issues: ${butchery.items.totalCount}`);

        const statusField = butchery.fields.nodes.find(f => f.name === 'Status');
        if (statusField) {
            console.log('\n📊 Status Columns:');
            statusField.options.forEach(opt => console.log(`  - ${opt.name}`));
        }

        console.log('\n📋 Issues by Status:');
        const byStatus = {};
        butchery.items.nodes.forEach(item => {
            const status = item.fieldValues.nodes.find(fv => fv.field?.name === 'Status');
            const statusName = status?.name || '(No Status)';
            const issue = item.content;
            if (!byStatus[statusName]) byStatus[statusName] = [];
            byStatus[statusName].push(`#${issue.number} ${issue.title}`);
        });

        Object.entries(byStatus).forEach(([status, issues]) => {
            console.log(`\n  ${status}:`);
            issues.forEach(i => console.log(`    - ${i}`));
        });
    } else {
        console.log('❌ Project "Butchery" not found');
    }
}
