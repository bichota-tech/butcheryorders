// Create comprehensive issues for the project
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
    if (data.errors) {
        console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2));
    }
    return data;
}

// List of issues to create based on project progress
const issues = [
    // COMPLETED ISSUES
    {
        title: "Setup Backend Infrastructure",
        body: `## Description
Complete Express API server with PostgreSQL database and authentication.

## Completed Work
- ✅ Express server setup
- ✅ PostgreSQL + Prisma ORM
- ✅ JWT authentication with refresh tokens
- ✅ Database migrations and schema
- ✅ Seed script with test data

## Related Commits
- b98703f: feat(backend): Add complete Express API with authentication and NLP`,
        labels: ["backend", "enhancement"],
        status: "Done"
    },
    {
        title: "Implement NLP Service for Voice Processing",
        body: `## Description
Natural language processing service to parse Spanish voice transcripts into orders.

## Completed Work
- ✅ NLP service implementation
- ✅ Spanish language processing
- ✅ Order extraction from voice commands
- ✅ Product and quantity recognition

## Related Commits
- b98703f: Backend implementation`,
        labels: ["backend", "AI/ML"],
        status: "Done"
    },
    {
        title: "Create Frontend State Management",
        body: `## Description
Setup Pinia stores and API service layer for frontend.

## Completed Work
- ✅ Pinia stores (auth, orders, products, voiceSession)
- ✅ API service layer with Axios
- ✅ Authentication service
- ✅ Voice recording composable

## Related Commits
- 1e1a9a3: feat(frontend): Add state management and API services`,
        labels: ["frontend", "enhancement"],
        status: "Done"
    },
    {
        title: "Build Authentication Views",
        body: `## Description
Create Login and Register views with form validation.

## Completed Work
- ✅ Login view
- ✅ Register view
- ✅ Form validation
- ✅ JWT token handling

## Related Commits
- 0c80f9e: feat(frontend): Add views and routing`,
        labels: ["frontend", "authentication"],
        status: "Done"
    },
    {
        title: "Setup GitHub Project Board",
        body: `## Description
Create and configure GitHub Project 'Butchery' for project management.

## Completed Work
- ✅ Created project at https://github.com/users/bichota-tech/projects/4
- ✅ Configured columns (Todo, In Progress, Done)
- ✅ Created automation scripts
- ✅ Updated README with project link

## Related Commits
- b28be64: feat: Add GitHub Project integration and utility scripts
- 6b317a4: docs: Add comprehensive project documentation`,
        labels: ["documentation", "project-management"],
        status: "Done"
    },
    {
        title: "Docker Containerization",
        body: `## Description
Setup Docker and docker-compose for easy deployment.

## Completed Work
- ✅ docker-compose.yml configuration
- ✅ Backend Dockerfile
- ✅ Multi-container setup
- ✅ Environment configuration

## Related Commits
- 0159a8c: chore: Add configuration and setup files`,
        labels: ["devops", "docker"],
        status: "Done"
    },
    {
        title: "Create Project Documentation",
        body: `## Description
Comprehensive technical documentation for the project.

## Completed Work
- ✅ DOCUMENTATION.md with API reference
- ✅ Architecture diagrams
- ✅ Database schema documentation
- ✅ Setup and deployment guides
- ✅ SETUP.md with installation instructions

## Related Commits
- 6b317a4: docs: Add comprehensive project documentation`,
        labels: ["documentation"],
        status: "Done"
    },

    // IN PROGRESS ISSUES
    {
        title: "Implement Voice-Powered Order Creation",
        body: `## Description
Complete the NewOrder view with voice recording and real-time processing.

## Progress
- ✅ NewOrder view created
- ✅ Voice recording composable
- 🔄 Voice-to-order conversion UI
- 🔄 Real-time feedback
- ⏳ Error handling

## Next Steps
- [ ] Polish UI/UX
- [ ] Add voice recording visualization
- [ ] Implement order confirmation flow`,
        labels: ["frontend", "voice", "in-progress"],
        status: "In Progress"
    },
    {
        title: "Update Dashboard Components",
        body: `## Description
Modernize dashboard, orderlist, and other core components.

## Progress
- ✅ Component updates committed
- 🔄 Integration with new API services
- ⏳ Real-time data updates

## Next Steps
- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Polish styling`,
        labels: ["frontend", "UI/UX", "in-progress"],
        status: "In Progress"
    },

    // TODO ISSUES
    {
        title: "Implement Unit Tests",
        body: `## Description
Add comprehensive unit tests for backend and frontend.

## Requirements
Backend (Vitest):
- [ ] API endpoint tests
- [ ] Service layer tests
- [ ] Middleware tests
- [ ] NLP service tests

Frontend:
- [ ] Component tests
- [ ] Store tests
- [ ] Composable tests`,
        labels: ["testing", "quality"],
        status: "Todo"
    },
    {
        title: "Setup E2E Testing with Playwright",
        body: `## Description
Implement end-to-end tests for critical user flows.

## Test Scenarios
- [ ] User registration and login
- [ ] Voice order creation
- [ ] Order management
- [ ] Product listing
- [ ] Error scenarios`,
        labels: ["testing", "e2e"],
        status: "Todo"
    },
    {
        title: "Setup CI/CD Pipeline",
        body: `## Description
Implement GitHub Actions for automated testing and deployment.

## Requirements
- [ ] GitHub Actions workflow
- [ ] Automated testing on PR
- [ ] Linting and code quality checks
- [ ] Automated deployment to staging
- [ ] Production deployment workflow`,
        labels: ["devops", "ci-cd"],
        status: "Todo"
    },
    {
        title: "Deploy to Production",
        body: `## Description
Deploy application to production environment.

## Tasks
- [ ] Choose hosting platforms (Vercel/Railway)
- [ ] Configure production database
- [ ] Set up environment variables
- [ ] Deploy backend API
- [ ] Deploy frontend
- [ ] Configure custom domain (optional)
- [ ] Setup monitoring`,
        labels: ["devops", "deployment"],
        status: "Todo"
    },
    {
        title: "Add Admin Dashboard",
        body: `## Description
Create admin panel for managing products, orders, and users.

## Features
- [ ] Admin authentication
- [ ] Product management (CRUD)
- [ ] Order oversight
- [ ] User management
- [ ] Analytics dashboard`,
        labels: ["frontend", "admin", "enhancement"],
        status: "Todo"
    },
    {
        title: "Implement Real-time Notifications",
        body: `## Description
Add real-time notifications for new orders and status updates.

## Technical Approach
- [ ] WebSocket implementation
- [ ] Push notifications
- [ ] Email notifications (optional)
- [ ] In-app notification center`,
        labels: ["backend", "frontend", "enhancement"],
        status: "Todo"
    }
];

console.log('Creating issues and adding to project...\n');

// Get repository and project IDs
const initQuery = `
    query {
        repository(owner: "bichota-tech", name: "butcheryorders") {
            id
        }
        user(login: "bichota-tech") {
            projectsV2(first: 10) {
                nodes {
                    id
                    title
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
    }
`;

const initResult = await graphql(initQuery);
const repoId = initResult.data.repository.id;
const project = initResult.data.user.projectsV2.nodes.find(p => p.title === 'Butchery');
const statusField = project.fields.nodes.find(f => f.name === 'Status');

console.log(`Repository ID: ${repoId}`);
console.log(`Project ID: ${project.id}`);
console.log(`Status Field ID: ${statusField.id}\n`);

// Create each issue
const createIssueMutation = `
    mutation($repoId: ID!, $title: String!, $body: String!) {
        createIssue(input: {
            repositoryId: $repoId
            title: $title
            body: $body
        }) {
            issue {
                id
                number
                title
            }
        }
    }
`;

const addToProjectMutation = `
    mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: {
            projectId: $projectId
            contentId: $contentId
        }) {
            item {
                id
            }
        }
    }
`;

const updateStatusMutation = `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
        updateProjectV2ItemFieldValue(input: {
            projectId: $projectId
            itemId: $itemId
            fieldId: $fieldId
            value: { singleSelectOptionId: $optionId }
        }) {
            projectV2Item {
                id
            }
        }
    }
`;

for (const issue of issues) {
    // Create issue
    const createResult = await graphql(createIssueMutation, {
        repoId,
        title: issue.title,
        body: issue.body
    });

    if (createResult.errors) {
        console.log(`❌ Failed to create: ${issue.title}`);
        continue;
    }

    const issueId = createResult.data.createIssue.issue.id;
    const issueNumber = createResult.data.createIssue.issue.number;

    // Add to project
    const addResult = await graphql(addToProjectMutation, {
        projectId: project.id,
        contentId: issueId
    });

    if (addResult.errors) {
        console.log(`❌ Failed to add #${issueNumber} to project`);
        continue;
    }

    const itemId = addResult.data.addProjectV2ItemById.item.id;

    // Set status
    const statusOption = statusField.options.find(o => o.name === issue.status);
    if (statusOption) {
        await graphql(updateStatusMutation, {
            projectId: project.id,
            itemId: itemId,
            fieldId: statusField.id,
            optionId: statusOption.id
        });
    }

    console.log(`✅ #${issueNumber}: ${issue.title} → ${issue.status}`);
}

console.log(`\n🎉 Successfully created ${issues.length} issues!`);
console.log(`\n📊 Project Board: https://github.com/users/bichota-tech/projects/4`);
