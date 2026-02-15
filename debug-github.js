
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
    return response.json();
}

async function main() {
    const query = `
        query {
            viewer {
                login
                id
            }
            organization(login: "bichota-tech") {
                login
                id
                repository(name: "butcheryorders") {
                    id
                    name
                }
            }
            user(login: "bichota-tech") {
                login
                id
                repository(name: "butcheryorders") {
                    id
                    name
                }
            }
        }
    `;

    console.log('Checking access...');
    const data = await graphql(query);
    console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
