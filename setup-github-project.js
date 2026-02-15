
import config from './mcp.json' with { type: 'json' };

const GITHUB_TOKEN = config.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const REPO_OWNER = 'bichota-tech';
const REPO_NAME = 'butcheryorders';
const PROJECT_TITLE = 'Butchery';

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
    if (data.errors) {
        console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2));
        // Don't throw immediately, let caller handle potentially
        return { data: data.data, errors: data.errors };
    }
    return { data: data.data };
}

async function main() {
    console.log(`Starting setup for ${REPO_OWNER}/${REPO_NAME}...`);

    // 1. Get Repo ID and Owner ID
    const initQuery = `
        query($owner: String!, $repo: String!) {
            repository(owner: $owner, name: $repo) {
                id
                owner {
                    id
                }
                issues(first: 100, states: [OPEN, CLOSED]) {
                    nodes {
                        id
                        title
                        state
                        number
                    }
                }
            }
            user(login: $owner) {
                id
                projectsV2(first: 20) {
                    nodes {
                        id
                        title
                        url
                        number
                        fields(first: 20) {
                            nodes {
                                ... on ProjectV2SingleSelectField {
                                    id
                                    name
                                    options {
                                        id
                                        name
                                        color
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const { data: initData, errors: initErrors } = await graphql(initQuery, { owner: REPO_OWNER, repo: REPO_NAME });
    if (initErrors) {
        console.error("Init failed:", JSON.stringify(initErrors, null, 2));
        return;
    }

    const repoId = initData.repository.id;
    const ownerId = initData.user.id;
    const issues = initData.repository.issues.nodes;
    console.log(`Repo ID: ${repoId}, Owner ID: ${ownerId}, Issues found: ${issues.length}`);

    // Check if project exists
    let project = initData.user.projectsV2.nodes.find(p => p.title === PROJECT_TITLE);

    if (project) {
        console.log(`Project "${PROJECT_TITLE}" already exists: ${project.url}`);
    } else {
        console.log("Creating new project...");
        const createProjectMutation = `
            mutation($ownerId: ID!, $title: String!) {
                createProjectV2(input: { ownerId: $ownerId, title: $title }) {
                    projectV2 {
                        id
                        number
                        url
                        fields(first: 20) {
                            nodes {
                                ... on ProjectV2SingleSelectField {
                                    id
                                    name
                                    options {
                                        id
                                        name
                                        color
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        const { data: createData, errors: createErrors } = await graphql(createProjectMutation, { ownerId, title: PROJECT_TITLE });
        if (createErrors) {
            console.error("Create Project failed:", JSON.stringify(createErrors, null, 2));
            return;
        }
        project = createData.createProjectV2.projectV2;
        console.log(`Project created: ${project.url}`);
    }

    // 3. Configure Columns (Status Field)
    console.log('Configuring columns...');
    const statusField = project.fields.nodes.find(f => f.name === 'Status');
    if (!statusField) {
        console.error("Status field not found. Fields available:", project.fields.nodes.map(n => n.name));
        return;
    }

    // Prepare options update
    const newOptions = [];

    const todo = statusField.options.find(o => o.name === 'Todo' || o.name === 'To Do'); // Renaming Todo -> Backlog
    const inProgress = statusField.options.find(o => o.name === 'In Progress'); // Renaming In Progress -> En Progreso
    const done = statusField.options.find(o => o.name === 'Done'); // Renaming Done -> Completado

    // Check if already configured (idempotency)
    const existingBacklog = statusField.options.find(o => o.name === 'Backlog');
    const existingEnProgreso = statusField.options.find(o => o.name === 'En Progreso');
    const existingRevision = statusField.options.find(o => o.name === 'En Revisión');
    const existingCompletado = statusField.options.find(o => o.name === 'Completado');

    if (existingBacklog && existingEnProgreso && existingRevision && existingCompletado) {
        console.log("Columns already configured.");
        // We can skip update or just ensure order/colors
    } else {
        // Construct options list for update
        // 1. Backlog
        if (existingBacklog) newOptions.push({ id: existingBacklog.id, name: 'Backlog', color: 'GRAY', description: '' });
        else if (todo) newOptions.push({ id: todo.id, name: 'Backlog', color: 'GRAY', description: '' });
        else newOptions.push({ name: 'Backlog', color: 'GRAY', description: '' });

        // 2. En Progreso
        if (existingEnProgreso) newOptions.push({ id: existingEnProgreso.id, name: 'En Progreso', color: 'BLUE', description: '' });
        else if (inProgress) newOptions.push({ id: inProgress.id, name: 'En Progreso', color: 'BLUE', description: '' });
        else newOptions.push({ name: 'En Progreso', color: 'BLUE', description: '' });

        // 3. En Revisión
        if (existingRevision) newOptions.push({ id: existingRevision.id, name: 'En Revisión', color: 'PURPLE', description: '' });
        else newOptions.push({ name: 'En Revisión', color: 'PURPLE', description: '' });

        // 4. Completado
        if (existingCompletado) newOptions.push({ id: existingCompletado.id, name: 'Completado', color: 'GREEN', description: '' });
        else if (done) newOptions.push({ id: done.id, name: 'Completado', color: 'GREEN', description: '' });
        else newOptions.push({ name: 'Completado', color: 'GREEN', description: '' });

        const updateFieldMutation = `
            mutation($fieldId: ID!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {
                updateProjectV2Field(input: {
                    fieldId: $fieldId,
                    singleSelectOptions: $options
                }) {
                    projectV2Field {
                        ... on ProjectV2SingleSelectField {
                            id
                            options {
                                id
                                name
                            }
                        }
                    }
                }
            }
        `;

        const { data: updateData, errors: updateErrors } = await graphql(updateFieldMutation, {
            fieldId: statusField.id,
            options: newOptions
        });

        if (updateErrors) {
            console.error("Update Field failed:", JSON.stringify(updateErrors, null, 2));
            // Proceed anyway, maybe columns are partially correct
        } else {
            console.log("Columns updated successfully.");
            // Update local reference to options
            project.fields.nodes.find(f => f.name === 'Status').options = updateData.updateProjectV2Field.projectV2Field.options;
        }
    }

    // Refresh options for mapping
    const finalOptions = project.fields.nodes.find(f => f.name === 'Status').options;
    const optionMap = {
        backlog: finalOptions.find(o => o.name === 'Backlog'),
        enProgreso: finalOptions.find(o => o.name === 'En Progreso'),
        enRevision: finalOptions.find(o => o.name === 'En Revisión'),
        completado: finalOptions.find(o => o.name === 'Completado')
    };

    // 4. Sync Issues
    console.log('Syncing issues...');
    const addMutation = `
        mutation($projectId: ID!, $contentId: ID!) {
            addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
                item {
                    id
                }
            }
        }
    `;

    const updateItemMutation = `
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
        // Add item
        const { data: addData, errors: addErrors } = await graphql(addMutation, { projectId: project.id, contentId: issue.id });
        if (addErrors) {
            console.error(`Failed to add issue ${issue.number}:`, JSON.stringify(addErrors));
            continue;
        }

        const itemId = addData.addProjectV2ItemById.item.id;

        let targetOption = null;
        if (issue.state === 'CLOSED') {
            targetOption = optionMap.completado || optionMap.backlog; // Fallback
        } else {
            targetOption = optionMap.backlog;
        }

        if (targetOption) {
            const { errors: updateItemErrors } = await graphql(updateItemMutation, {
                projectId: project.id,
                itemId: itemId,
                fieldId: statusField.id,
                optionId: targetOption.id
            });
            if (updateItemErrors) {
                console.error(`Failed to update status for issue ${issue.number}:`, JSON.stringify(updateItemErrors));
            } else {
                console.log(`Issue #${issue.number} "${issue.title}" -> ${targetOption.name}`);
            }
        }
    }

    console.log('---------------------------------------------------');
    console.log('Setup Complete!');
    console.log(`Project Name: ${PROJECT_TITLE}`);
    console.log(`URL: ${project.url}`);
}

main().catch(console.error);
