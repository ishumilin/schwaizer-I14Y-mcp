/**
 * Formatting utilities for I14Y responses
 * @module utils/formatting
 */

/**
 * Format a successful tool response
 * @param {*} data - The data to return
 * @returns {Object} MCP-formatted response
 */
export function formatSuccess(data) {
  return {
    content: [
      {
        type: "text",
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Format an error response
 * @param {Error|string|Object} error - The error to format
 * @returns {Object} MCP-formatted error response
 */
export function formatError(error) {
  if (!error) {
    return {
      content: [{ type: 'text', text: 'Error: Unknown error' }],
      isError: true,
    };
  }

  let message = "";

  if (error instanceof Error) {
    message = error.message || "Unknown error";
    
    // Include HTTP status if available
    if (error.response && error.response.status) {
      message = `${error.response.status}: ${message}`;
    }
    
    // Handle validation errors with issues
    if (error.name === "ValidationError" && error.issues && Array.isArray(error.issues)) {
      const issueMessages = error.issues.map(issue => {
        const path = issue.path ? issue.path.join(".") : "unknown";
        return `${path}: ${issue.message}`;
      });
      message = `Validation Error:\n${issueMessages.join("\n")}`;
    }
  } else if (typeof error === "string") {
    message = error;
  } else if (error && error.message) {
    message = error.message;
  } else {
    message = "Unknown error";
  }

  return {
    content: [{ type: 'text', text: `Error: ${message}` }],
    isError: true,
  };
}

/**
 * Format pagination info
 * @param {number} page - Current page
 * @param {number} pageSize - Items per page
 * @param {number} totalItems - Total number of items
 * @returns {Object} Pagination metadata
 */
export function formatPaginationInfo(page, pageSize, totalItems) {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages - 1,
    hasPreviousPage: page > 0,
  };
}

/**
 * Format multilingual text
 * @param {Object} textObject - Object with language keys (de, fr, it, en, rm)
 * @param {string} preferredLanguage - Preferred language code
 * @returns {string} Text in preferred language or fallback
 */
export function formatMultilingualText(textObject, preferredLanguage = "de") {
  if (!textObject) return "";

  // Try preferred language first
  if (textObject[preferredLanguage]) {
    return textObject[preferredLanguage];
  }

  // Fallback order: de, en, fr, it, rm
  const fallbackOrder = ["de", "en", "fr", "it", "rm"];
  for (const lang of fallbackOrder) {
    if (textObject[lang]) {
      return textObject[lang];
    }
  }

  // Return first available value
  return Object.values(textObject)[0] || "";
}

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Format a list of items with summary
 * @param {Array} items - Array of items
 * @param {string} itemType - Type of items (e.g., 'concepts', 'datasets')
 * @param {Object} pagination - Pagination info
 * @returns {string} Formatted summary
 */
export function formatListSummary(items, itemType, pagination) {
  const summary = [
    `Found ${pagination.totalItems} ${itemType}`,
    `Showing page ${pagination.page + 1} of ${pagination.totalPages}`,
    `(${items.length} items on this page)`,
  ];

  return summary.join("\n");
}

/**
 * Format a catalog response
 * @param {Object} catalog - Catalog object
 * @returns {string} Formatted catalog text
 */
export function formatCatalogResponse(catalog) {
  const title = formatMultilingualText(catalog.title);
  const description = formatMultilingualText(catalog.description);

  return `Catalog: ${catalog.id}
Title: ${title}
${description ? `Description: ${description}` : ""}`;
}

/**
 * Format a concept response
 * @param {Object} concept - Concept object
 * @returns {string} Formatted concept text
 */
export function formatConceptResponse(concept) {
  const label = formatMultilingualText(concept.prefLabel);
  const definition = formatMultilingualText(concept.definition);

  return `Concept: ${concept.id}
Label: ${label}
${definition ? `Definition: ${definition}` : ""}`;
}

/**
 * Format a dataset response
 * @param {Object} dataset - Dataset object
 * @returns {string} Formatted dataset text
 */
export function formatDatasetResponse(dataset) {
  const title = formatMultilingualText(dataset.title);
  const description = formatMultilingualText(dataset.description);

  let result = `Dataset: ${dataset.id}
Title: ${title}
${description ? `Description: ${description}` : ""}`;

  if (dataset.distribution && dataset.distribution.length > 0) {
    result += "\nDistributions:";
    dataset.distribution.forEach((dist) => {
      result += `\n  - ${dist.format}: ${dist.accessURL}`;
    });
  }

  return result;
}

/**
 * Format a data service response
 * @param {Object} service - Data service object
 * @returns {string} Formatted service text
 */
export function formatDataServiceResponse(service) {
  const title = formatMultilingualText(service.title);
  const description = formatMultilingualText(service.description);

  return `Data Service: ${service.id}
Title: ${title}
${description ? `Description: ${description}` : ""}
${service.endpointURL ? `Endpoint: ${service.endpointURL}` : ""}`;
}

/**
 * Format a public service response
 * @param {Object} service - Public service object
 * @returns {string} Formatted service text
 */
export function formatPublicServiceResponse(service) {
  const name = formatMultilingualText(service.name);
  const description = formatMultilingualText(service.description);

  return `Public Service: ${service.id}
Name: ${name}
${description ? `Description: ${description}` : ""}`;
}

/**
 * Format a list response
 * @param {Array} items - Array of items
 * @param {Function} formatter - Formatter function for individual items
 * @param {Object} pagination - Optional pagination info
 * @returns {string} Formatted list text
 */
export function formatListResponse(items, formatter, pagination) {
  if (items.length === 0) {
    return "No items found";
  }

  let result = items.map(formatter).join("\n\n");

  if (pagination) {
    result += `\n\nPage ${pagination.page} of ${Math.ceil(pagination.total / pagination.limit)}`;
    result += `\nTotal: ${pagination.total}`;
  } else {
    // If no pagination info, just show the count of items
    result += `\n\nTotal: ${items.length}`;
  }

  return result;
}

/**
 * Format a concept result for display
 * @param {Object} concept - Concept object
 * @returns {string} Formatted concept text
 */
export function formatConceptResult(concept) {
  if (!concept) return "No concept data";

  const parts = [`Concept ID: ${concept.identifier || concept.id}`];

  if (concept.title) {
    const title = formatMultilingualText(concept.title);
    if (title) parts.push(`Title: ${title}`);
  }

  if (concept.description) {
    const description = formatMultilingualText(concept.description);
    if (description) parts.push(`Description: ${description}`);
  }

  if (concept.registrationStatus) {
    parts.push(`Status: ${concept.registrationStatus}`);
  }

  if (concept.publicationLevel) {
    parts.push(`Publication Level: ${concept.publicationLevel}`);
  }

  return parts.join("\n");
}

/**
 * Format a dataset result for display
 * @param {Object} dataset - Dataset object
 * @returns {string} Formatted dataset text
 */
export function formatDatasetResult(dataset) {
  if (!dataset) return "No dataset data";

  const parts = [`Dataset ID: ${dataset.identifier || dataset.id}`];

  if (dataset.title) {
    const title = formatMultilingualText(dataset.title);
    if (title) parts.push(`Title: ${title}`);
  }

  if (dataset.description) {
    const description = formatMultilingualText(dataset.description);
    if (description) parts.push(`Description: ${description}`);
  }

  if (dataset.publisher && dataset.publisher.name) {
    const publisherName = formatMultilingualText(dataset.publisher.name);
    if (publisherName) parts.push(`Publisher: ${publisherName}`);
  }

  if (dataset.accessRights) {
    parts.push(`Access Rights: ${dataset.accessRights}`);
  }

  if (dataset.distributions && dataset.distributions.length > 0) {
    parts.push("\nDistributions:");
    dataset.distributions.forEach((dist) => {
      parts.push(`  - ${dist.format}: ${dist.accessURL}`);
    });
  }

  return parts.join("\n");
}

/**
 * Format a data service result for display
 * @param {Object} service - Data service object
 * @returns {string} Formatted service text
 */
export function formatDataServiceResult(service) {
  if (!service) return "No service data";

  const parts = [`Service ID: ${service.identifier || service.id}`];

  if (service.title) {
    const title = formatMultilingualText(service.title);
    if (title) parts.push(`Title: ${title}`);
  }

  if (service.description) {
    const description = formatMultilingualText(service.description);
    if (description) parts.push(`Description: ${description}`);
  }

  if (service.endpointURL) {
    parts.push(`Endpoint: ${service.endpointURL}`);
  }

  if (service.accessRights) {
    parts.push(`Access Rights: ${service.accessRights}`);
  }

  return parts.join("\n");
}

/**
 * Format a public service result for display
 * @param {Object} service - Public service object
 * @returns {string} Formatted service text
 */
export function formatPublicServiceResult(service) {
  if (!service) return "No service data";

  const parts = [`Service ID: ${service.identifier || service.id}`];

  if (service.title) {
    const title = formatMultilingualText(service.title);
    if (title) parts.push(`Title: ${title}`);
  }

  if (service.description) {
    const description = formatMultilingualText(service.description);
    if (description) parts.push(`Description: ${description}`);
  }

  if (service.competentAuthority && service.competentAuthority.name) {
    const authorityName = formatMultilingualText(service.competentAuthority.name);
    if (authorityName) parts.push(`Authority: ${authorityName}`);
  }

  return parts.join("\n");
}
