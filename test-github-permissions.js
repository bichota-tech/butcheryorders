// Test GitHub API permissions comprehensively
import config from './mcp.json' with { type: 'json' };

const GITHUB_TOKEN = config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const GRAPHQL_URL = 'https://api.github.com/graphql';
const REST_URL = 'https://api.github.com';

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

async function restAPI(endpoint) {
    const response = await fetch(`${REST_URL}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github+json',
        },
    });
    return { status: response.status, data: await response.json() };
}

console.log('='.repeat(60));
console.log('GitHub Token Permission Diagnostic');
console.log('='.repeat(60));

// Test 1: Basic user info
console.log('\n1. Testing basic authentication...');
const userTest = await restAPI('/user');
console.log(`   Status: ${userTest.status}`);
if (userTest.status === 200) {
    console.log(`   ✓ Authenticated as: ${userTest.data.login}`);
} else {
    console.log(`   ✗ Failed:`, userTest.data.message);
}

// Test 2: Repository access
console.log('\n2. Testing repository access...');
const repoTest = await restAPI('/repos/bichota-tech/butcheryorders');
console.log(`   Status: ${repoTest.status}`);
if (repoTest.status === 200) {
    console.log(`   ✓ Can access repository: ${repoTest.data.full_name}`);
} else {
    console.log(`   ✗ Failed:`, repoTest.data.message);
}

// Test 3: Issues access
console.log('\n3. Testing issues access...');
const issuesTest = await restAPI('/repos/bichota-tech/butcheryorders/issues?per_page=1');
console.log(`   Status: ${issuesTest.status}`);
if (issuesTest.status === 200) {
    console.log(`   ✓ Can read issues (found ${issuesTest.data.length})`);
} else {
    console.log(`   ✗ Failed:`, issuesTest.data.message);
}

// Test 4: Projects access via GraphQL
console.log('\n4. Testing Projects (GraphQL)...');
const projectsQuery = `
    query {
        viewer {
            login
            projectsV2(first: 1) {
                totalCount
            }
        }
    }
`;
const projectsTest = await graphql(projectsQuery);
if (projectsTest.errors) {
    console.log('   ✗ GraphQL Error:', projectsTest.errors[0].message);
    console.log('   Type:', projectsTest.errors[0].type);
} else {
    console.log(`   ✓ Can access projects (total: ${projectsTest.data.viewer.projectsV2.totalCount})`);
}

// Test 5: Try to list user's projects via REST API (beta)
console.log('\n5. Testing Projects (REST API Beta)...');
const restProjectsTest = await restAPI('/users/bichota-tech/projects');
console.log(`   Status: ${restProjectsTest.status}`);
if (restProjectsTest.status === 200) {
    console.log(`   ✓ Can access projects via REST`);
} else {
    console.log(`   ✗ Failed:`, restProjectsTest.data.message || 'No message');
}

console.log('\n' + '='.repeat(60));
console.log('Summary:');
console.log('='.repeat(60));
console.log('\nThis token appears to be a FINE-GRAINED token.');
console.log('\nRequired permissions for this task:');
console.log('  • Repository: Read and Write access to Issues');
console.log('  • Account: Read and Write access to Projects');
console.log('\nTo fix, go to:');
console.log('https://github.com/settings/tokens/new');
console.log('\nCreate a CLASSIC token with scopes: repo, project');
console.log('OR update the fine-grained token to include Projects permissions.');
console.log('='.repeat(60));
