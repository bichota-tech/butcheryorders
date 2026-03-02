// Check project configuration and views
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
                    id
                    title
                    url
                    public
                    readme
                    shortDescription
                    closed
                    number
                    views(first: 10) {
                        nodes {
                            id
                            name
                            layout
                            number
                        }
                    }
                    fields(first: 20) {
                        nodes {
                            ... on ProjectV2Field {
                                id
                                name
                            }
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
                    items(first: 10) {
                        totalCount
                        nodes {
                            id
                            content {
                                ... on Issue {
                                    number
                                    title
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
    console.error('❌ Errors:', JSON.stringify(result.errors, null, 2));
    process.exit(1);
}

const projects = result.data.user.projectsV2.nodes;
const butchery = projects.find(p => p.title === 'Butchery');

if (!butchery) {
    console.log('❌ Project "Butchery" not found\n');
    console.log('Available projects:');
    projects.forEach(p => {
        console.log(`  - ${p.title} (${p.url})`);
    });
    process.exit(1);
}

console.log('✅ PROJECT FOUND\n');
console.log(`Title: ${butchery.title}`);
console.log(`URL: ${butchery.url}`);
console.log(`Public: ${butchery.public ? 'Yes' : 'No (Private)'}`);
console.log(`Closed: ${butchery.closed ? 'Yes' : 'No'}`);
console.log(`Number: #${butchery.number}`);
console.log(`Total Items: ${butchery.items.totalCount}`);

console.log('\n📊 VIEWS:');
if (butchery.views.nodes.length === 0) {
    console.log('  ⚠️  No views configured!');
} else {
    butchery.views.nodes.forEach(view => {
        console.log(`  - ${view.name} (Layout: ${view.layout}, #${view.number})`);
    });
}

console.log('\n📋 FIELDS:');
butchery.fields.nodes.forEach(field => {
    if (field.options) {
        console.log(`  - ${field.name}:`);
        field.options.forEach(opt => {
            console.log(`    • ${opt.name}`);
        });
    } else {
        console.log(`  - ${field.name}`);
    }
});

console.log('\n💡 NEXT STEPS:');
if (!butchery.public) {
    console.log('⚠️  El proyecto es PRIVADO. Solo tú puedes verlo.');
    console.log('   Para hacerlo público: Settings → Danger Zone → Change visibility');
}

console.log('\n🔗 Direct link to project:');
console.log(`   ${butchery.url}`);
console.log('\n🔗 Board view (if available):');
console.log(`   ${butchery.url}?layout=board`);
console.log('\n🔗 Table view (if available):');
console.log(`   ${butchery.url}?layout=table`);
