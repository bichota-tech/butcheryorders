
import config from './mcp.json' with { type: 'json' };

const GITHUB_TOKEN = config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN;

async function checkToken() {
    const response = await fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
        },
    });

    console.log('Status:', response.status);
    console.log('Scopes:', response.headers.get('x-oauth-scopes'));
    console.log('Token Type:', response.headers.get('x-github-token-type'));

    const data = await response.json();
    console.log('User:', data.login);
}

checkToken().catch(console.error);
