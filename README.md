<div align="center">
  <img src="./logo.png" alt="Schwaizer Logo" width="100"/>
  <h1>Schwaizer</h1>
  <h2>MCP Server: I14Y Interoperability platform</h2>
  <p>
    <strong>An unofficial MCP server for interacting with the Swiss I14Y Interoperability Platform.</strong>
  </p>
  <p>
    <em>This is a community project by Schwaizer and is not an official implementation by the Swiss government.</em>
  </p>
</div>

---

### About Schwaizer

> SHAPING SWITZERLAND'S AI FUTURE
> Empowering Swiss businesses and society through responsible AI adoption.
> Founded in 2025, Schwaizer is a non-profit organization dedicated to accelerating the responsible adoption of artificial intelligence across Switzerland.

Website: https://www.schwaizer.ch

---

## Overview

The I14Y Interoperability Platform is Switzerland's national metadata catalog for promoting data interoperability across government agencies and organizations. This MCP server provides AI assistants with tools to search, retrieve, and export metadata about:

- **Concepts**: Standardized terms, code lists, and classifications
- **Datasets**: Data collections with their structures and distributions
- **Data Services**: APIs and data access endpoints
- **Public Services**: Government services and their delivery channels
- **Catalogs**: DCAT-compliant metadata exports

## Features

### Concept Tools
- `search_concepts` - Search for concepts with filters
- `get_concept` - Get detailed concept information
- `get_code_list_entries` - Get entries from code lists

### Dataset Tools
- `search_datasets` - Search for datasets with filters
- `get_dataset` - Get detailed dataset information

### Data Service Tools
- `search_data_services` - Search for data services (APIs)
- `get_data_service` - Get detailed service information

### Public Service Tools
- `search_public_services` - Search for public services
- `get_public_service` - Get detailed service information

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
# I14Y API Configuration
I14Y_API_BASE_URL=https://www.i14y.admin.ch/api/v1
I14Y_API_TOKEN=your_token_here_if_needed

# Server Configuration
LOG_LEVEL=info
DEFAULT_LANGUAGE=de
DEFAULT_PAGE_SIZE=20
API_TIMEOUT=30000
```

### Environment Variables

- `I14Y_API_BASE_URL` - Base URL for the I14Y API (default: https://www.i14y.admin.ch/api/v1)
- `I14Y_API_TOKEN` - Optional authentication token for protected endpoints
- `LOG_LEVEL` - Logging level: trace, debug, info, warn, error (default: info)
- `DEFAULT_LANGUAGE` - Default language for responses: de, fr, it, en, rm (default: de)
- `DEFAULT_PAGE_SIZE` - Default number of items per page (default: 20)
- `API_TIMEOUT` - API request timeout in milliseconds (default: 30000)

## Usage

### Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Example Queries

**Search for concepts by publisher:**
```
Search for concepts published by "CH_eHealth"
```

**Get dataset information:**
```
Get details for dataset with ID "004d6183-8135-4101-b998-2f9d9d58dc01"
```

**Get code list entries for a concept:**
```
Get code list entries for concept with ID "08dd632d-a98d-34ff-9252-123e46d6f053"
```

**Search datasets by publisher:**
```
Find all datasets published by the "CH1"
```

### Sample Workflow: Exploring Swiss Interoperability Data

**Objective:** To find and understand data related to a specific topic on the I14Y platform.

1.  **Discover Datasets:**
    *   **Goal:** Find datasets related to a topic of interest (e.g., "health").
    *   **Tool:** `search_datasets`
    *   **Action:** Call `search_datasets` with a query parameter to get a list of relevant datasets. This will provide dataset IDs, titles, and brief descriptions.

2.  **Get Detailed Dataset Information:**
    *   **Goal:** Understand the specifics of a chosen dataset.
    *   **Tool:** `get_dataset`
    *   **Action:** Use the ID from the previous step to call `get_dataset`. This will return detailed metadata, including information about the publisher, available data formats (distributions), and related concepts.

3.  **Explore Related Concepts:**
    *   **Goal:** Understand the terminology and data structures used in the dataset.
    *   **Tool:** `search_concepts`
    *   **Action:** Use keywords from the dataset description to `search_concepts`. This will help identify the core concepts that define the data.

4.  **Get Concept Details:**
    *   **Goal:** Get a precise definition of a concept.
    *   **Tool:** `get_concept`
    *   **Action:** Use a concept ID from the search results to call `get_concept`. This provides a full definition, version history, and other metadata.

5.  **Retrieve Code List Entries:**
    *   **Goal:** If a concept is a "CodeList" (i.e., it represents a set of predefined values), retrieve all possible values.
    *   **Tool:** `get_code_list_entries`
    *   **Action:** Call `get_code_list_entries` with the concept ID to get a list of all valid codes and their meanings. This is crucial for interpreting categorical data within a dataset.

6.  **Discover Related APIs and Services:**
    *   **Goal:** Find any APIs (Data Services) or Public Services related to the topic.
    *   **Tools:** `search_data_services` and `search_public_services`
    *   **Action:** Use relevant keywords to search for services. This can uncover programmatic ways to access data or interact with public administrative processes.

7.  **Get Service Details:**
    *   **Goal:** Understand how to use a discovered API or public service.
    *   **Tools:** `get_data_service` and `get_public_service`
    *   **Action:** Use the service ID to get detailed information, including endpoint URLs, documentation links, and contact points.

This workflow allows a user to move from a broad search to a detailed understanding of the data and services available on the I14Y platform, enabling them to effectively find, interpret, and utilize the information for their needs.

## API Documentation

The I14Y API documentation is available at:
- Main API: https://apiconsole.i14y.admin.ch/public/v1/index.html
- OpenAPI Spec: https://apiconsole.i14y.admin.ch/public/v1/Release.json

## Development

### Project Structure

```
schwaizer-I14Y/
├── src/
│   ├── index.js              # MCP server entry point
│   ├── config.js             # Configuration loader
│   ├── api/
│   │   ├── i14y-client.js    # I14Y API client
│   │   └── schemas.js        # Zod validation schemas
│   ├── tools/                # Tool implementations
│   │   ├── catalog-tools.js
│   │   ├── concept-tools.js
│   │   ├── dataset-tools.js
│   │   ├── data-service-tools.js
│   │   └── public-service-tools.js
│   └── utils/
│       ├── logger.js         # Logging utility
│       └── formatting.js     # Response formatting
├── tests/                    # Test files
├── docs/                     # Additional documentation
└── package.json
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Multilingual Support

The I14Y platform supports Switzerland's official languages:
- German (de) - Default
- French (fr)
- Italian (it)
- English (en)
- Romansh (rm)

Most tools accept a `language` parameter to specify the desired response language.

## Authentication

The I14Y API has both public and protected endpoints:
- **Public endpoints**: No authentication required (most read operations)
- **Protected endpoints**: Require an API token (write operations, some advanced features)

To access protected endpoints, obtain an API token from the I14Y platform administrators and set it in your `.env` file.

## Limitations

- Read-only access (no write/update operations)
- Rate limiting may apply (check I14Y API documentation)
- Some endpoints may require authentication
- Response sizes are limited by pagination

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Support

For issues related to:
- **This MCP server**: Open an issue on GitHub
- **I14Y API**: Contact the I14Y platform administrators i14y@bfs.admin.ch
